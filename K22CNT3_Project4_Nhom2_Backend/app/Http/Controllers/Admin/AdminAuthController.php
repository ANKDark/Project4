<?php

namespace App\Http\Controllers\Admin;

use App\Events\AdminNotificationRT;
use App\Events\AdminOfflineUpdated;
use App\Events\AdminOnlineUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\AdminLoginRequest;
use App\Models\AdminAccounts;
use App\Models\AdminNotification;
use Illuminate\Http\Request;
use App\Mail\AdminOtpMail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Helpers\OnlineAdminManager;
use Illuminate\Support\Facades\Log;

class AdminAuthController extends Controller
{
    public function login(AdminLoginRequest $request)
    {
        try {
            $request->authenticate();

            $email = $request->input('email');
            $otp_code = rand(100000, 999999);

            Cache::put('otp_' . $email, $otp_code, now()->addMinutes(5));
            Mail::to($email)->send(new AdminOtpMail($otp_code));

            session(['otp_email' => $email]);

            return response()->json([
                'message' => 'Mã OTP đã được gửi đến email của bạn.',
                'email' => $email,
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Admin login error: ' . $e->getMessage(), [
                'email' => $request->input('email'),
                'exception' => $e,
            ]);
            return response()->json([
                'message' => 'Kiểm tra lại tài khoản hoặc mật khẩu.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function verifyOtp(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'otp_code' => 'required|string',
            ], [
                'email.required' => 'Email là bắt buộc.',
                'email.email' => 'Email không hợp lệ.',
                'otp_code.required' => 'Mã OTP là bắt buộc.',
            ]);

            $email = $request->input('email');
            $cachedOtp = Cache::get('otp_' . $email);

            if (!$cachedOtp) {
                return response()->json([
                    'message' => 'Mã OTP đã hết hạn hoặc không hợp lệ.',
                    'errors' => ['otp_code_expired' => 'Mã OTP đã hết hạn hoặc không hợp lệ.'],
                ], 422);
            }

            if ($request->otp_code != $cachedOtp) {
                return response()->json([
                    'message' => 'Mã OTP không chính xác.',
                    'errors' => ['otp_code' => 'Mã OTP không chính xác.'],
                ], 422);
            }

            Cache::forget('otp_' . $email);

            $admin = AdminAccounts::where('email', $email)->first();
            if (!$admin) {
                return response()->json([
                    'message' => 'Không tìm thấy tài khoản.',
                    'errors' => ['email_account' => 'Không tìm thấy tài khoản.'],
                ], 422);
            }

            $token = auth('admin')->login($admin);

            $notification = new AdminNotification();
            $notification->AdminId = $admin->id;
            $notification->Type = "Login";
            $notification->Content = "đã đăng nhập.";
            $notification->ActionTime = now();
            $notification->save();

            broadcast(new AdminNotificationRT($notification))->toOthers();
            OnlineAdminManager::add($admin);
            broadcast(new AdminOnlineUpdated($admin));

            return response()->json([
                'message' => 'Xác thực thành công, bạn đã được đăng nhập.',
                'admin' => $admin,
                'token' => $token,
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi xác thực OTP.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function logout()
    {
        try {
            $admin = auth('admin')->user();
            if ($admin) {
                OnlineAdminManager::remove($admin->id);
                broadcast(new AdminOfflineUpdated($admin));

                $notification = new AdminNotification();
                $notification->AdminId = $admin->id;
                $notification->Type = "Logout";
                $notification->Content = "đã đăng xuất.";
                $notification->ActionTime = now();
                $notification->save();

                broadcast(new AdminNotificationRT($notification))->toOthers();
                auth('admin')->logout();
            }

            return response()->json([
                'message' => 'Đăng xuất thành công.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi đăng xuất.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getAdminData(Request $request)
    {
        $admin = auth('admin')->user();
        if (!$admin) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $notifications = AdminNotification::where('AdminId', $admin->id)
            ->orderBy('ActionTime', 'desc')
            ->get();

        $listadmin = AdminAccounts::select('id', 'name', 'avatar', 'email', 'role')->get();

        return response()->json([
            'admin' => $admin,
            'notifications' => $notifications,
            'listadmin' => $listadmin,
        ], 200);
    }

    public function updatePassword(Request $request)
    {
        try {
            $currentAdmin = auth('admin')->user();
            if (!$currentAdmin) {
                return response()->json([
                    'message' => 'Bạn cần đăng nhập để đổi mật khẩu.',
                ], 401);
            }

            $request->validate([
                'current_password' => 'required',
                'new_password' => [
                    'required',
                    'min:6',
                    'regex:/^(?=.*[A-Z])(?=.*[\W_]).+$/',
                ],
                'confirm_password' => 'required|same:new_password',
            ], [
                'current_password.required' => 'Mật khẩu hiện tại là bắt buộc.',
                'new_password.required' => 'Mật khẩu mới là bắt buộc.',
                'new_password.min' => 'Mật khẩu mới phải có ít nhất 6 ký tự.',
                'new_password.regex' => 'Mật khẩu mới phải chứa ít nhất một ký tự viết hoa và một ký tự đặc biệt.',
                'confirm_password.required' => 'Xác nhận mật khẩu là bắt buộc.',
                'confirm_password.same' => 'Mật khẩu xác nhận không khớp với mật khẩu mới.',
            ]);

            if (!Hash::check($request->input('current_password'), $currentAdmin->password)) {
                return response()->json([
                    'message' => 'Mật khẩu hiện tại không chính xác.',
                    'errors' => ['current_password' => 'Mật khẩu hiện tại không chính xác.'],
                ], 422);
            }

            $adminChangePassword = AdminAccounts::find($currentAdmin->id);
            if (!$adminChangePassword) {
                return response()->json([
                    'message' => 'Admin không tồn tại.',
                    'errors' => ['error' => 'Admin không tồn tại.'],
                ], 422);
            }

            $adminChangePassword->password = Hash::make($request->input('new_password'));
            $adminChangePassword->save();

            return response()->json([
                'message' => 'Mật khẩu đã được cập nhật thành công.',
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi cập nhật mật khẩu.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}