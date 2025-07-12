<?php

namespace App\Http\Controllers\Admin;

use App\Events\AdminNotificationRT;
use App\Events\UniversityManagerUpdated;
use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use App\Models\Truong;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UnvManagementController extends Controller
{
    public function editUnv(Request $request)
    {
        $Id = $request->input('Id');
        $TenTruong = $request->input('TenTruong');
        $NamThanhLap = $request->input('NamThanhLap');
        $IdCategory = $request->input('IdCategory');
        $Is_verified = $request->input('Is_verified');
        $MoTaTruong = $request->input('MoTaTruong');
        $Img = $request->input('Img');

        $rules = [
            'Id' => 'required|integer|exists:Truong,Id',
            'TenTruong' => 'required|string|max:255',
            'NamThanhLap' => 'required|digits:4|integer|min:1800|max:' . date('Y'),
            'IdCategory' => 'required|integer',
            'Is_verified' => 'required|boolean',
            'MoTaTruong' => 'required|string|max:4294967295',
        ];

        if ($request->hasFile('Img')) {
            $rules['Img'] = 'nullable|image|mimes:jpeg,png,jpg,gif|max:10000';
        } else {
            $rules['Img'] = 'nullable|string';
        }

        $messages = [
            'Id.required' => 'Không được để trống Id.',
            'Id.integer' => 'Id trường phải là số nguyên.',
            'Id.exists' => 'Id trường không tồn tại.',

            'TenTruong.required' => 'Không được để trống tên trường.',
            'TenTruong.string' => 'Tên trường phải là chuỗi ký tự.',
            'TenTruong.max' => 'Tên trường tối đa 255 ký tự.',

            'NamThanhLap.required' => 'Không được để trống năm thành lập.',
            'NamThanhLap.digits' => 'Năm thành lập phải là 4 chữ số.',
            'NamThanhLap.integer' => 'Năm thành lập phải là số nguyên.',
            'NamThanhLap.min' => 'Năm thành quá nhỏ.',
            'NamThanhLap.max' => 'Năm thành lập không được vượt quá năm nay.',

            'IdCategory.required' => 'Không được để trống danh mục.',
            'IdCategory.integer' => 'Id danh mục phải là số nguyên.',

            'Is_verified.required' => 'Không được để trống xác thực.',
            'Is_verified.boolean' => 'Xác thực phải là true hoặc false.',

            'MoTaTruong.required' => 'Không được để trống mô tả.',
            'MoTaTruong.string' => 'Mô tả phải là chuỗi ký tự.',
            'MoTaTruong.max' => 'Mô tả tối đa 4294967295 ký tự.',

            'Img.image' => 'Tệp phải là hình ảnh.',
            'Img.mimes' => 'Hình ảnh phải là định dạng jpeg, png, jpg hoặc gif.',
            'Img.max' => 'Kích thước ảnh tối đa là 10MB.',
            'Img.string' => 'Ảnh phải là chuỗi ký tự nếu không có tệp tải lên.',
        ];

        $validatedData = $request->validate($rules, $messages);

        $ImgName = null;
        if ($request->hasFile('Img')) {
            $ImgName = $request->file('Img')->store('Img/University', 'public');
            $ImgName = "/storage/" . $ImgName;
        } elseif (is_string($Img) && str_starts_with($Img, '/storage/Img/University/')) {
            $ImgName = $Img;
        } else {
            $truong = Truong::find($Id);
            $ImgName = $truong->Img;
        }

        $truong = Truong::find($Id);
        $truong->TenTruong = $TenTruong;
        $truong->NamThanhLap = $NamThanhLap;
        $truong->IdCategory = $IdCategory;
        $truong->Is_verified = $Is_verified;
        $truong->MoTaTruong = $MoTaTruong;
        $truong->Img = $ImgName;
        $truong->save();

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Update";
        $notification->Content = "Cập nhật trường: " . $TenTruong;
        $notification->ActionTime = Date('Y-m-d H:i:s');
        $notification->save();

        broadcast(new UniversityManagerUpdated($truong, "Update"))->toOthers();
        broadcast(new AdminNotificationRT($notification))->toOthers();
        response()->json(['message' => 'Cập nhật trường thành công'], 200);
    }

    public function deleteUnv($id)
    {
        $truong = Truong::find($id);
        $oldTruong = $truong->replicate();
        $oldTruong->setAttribute('Id', $truong->Id);
        $truong->delete();

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Delete";
        $notification->Content = "Xóa trường: " . $truong->TenTruong;
        $notification->ActionTime = Date('Y-m-d H:i:s');
        $notification->save();

        broadcast(new UniversityManagerUpdated($oldTruong, "Delete"))->toOthers();
        broadcast(new AdminNotificationRT($notification))->toOthers();
        return response()->json(['message' => 'Xóa trường thành công'], 200);
    }

    public function addUnv(Request $request)
    {
        $TenTruong = $request->input('TenTruong');
        $NamThanhLap = $request->input('NamThanhLap');
        $IdCategory = $request->input('IdCategory');
        $Is_verified = $request->input('Is_verified');
        $MoTaTruong = $request->input('MoTaTruong');
        $Img = $request->input('Img');

        $validatedData = $request->validate([
            'TenTruong' => 'required|string|max:255',
            'NamThanhLap' => 'required|digits:4|integer|min:1800|max:' . date('Y'),
            'IdCategory' => 'required|integer',
            'Is_verified' => 'required|boolean',
            'MoTaTruong' => 'required|string|max:4294967295',
            'Img' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10000',
        ], [
            'TenTruong.required' => 'Không được để trống tên trường.',
            'TenTruong.string' => 'Tên trường phải là chuỗi ký tự.',
            'TenTruong.max' => 'Tên trường tối đa 255 ký tự.',

            'NamThanhLap.required' => 'Không được để trống năm thành lập.',
            'NamThanhLap.digits' => 'Năm thành lập phải là 4 chữ số.',
            'NamThanhLap.integer' => 'Năm thành lập phải là số nguyên.',
            'NamThanhLap.min' => 'Năm thành quá nhỏ.',
            'NamThanhLap.max' => 'Năm thành lập không được vượt quá năm nay.',

            'IdCategory.required' => 'Không được để trống danh mục.',
            'IdCategory.integer' => 'Id danh mục phải là số nguyên.',

            'Is_verified.required' => 'Không được để trống xác thực.',
            'Is_verified.boolean' => 'Xác thực phải là true hoặc false.',

            'MoTaTruong.required' => 'Không được để trống mô tả.',
            'MoTaTruong.string' => 'Mô tả phải là chuỗi ký tự.',
            'MoTaTruong.max' => 'Mô tả tối đa 4294967295 ký tự.',

            'Img.image' => 'Tệp phải là hình ảnh.',
            'Img.mimes' => 'Hình ảnh phải là định dạng jpeg, png, jpg hoặc gif.',
            'Img.max' => 'Kích thước ảnh tối đa là 10MB.',
            'Img.string' => 'Ảnh phải là chuỗi ký tự nếu không có tệp tải lên.',
        ]);

        $ImgName = null;
        if ($request->hasFile('Img')) {
            $ImgName = $request->file('Img')->store('Img/University', 'public');
            $ImgName = "/storage/" . $ImgName;
        }

        $truong = new Truong();
        $truong->TenTruong = $TenTruong;
        $truong->NamThanhLap = $NamThanhLap;
        $truong->IdCategory = $IdCategory;
        $truong->Is_verified = $Is_verified;
        $truong->MoTaTruong = $MoTaTruong;
        $truong->Img = $ImgName;
        $truong->save();

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Add";
        $notification->Content = "Thêm trường: " . $TenTruong;
        $notification->ActionTime = Date('Y-m-d H:i:s');
        $notification->save();

        broadcast(new UniversityManagerUpdated($truong, "Add"))->toOthers();
        broadcast(new AdminNotificationRT($notification))->toOthers();
        response()->json(['message' => 'Thêm trường thành công'], 200);
    }

    public function changeVerifiedStatus(Request $request, $id)
    {
        $truong = Truong::find($id);
        if ($truong) {
            $truong->Is_verified = !$truong->Is_verified;
            $truong->save();

            $notification = new AdminNotification;
            $notification->AdminId = Auth::guard('admin')->user()->id;
            $notification->Type = "Update";
            $notification->Content = "Cập nhật trạng thái xác thực trường: " . $truong->TenTruong;
            $notification->ActionTime = Date('Y-m-d H:i:s');
            $notification->save();

            broadcast(new UniversityManagerUpdated($truong, "Update"))->toOthers();
            broadcast(new AdminNotificationRT($notification))->toOthers();
        }
    }
}
