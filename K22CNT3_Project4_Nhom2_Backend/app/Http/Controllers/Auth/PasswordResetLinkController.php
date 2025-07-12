<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class PasswordResetLinkController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ], [
            'email.required' => 'Email không được để trống.',
            'email.email' => 'Email không đúng định dạng.',
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status == Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => __('Chúng tôi đã gửi liên kết đặt lại mật khẩu tới email của bạn.'),
                'status' => 'success'
            ], 200);
        }

        throw ValidationException::withMessages([
            'email' => [__('Chúng tôi không tìm thấy người dùng với email này. Vui lòng kiểm tra lại.')],
        ]);
    }
}