<?php

namespace App\Http\Controllers;

use App\Models\SuggestionWebsite;
use App\Models\SystemError;
use App\Models\Truong;
use App\Models\ViolationReport;
use Illuminate\Http\Request;

class SupportUserController extends Controller
{
    public function SuggestUniversities(Request $request)
    {
        $name = $request->input('name');
        $description = $request->input('description');
        $established = $request->input('established');
        $image = $request->input('image');

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:4294967295',
            'established' => 'required|integer|min:1000|max:9999',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ], [
            'name.required' => 'Tên không được để trống.',
            'name.string' => 'Tên phải là chuỗi ký tự.',
            'name.max' => 'Tên tối đa 255 ký tự.',

            'description.required' => 'Mô tả không được để trống.',
            'description.string' => 'Mô tả phải là chuỗi ký tự.',
            'description.max' => 'Mô tả tối đa 4294967295 ký tự.',

            'established.required' => 'Năm thành lập không được để trống.',
            'established.integer' => 'Năm thành lập phải là số.',
            'established.min' => 'Năm thành lập không hợp lệ.',
            'established.max' => 'Năm thành lập không hợp lệ.',

            'image.image' => 'Tệp phải là hình ảnh.',
            'image.mimes' => 'Hình ảnh phải là định dạng jpeg, png, jpg hoặc gif.',
            'image.max' => 'Kích thước ảnh tối đa là 2MB.',
        ]);

        $ImgName = null;
        if ($request->hasFile('image')) {
            $ImgName = $request->file('image')->store('Img/University', 'local');
            $ImgName = "/storage/" . $ImgName;
        }

        $truong = new Truong();
        $truong->TenTruong = $name;
        $truong->MoTaTruong = $description;
        $truong->NamThanhLap = $established;
        $truong->Img = $ImgName;
        $truong->Is_verified = 0;
        $truong->save();
        return redirect()->back();
    }

    public function ReportSystemError(Request $request)
    {
        $name = $request->input('name');
        $description = $request->input('description');
        $datetime = $request->input('datetime');
        $os = $request->input('os');
        $image = $request->input('image');

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:4294967295',
            'datetime' => 'nullable|date',
            'os' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ], [
            'name.required' => 'Tên không được để trống.',
            'name.string' => 'Tên phải là chuỗi ký tự.',
            'name.max' => 'Tên tối đa 255 ký tự.',

            'description.required' => 'Mô tả không được để trống.',
            'description.string' => 'Mô tả phải là chuỗi ký tự.',
            'description.max' => 'Mô tả tối đa 4294967295 ký tự.',

            'datetime.required' => 'Thời gian không được để trống.',
            'datetime.date' => 'Thời gian không hợp lệ.',

            'os.required' => 'Hệ điều hành không được để trống.',
            'os.string' => 'Hệ điều hành phải là chuỗi ký tự.',
            'os.max' => 'Hệ điều hành tối đa 255 ký tự.',

            'image.image' => 'Tệp phải là hình ảnh.',
            'image.mimes' => 'Hình ảnh phải là định dạng jpeg, png, jpg hoặc gif.',
            'image.max' => 'Kích thước ảnh tối đa là 2MB.',
        ]);

        $ImgName = null;
        if ($request->hasFile('image')) {
            $ImgName = $request->file('image')->store('Img/SystemError', 'public');
            $ImgName = "/storage/" . $ImgName;
        }
        $error = new SystemError();
        $error->name = $name;
        $error->description = $description;
        $error->error_time = $datetime;
        $error->os = $os;
        $error->attachment_path = $ImgName;
        $error->is_fixed = 0;
        $error->created_at = now();
        $error->save();
        return redirect()->back();
    }

    public function ReportViolation(Request $request)
    {
        $violation_type = $request->input('violation_type');
        $description = $request->input('description');
        $datetime = $request->input('datetime');
        $user_id = $request->input('user_id');
        $image = $request->input('image_path');

        $validatedData = $request->validate(
            [
                'violation_type' => 'required|string|max:255',
                'description' => 'nullable|string|max:4294967295',
                'datetime' => 'nullable|date',
                'user_id' => 'required|numeric|min:1',
                'image_path' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ],
            [
                'violation_type.required' => 'Loại vi phạm không được để trống.',
                'violation_type.string' => 'Loại vi phạm phải là chuỗi ký tự.',
                'violation_type.max' => 'Loại vi phạm tối đa 255 ký tự.',

                'description.required' => 'Mô tả không được để trống.',
                'description.string' => 'Mô tả phải là chuỗi ký tự.',
                'description.max' => 'Mô tả tối đa 4294967295 ký tự.',

                'datetime.required' => 'Thời gian không được để trống.',
                'datetime.date' => 'Thời gian không hợp lệ.',

                'user_id.required' => 'Id người dùng không được để trống.',
                'user_id.numeric' => 'Id người dùng phải là kiểu số nguyên.',
                'user_id.min' => 'Id người dùng bắt đầu từ 1.',

                'image_path.image' => 'Tệp phải là hình ảnh.',
                'image_path.mimes' => 'Hình ảnh phải là định dạng jpeg, png, jpg hoặc gif.',
                'image_path.max' => 'Kích thước ảnh tối đa là 2MB.',
            ]
        );
        $ImgName = null;
        if ($request->hasFile('image')) {
            $ImgName = $request->file('image')->store('Img/SystemError', 'public');
            $ImgName = "/storage/" . $ImgName;
        }
        $report = new ViolationReport();
        $report->violation_type = $violation_type;
        $report->description = $description;
        $report->datetime = $datetime;
        $report->user_id = $user_id;
        $report->image_path = $ImgName;
        $report->resolved = 0;
        $report->created_at = now();
        $report->save();
        return redirect()->back();
    }

    public function SuggestionWebsite(Request $request)
    {
        $user_name = $request->input('user_name');
        $description = $request->input('description');
        $suggestion_type = $request->input('suggestion_type');

        $validatedData = $request->validate([
            'user_name' => 'required|string|max:255',
            'description' => 'required|string|max:4294967295',
            'suggestion_type' => 'required|string|max:255',
        ], [
            'user_name.required' => 'Tên không được để trống.',
            'user_name.string' => 'Tên phải là chuỗi ký tự.',
            'user_name.max' => 'Tên tối đa 255 ký tự.',

            'description.required' => 'Mô tả không được để trống.',
            'description.string' => 'Mô tả phải là chuỗi ký tự.',
            'description.max' => 'Mô tả tối đa 4294967295 ký tự.',

            'suggestion_type.required' => 'Kiểu góp ý không được để trống.',
            'suggestion_type.string' => 'Kiểu góp ý không hợp lệ.',
            'suggestion_type.max' => 'Kiểu góp ý tối đa 255 ký tự.',
        ]);
        
        $suggestion = new SuggestionWebsite();
        $suggestion->user_name = $user_name;
        $suggestion->description = $description;
        $suggestion->suggestion_type = $suggestion_type;
        $suggestion->created_at = now();
        $suggestion->save();
        return redirect()->back();
    }
}

