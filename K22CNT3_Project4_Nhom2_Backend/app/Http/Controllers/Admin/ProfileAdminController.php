<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAccounts;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProfileAdminController extends Controller
{
    public function profileManagement()
    {
        $currentAdmin = Auth::guard('admin')->user();

        if (!$currentAdmin) {
            return response()->json(['message' => 'Chưa đăng nhập.'], 401);
        }

        return response()->json([
            'currentAdmin' => $currentAdmin,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $id = $request->input('id');
        $name = $request->input('name');
        $email = $request->input('email');
        $phone = $request->input('phone');
        $address = $request->input('address');

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:adminaccounts,email,' . Auth::guard('admin')->id(),
            'phone' => 'nullable|digits:10',
            'avatar' => 'nullable',
            'address' => 'nullable|string|max:255',
        ], [
            'name.required' => 'Không được để trống tên.',
            'email.required' => 'Không được để trống email.',
            'email.email' => 'Email không hợp lệ.',
            'email.unique' => 'Email đã được sử dụng.',
            'phone.digits' => 'Số điện thoại phải đúng 10 chữ số.',
            'address.max' => 'Địa chỉ tối đa 255 ký tự.',
        ]);

        $admin = AdminAccounts::find($id);
        if (!$admin) {
            return response()->json(['message' => 'Admin không tồn tại.'], 404);
        }

        $ImgName = $admin->avatar;
        if ($request->hasFile('avatar')) {
            $ImgName = $request->file('avatar')->store('Img/Admin/Avatar', 'public');
            $ImgName = "/storage/" . $ImgName;
        } else if (is_string($request->input('avatar'))) {
            $ImgName = $request->input('avatar');
        }

        $admin->name = $name;
        $admin->email = $email;
        $admin->phone = $phone;
        $admin->address = $address;
        $admin->avatar = $ImgName;
        $admin->save();

        return response()->json([
            'message' => 'Cập nhật thông tin thành công.',
            'admin' => $admin
        ]);
    }
}
