<?php

namespace App\Http\Controllers;

use App\Events\SuggestionWebsiteUpdated;
use App\Events\SystemErrorUpdated;
use App\Events\UniversityManagerUpdated;
use App\Events\ViolationReportUpdated;
use App\Models\SuggestionWebsite;
use App\Models\SystemError;
use App\Models\Truong;
use App\Models\ViolationReport;
use Illuminate\Container\Attributes\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log as FacadesLog;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class SupportUserController extends Controller
{
    public function suggestUniversities(Request $request)
    {
        try {
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
                $ImgName = $request->file('image')->store('Img/University', 'public');
                $ImgName = "/storage/" . $ImgName;
            }

            $truong = new Truong();
            $truong->TenTruong = $request->input('name');
            $truong->MoTaTruong = $request->input('description');
            $truong->NamThanhLap = $request->input('established');
            $truong->Img = $ImgName;
            $truong->Is_verified = 0;
            $truong->save();

            broadcast(new UniversityManagerUpdated($truong, 'Create'))->toOthers();

            return response()->json([
                'message' => 'Đề xuất trường thành công.',
                'data' => $truong,
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi gửi đề xuất.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function reportSystemError(Request $request)
    {
        try {
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

                'description.string' => 'Mô tả phải là chuỗi ký tự.',
                'description.max' => 'Mô tả tối đa 4294967295 ký tự.',

                'datetime.date' => 'Thời gian không hợp lệ.',

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
            $error->name = $request->input('name');
            $error->description = $request->input('description');
            $error->error_time = $request->input('datetime');
            $error->os = $request->input('os');
            $error->attachment_path = $ImgName;
            $error->is_fixed = 0;
            $error->created_at = now();
            $error->save();

            broadcast(new SystemErrorUpdated($error, 'Create'))->toOthers();

            return response()->json([
                'message' => 'Báo cáo lỗi hệ thống thành công.',
                'data' => $error,
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi gửi báo cáo.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function reportViolation(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'violation_type' => 'required|string|max:255',
                'description' => 'nullable|string|max:4294967295',
                'datetime' => 'nullable|date',
                'user_id' => 'required|numeric|min:1',
                'image_path' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ], [
                'violation_type.required' => 'Loại vi phạm không được để trống.',
                'violation_type.string' => 'Loại vi phạm phải là chuỗi ký tự.',
                'violation_type.max' => 'Loại vi phạm tối đa 255 ký tự.',

                'description.string' => 'Mô tả phải là chuỗi ký tự.',
                'description.max' => 'Mô tả tối đa 4294967295 ký tự.',

                'datetime.date' => 'Thời gian không hợp lệ.',

                'user_id.required' => 'Id người dùng không được để trống.',
                'user_id.numeric' => 'Id người dùng phải là kiểu số nguyên.',
                'user_id.min' => 'Id người dùng bắt đầu từ 1.',

                'image_path.image' => 'Tệp phải là hình ảnh.',
                'image_path.mimes' => 'Hình ảnh phải là định dạng jpeg, png, jpg hoặc gif.',
                'image_path.max' => 'Kích thước ảnh tối đa là 2MB.',
            ]);
            FacadesLog::info('Request data for reportViolation: ', $request->all());
            $ImgName = null;
            if ($request->hasFile('image_path')) {
                $ImgName = $request->file('image_path')->store('Img/SystemError', 'public');
                $ImgName = "/storage/" . $ImgName;
            }

            $report = new ViolationReport();
            $report->violation_type = $request->input('violation_type');
            $report->description = $request->input('description');
            $report->datetime = $request->input('datetime');
            $report->user_id = $request->input('user_id');
            $report->image_path = $ImgName;
            $report->resolved = 0;
            $report->save();

            broadcast(new ViolationReportUpdated($report, 'Create'))->toOthers();

            return response()->json([
                'message' => 'Báo cáo vi phạm thành công.',
                'data' => $report,
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi gửi báo cáo. Vui lòng kiểm tra lại id người dùng.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function suggestionWebsite(Request $request)
    {
        try {
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
            $suggestion->user_name = $request->input('user_name');
            $suggestion->description = $request->input('description');
            $suggestion->suggestion_type = $request->input('suggestion_type');
            $suggestion->created_at = now();
            $suggestion->save();

            broadcast(new SuggestionWebsiteUpdated($suggestion, 'Create'))->toOthers();

            return response()->json([
                'message' => 'Góp ý website thành công.',
                'data' => $suggestion,
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi gửi góp ý.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}