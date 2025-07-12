<?php

namespace App\Http\Controllers\Admin;

use App\Events\AdminNotificationRT;
use App\Events\CategoryUpdated;
use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class CategoryManagementController extends Controller
{
    public function addCategory(Request $request)
    {
        $validatedData = $request->validate([
            'CategoryName' => 'required|string|max:255',
            'Description' => 'required|string|max:4294967295',
        ], [
            'CategoryName.required' => 'Không được để trống danh mục.',
            'CategoryName.string' => 'Danh mục phải là chuỗi ký tự.',
            'CategoryName.max' => 'Danh mục tối đa 255 ký tự.',
            'Description.required' => 'Không được để trống mô tả.',
            'Description.string' => 'Mô tả phải là chuỗi ký tự.',
            'Description.max' => 'Mô tả tối đa 4294967295 ký tự.',
        ]);

        $category = new Category;
        $category->CategoryName = $request->input('CategoryName');
        $category->Description = $request->input('Description');
        $category->save();

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Add";
        $notification->Content = "Thêm danh mục: " . $category->CategoryName;
        $notification->ActionTime = now();
        $notification->save();

        broadcast(new CategoryUpdated($category, "Add"))->toOthers();
        broadcast(new AdminNotificationRT($notification))->toOthers();

        return response()->json([
            'message' => 'Thêm danh mục thành công.',
            'category' => $category,
        ], 201);
    }

    public function deleteCategory($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'message' => 'Danh mục không tồn tại.',
            ], 404);
        }

        $oldCategory = $category->replicate();
        $oldCategory->setAttribute('IdCategory', $category->IdCategory);
        $category->delete();

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Delete";
        $notification->Content = "Xóa danh mục: " . $oldCategory->CategoryName;
        $notification->ActionTime = now();
        $notification->save();

        broadcast(new CategoryUpdated($oldCategory, "Delete"))->toOthers();
        broadcast(new AdminNotificationRT($notification))->toOthers();

        return response()->json([
            'message' => 'Xóa danh mục thành công.',
            'category_id' => $id,
        ], 200);
    }

    public function updateCategory(Request $request)
    {
        $id = $request->input('IdCategory');
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'message' => 'Danh mục không tồn tại.',
            ], 404);
        }

        $validatedData = $request->validate([
            'CategoryName' => 'required|string|max:255',
            'Description' => 'required|string|max:4294967295',
        ], [
            'CategoryName.required' => 'Tên danh mục không được để trống.',
            'CategoryName.string' => 'Tên danh mục phải là chuỗi ký tự.',
            'CategoryName.max' => 'Tên danh mục tối đa 255 ký tự.',
            'Description.required' => 'Mô tả không được để trống.',
            'Description.string' => 'Mô tả phải là chuỗi ký tự.',
            'Description.max' => 'Mô tả tối đa 4294967295 ký tự.',
        ]);

        $category->CategoryName = $request->input('CategoryName');
        $category->Description = $request->input('Description');
        $category->save();

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Update";
        $notification->Content = "Chỉnh sửa danh mục: " . $category->CategoryName;
        $notification->ActionTime = now();
        $notification->save();

        broadcast(new CategoryUpdated($category, "Update"))->toOthers();
        broadcast(new AdminNotificationRT($notification))->toOthers();

        return response()->json([
            'message' => 'Chỉnh sửa danh mục thành công.',
            'category' => $category,
        ], 200);
    }
}