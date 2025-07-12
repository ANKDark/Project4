<?php

namespace App\Http\Controllers\Admin;

use App\Events\AdminAccountUpdated;
use App\Events\AdminNotificationRT;
use App\Events\UserAccountUpdated;
use App\Http\Controllers\Controller;
use App\Models\AdminAccounts;
use App\Models\AdminNotification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AccountManagementController extends Controller
{
    public function addAdmin(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:adminaccounts',
            'password' => [
                'required',
                'string',
                'min:6',
                'regex:/^(?=.*[A-Z])(?=.*[\W_]).+$/'
            ],
            'phone' => [
                'required',
                'regex:/^\d{10}$/'
            ],
            'address' => 'required|string',
            'role' => 'required|in:0,1',
            'status' => 'required|in:0,1',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10000',
        ], [
            'name.required' => 'Không được để trống tên.',
            'name.string' => 'Tên phải là chuỗi ký tự.',
            'name.max' => 'Tên tối đa 255 ký tự.',
            'email.required' => 'Không được để trống email.',
            'email.email' => 'Email không đúng định dạng.',
            'email.unique' => 'Email đã tồn tại.',
            'password.required' => 'Không được để trống mật khẩu.',
            'password.min' => 'Mật khẩu tối thiểu 6 ký tự.',
            'password.regex' => 'Mật khẩu phải chứa ít nhất một chữ in hoa và một ký tự đặc biệt.',
            'phone.required' => 'Không được để trống số điện thoại.',
            'phone.regex' => 'Số điện thoại phải bao gồm đúng 10 chữ số.',
            'address.required' => 'Không được để trống địa chỉ.',
            'role.required' => 'Phân quyền là bắt buộc.',
            'role.in' => 'Phân quyền không hợp lệ.',
            'status.required' => 'Trạng thái là bắt buộc.',
            'status.in' => 'Trạng thái không hợp lệ.',
            'avatar.image' => 'File phải là hình ảnh.',
            'avatar.mimes' => 'Ảnh đại diện phải có định dạng jpeg, png, jpg, gif.',
            'avatar.max' => 'Ảnh đại diện không được vượt quá 10MB.',
        ]);

        $ImgName = null;
        if ($request->hasFile('avatar')) {
            $ImgName = $request->file('avatar')->store('Img/Admin/Avatar', 'public');
            $ImgName = "/storage/" . $ImgName;
        }

        $admin = new AdminAccounts();
        $admin->name = $request->input('name');
        $admin->email = $request->input('email');
        $admin->password = bcrypt($request->input('password'));
        $admin->phone = $request->input('phone');
        $admin->address = $request->input('address');
        $admin->role = $request->input('role');
        $admin->status = $request->input('status');
        $admin->avatar = $ImgName;
        $admin->save();

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Add";
        $notification->Content = "Thêm tài khoản quản trị: " . $admin->name;
        $notification->ActionTime = now();
        $notification->save();

        broadcast(new AdminAccountUpdated($admin, 'Add'))->toOthers();
        broadcast(new AdminNotificationRT($notification))->toOthers();

        return response()->json([
            'message' => 'Thêm tài khoản thành công.',
            'admin' => $admin,
        ], 201);
    }

    public function updateAdmin(Request $request)
    {
        $id = $request->input('id');
        $admin = AdminAccounts::find($id);

        if (!$admin) {
            return response()->json([
                'message' => 'Tài khoản admin không tồn tại.',
            ], 404);
        }

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:adminaccounts,email,' . $id,
            'phone' => [
                'required',
                'regex:/^\d{10}$/'
            ],
            'address' => 'required|string',
            'role' => 'required|in:0,1',
            'status' => 'required|in:0,1',
        ];

        if ($request->hasFile('avatar')) {
            $rules['avatar'] = 'nullable|image|mimes:jpeg,png,jpg,gif|max:10000';
        } else {
            $rules['avatar'] = 'nullable|string';
        }

        $messages = [
            'name.required' => 'Không được để trống tên.',
            'name.string' => 'Tên phải là chuỗi ký tự.',
            'name.max' => 'Tên tối đa 255 ký tự.',
            'email.required' => 'Không được để trống email.',
            'email.email' => 'Email không đúng định dạng.',
            'email.unique' => 'Email đã tồn tại.',
            'phone.required' => 'Không được để trống số điện thoại.',
            'phone.regex' => 'Số điện thoại phải bao gồm đúng 10 chữ số.',
            'address.required' => 'Không được để trống địa chỉ.',
            'role.required' => 'Phân quyền là bắt buộc.',
            'role.in' => 'Phân quyền không hợp lệ.',
            'status.required' => 'Trạng thái là bắt buộc.',
            'status.in' => 'Trạng thái không hợp lệ.',
            'avatar.image' => 'File phải là hình ảnh.',
            'avatar.mimes' => 'Ảnh đại diện phải có định dạng jpeg, png, jpg, gif.',
            'avatar.max' => 'Ảnh đại diện không được vượt quá 10MB.',
            'avatar.string' => 'Ảnh phải là chuỗi ký tự nếu không có tệp tải lên.',
        ];

        $validatedData = $request->validate($rules, $messages);

        $ImgName = null;
        if ($request->hasFile('avatar')) {
            $ImgName = $request->file('avatar')->store('Img/Admin/Avatar', 'public');
            $ImgName = "/storage/" . $ImgName;
        } elseif (is_string($request->input('avatar')) && str_starts_with($request->input('avatar'), '/storage/Img/Admin/Avatar/')) {
            $IMGName = $request->input('avatar');
        } else {
            $ImgName = $admin->avatar;
        }

        $password = $request->input('password') ? bcrypt($request->input('password')) : $admin->password;

        $admin->name = $request->input('name');
        $admin->email = $request->input('email');
        $admin->password = $password;
        $admin->phone = $request->input('phone');
        $admin->address = $request->input('address');
        $admin->role = $request->input('role');
        $admin->status = $request->input('status');
        $admin->avatar = $ImgName;
        $admin->save();

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Update";
        $notification->Content = "Cập nhật tài khoản admin: " . $admin->name;
        $notification->ActionTime = now();
        $notification->save();

        broadcast(new AdminAccountUpdated($admin, "Update"))->toOthers();
        broadcast(new AdminNotificationRT($notification))->toOthers();

        return response()->json([
            'message' => 'Cập nhật tài khoản admin thành công.',
            'admin' => $admin,
        ], 200);
    }

    public function deleteAdmin($id)
    {
        $admin = AdminAccounts::find($id);

        if (!$admin) {
            return response()->json([
                'message' => 'Tài khoản admin không tồn tại.',
            ], 404);
        }

        $oldAdmin = $admin->replicate();
        $oldAdmin->setAttribute('id', $admin->id);
        $admin->delete();

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Delete";
        $notification->Content = "Xóa tài khoản admin: " . $oldAdmin->name;
        $notification->ActionTime = now();
        $notification->save();

        broadcast(new AdminAccountUpdated($oldAdmin, "Delete"))->toOthers();
        broadcast(new AdminNotificationRT($notification))->toOthers();

        return response()->json([
            'message' => 'Xóa tài khoản admin thành công.',
            'admin_id' => $id,
        ], 200);
    }

    public function addUser(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => [
                'required',
                'string',
                'min:6',
                'regex:/^(?=.*[A-Z])(?=.*[\W_]).+$/'
            ],
            'status' => 'required|in:Active,Inactive',
            'profile_photo_path' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10000',
        ], [
            'name.required' => 'Họ và tên không được để trống.',
            'name.string' => 'Họ và tên phải là chuỗi ký tự.',
            'name.max' => 'Họ và tên không được vượt quá 255 ký tự.',
            'email.required' => 'Email không được để trống.',
            'email.string' => 'Email phải là chuỗi ký tự.',
            'email.email' => 'Email không đúng định dạng.',
            'email.max' => 'Email không được vượt quá 255 ký tự.',
            'email.unique' => 'Email đã tồn tại trong hệ thống.',
            'password.required' => 'Mật khẩu không được để trống.',
            'password.string' => 'Mật khẩu phải là chuỗi ký tự.',
            'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự.',
            'password.regex' => 'Mật khẩu phải chứa ít nhất 1 chữ in hoa và 1 ký tự đặc biệt.',
            'status.required' => 'Trạng thái là bắt buộc.',
            'status.in' => 'Trạng thái không hợp lệ.',
            'profile_photo_path.image' => 'Ảnh đại diện phải là tệp hình ảnh.',
            'profile_photo_path.mimes' => 'Ảnh đại diện phải có định dạng jpeg, png, jpg hoặc gif.',
            'profile_photo_path.max' => 'Ảnh đại diện không được vượt quá 10MB.',
        ]);

        $ImgName = null;
        if ($request->hasFile('profile_photo_path')) {
            $ImgName = $request->file('profile_photo_path')->store('Img/Profile', 'public');
            $ImgName = "/storage/" . $ImgName;
        }

        $user = new User;
        $user->name = $request->input('name');
        $user->email = $request->input('email');
        $user->password = bcrypt($request->input('password'));
        $user->status = $request->input('status');
        $user->profile_photo_path = $ImgName;
        $user->save();

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Add";
        $notification->Content = "Thêm tài khoản người dùng: " . $user->name;
        $notification->ActionTime = now();
        $notification->save();

        broadcast(new UserAccountUpdated($user, "Add"))->toOthers();
        broadcast(new AdminNotificationRT($notification))->toOthers();

        return response()->json([
            'message' => 'Thêm tài khoản người dùng thành công.',
            'user' => $user,
        ], 201);
    }

    public function updateUser(Request $request)
    {
        $id = $request->input('id');
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'Tài khoản người dùng không tồn tại.',
            ], 404);
        }

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'status' => 'required|in:Active,Inactive',
        ];
        Log::info('Request data for updating user: ', $request->all());
        if ($request->hasFile('profile_photo_path')) {
            $rules['profile_photo_path'] = 'nullable|image|mimes:jpeg,png,jpg,gif|max:10000';
        } else {
            $rules['profile_photo_path'] = 'nullable|string';
        }

        $messages = [
            'name.required' => 'Họ và tên không được để trống.',
            'name.string' => 'Họ và tên phải là chuỗi ký tự.',
            'name.max' => 'Họ và tên không được vượt quá 255 ký tự.',
            'email.required' => 'Email không được để trống.',
            'email.string' => 'Email phải là chuỗi ký tự.',
            'email.email' => 'Email không đúng định dạng.',
            'email.max' => 'Email không được vượt quá 255 ký tự.',
            'email.unique' => 'Email đã tồn tại trong hệ thống.',
            'status.required' => 'Trạng thái là bắt buộc.',
            'status.in' => 'Trạng thái không hợp lệ.',
            'profile_photo_path.image' => 'Ảnh đại diện phải là tệp hình ảnh.',
            'profile_photo_path.mimes' => 'Ảnh đại diện phải có định dạng jpeg, png, jpg hoặc gif.',
            'profile_photo_path.max' => 'Ảnh đại diện không được vượt quá 10MB.',
            'profile_photo_path.string' => 'Ảnh đại diện phải là chuỗi ký tự.',
        ];

        $validatedData = $request->validate($rules, $messages);

        $ImgName = null;
        if ($request->hasFile('profile_photo_path')) {
            $ImgName = $request->file('profile_photo_path')->store('Img/Profile', 'public');
            $ImgName = "/storage/" . $ImgName;
        } elseif (is_string($request->input('profile_photo_path')) && str_starts_with($request->input('profile_photo_path'), '/storage/Img/Profile/')) {
            $ImgName = $request->input('profile_photo_path');
        } else {
            $ImgName = $user->profile_photo_path;
        }

        $password = $request->input('password') ? bcrypt($request->input('password')) : $user->password;

        $user->name = $request->input('name');
        $user->email = $request->input('email');
        $user->password = $password;
        $user->status = $request->input('status');
        $user->profile_photo_path = $ImgName;
        $user->save();

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Update";
        $notification->Content = "Cập nhật tài khoản người dùng: " . $user->name;
        $notification->ActionTime = now();
        $notification->save();

        broadcast(new UserAccountUpdated($user, "Update"))->toOthers();
        broadcast(new AdminNotificationRT($notification))->toOthers();

        return response()->json([
            'message' => 'Cập nhật tài khoản người dùng thành công.',
            'user' => $user,
        ], 200);
    }

    public function deleteUser($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'Tài khoản người dùng không tồn tại.',
            ], 404);
        }

        $oldUser = $user->replicate();
        $oldUser->setAttribute('id', $user->id);
        $user->delete();

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Delete";
        $notification->Content = "Xóa tài khoản người dùng: " . $oldUser->name;
        $notification->ActionTime = now();
        $notification->save();

        broadcast(new UserAccountUpdated($oldUser, "Delete"))->toOthers();
        broadcast(new AdminNotificationRT($notification))->toOthers();

        return response()->json([
            'message' => 'Xóa tài khoản người dùng thành công.',
            'user_id' => $id,
        ], 200);
    }
}