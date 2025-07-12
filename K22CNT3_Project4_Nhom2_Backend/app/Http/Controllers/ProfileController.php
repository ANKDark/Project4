<?php

namespace App\Http\Controllers;

use App\Events\ProfilePostUpdated;
use App\Models\FollowRelation;
use App\Models\InteractionPost;
use App\Models\ProfilePost;
use App\Models\User;
use App\Models\UserInfo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    public function updateUser(Request $request)
    {
        $user = User::find(Auth::id());

        $rules = [
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'newPassword' => 'nullable|string|min:6',
            'password' => 'required|string',
            'imgName' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];

        $messages = [
            'name.required' => 'Tên không được để trống.',
            'email.required' => 'Email không được để trống.',
            'email.email' => 'Email không đúng định dạng.',
            'email.unique' => 'Email đã được sử dụng.',
            'newPassword.min' => 'Mật khẩu mới phải có ít nhất :min ký tự.',
            'password.required' => 'Bạn phải nhập mật khẩu hiện tại.',
            'imgName.image' => 'Tệp tải lên phải là hình ảnh.',
            'imgName.mimes' => 'Ảnh phải có định dạng jpeg, png, jpg hoặc gif.',
            'imgName.max' => 'Kích thước ảnh tối đa là :max KB.',
        ];

        if ($request->hasFile('imgName')) {
            $rules['imgName'] = 'image|mimes:jpeg,png,jpg,gif|max:2048';
        } else {
            $rules['imgName'] = 'nullable|string';
        }

        $validatedData = $request->validate($rules, $messages);

        if (!$user->email_verified_at) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn cần xác minh email trước khi cập nhật.',
                'field' => 'email_verified_at'
            ], 403);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mật khẩu sai',
                'field' => 'password'
            ], 422);
        }

        $user->name = $request->name;
        $user->email = $request->email;

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        if ($request->filled('newPassword')) {
            $user->password = Hash::make($request->newPassword);
        }

        if ($request->hasFile('imgName')) {
            $ImgName = $request->file('imgName')->store('Img/UserPost', 'public');
            $user->profile_photo_path = "/storage/" . $ImgName;
        } elseif ($request->input('imgName') === null) {
            $user->profile_photo_path = null;
        } elseif ($request->input('imgName')) {
            $user->profile_photo_path = $request->input('imgName');
        }

        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Cập nhật thành công',
            'user' => $user
        ]);
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
    public function profileblog(int $id)
    {
        $currentUserId = Auth::guard('api')->id();
        $user = User::with([
            'followers',
            'following',
            'userinfo',
            'profileposts',
            'commentPostsThroughProfilePosts.commentPostDetails',
            'commentPostsThroughProfilePosts.interactionCommentPost',
            'commentPostsThroughProfilePosts.commentPostDetailsReply.interactionReplyCommentPost',
            'commentPostsThroughProfilePosts.commentPostDetailsReply'
        ])->find($id);

        if (!$user) {
            return response()->json(['error' => 'Người dùng không tồn tại!'], 404);
        }

        $allUser = User::all();
        $follow = FollowRelation::where('FollowerID', $currentUserId)
            ->where('FollowedUserID', $id)
            ->first();
        $profilePostIds = $user->profileposts->pluck('Id')->toArray();
        $interactionPosts = InteractionPost::whereIn('IdPost', $profilePostIds)->get();

        return response()->json([
            'user' => $user,
            'currentUserId' => $currentUserId,
            'userinfo' => $user->userinfo,
            'profileposts' => $user->profileposts->sortByDesc('created_at')->values(),
            'interactionPosts' => $interactionPosts,
            'allUser' => $allUser,
            'commentPostsThroughProfilePosts' => $user->commentPostsThroughProfilePosts,
            'follow' => $follow,
        ], 200);
    }

    public function userCreatePost(Request $request)
    {
        $IdUser = Auth::guard('api')->id();
        $Content = $request->input('content');
        $ImgName = $request->input('imgName');
        $Status = $request->input('status');
        $user = Auth::guard('api')->user();
        if (!$user->email_verified_at) {
            return response()->json([
                'errors' => [
                    'email_verified_at' => 'Bạn cần xác minh email trước khi thực hiện.'
                ]
            ], 403);
        }

        $validatedData = $request->validate([
            'content' => 'required|string',
            'imgName' => 'nullable|mimes:jpeg,png,jpg,gif,mp4,avi,mov,mkv|max:51200',
            'status' => 'nullable|integer|in:0,1',
        ], [
            'content.required' => 'Nội dung không được để trống.',
            'content.string' => 'Nội dung phải là dạng văn bản.',

            'imgName.image' => 'Tệp tải lên phải là hình ảnh hoặc video.',
            'imgName.mimes' => 'Tệp tải lên phải có định dạng: jpeg, png, jpg, gif, mp4, avi, mov hoặc mkv.',
            'imgName.max' => 'Tệp tải lên không được vượt quá 50MB.',

            'status.integer' => 'Trạng thái phải là số.',
            'status.in' => 'Trạng thái không hợp lệ.',
        ]);

        $ImgName = null;
        if ($request->hasFile('imgName')) {
            $ImgName = $request->file('imgName')->store('Img/UserPost', 'public');
            $ImgName = "/storage/" . $ImgName;
        }

        $profilepost = new ProfilePost();
        $profilepost->IdUser = $IdUser;
        $profilepost->Content = $Content;
        $profilepost->Image = $ImgName;
        $profilepost->Status = $Status;

        if ($profilepost->save()) {
            broadcast(new ProfilePostUpdated($profilepost, "Create"));

            return response()->json([
                'message' => 'Bài viết đã được tạo thành công!',
                'data' => $profilepost
            ], 201);
        } else {
            return response()->json([
                'message' => 'Không thể lưu bài viết',
                'errors' => [
                    'error' => 'Đã có lỗi xảy ra khi lưu bài viết. Vui lòng thử lại.'
                ]
            ], 500);
        }
    }

    public function userinfo(Request $request)
    {
        $IdUser = Auth::guard('api')->id();

        $validatedData = $request->validate([
            "Residence" => "nullable|string|max:255",
            "Birthplace" => "nullable|string|max:255",
            "Education" => "nullable|string|max:255",
            "DateOfBirth" => "nullable|date",
        ], [
            'Residence.string' => 'Nơi cư trú phải là văn bản.',
            'Residence.max' => 'Nơi cư trú không được vượt quá 255 ký tự.',

            'Birthplace.string' => 'Nơi sinh phải là văn bản.',
            'Birthplace.max' => 'Nơi sinh không được vượt quá 255 ký tự.',

            'Education.string' => 'Trình độ học vấn phải là văn bản.',
            'Education.max' => 'Trình độ học vấn không được vượt quá 255 ký tự.',

            'DateOfBirth.date' => 'Ngày sinh không hợp lệ.',
        ]);

        $userinfo = UserInfo::where('IdUser', $IdUser)->first();

        if ($userinfo) {
            $userinfo->update($validatedData);
        } else {
            $userinfo = UserInfo::create([
                "IdUser" => $IdUser,
                ...$validatedData
            ]);
        }
    }

    public function userDelPost(int $postId)
    {
        $IdUser = Auth::guard('api')->id();
        $profilePost = ProfilePost::where('IdUser', $IdUser)->where('Id', $postId)->first();
        $oldProfilePost = $profilePost->replicate();
        $oldProfilePost->setAttribute('Id', $profilePost->Id);
        $profilePost->delete();
        broadcast(new ProfilePostUpdated($oldProfilePost, "Delete"));
    }

    public function userUpdatePost(Request $request, int $postId)
    {
        $IdUser = Auth::guard('api')->id();
        $Content = $request->input('content');
        $MediaName = $request->input('imgName');
        $Status = $request->input('status');

        $rules = [
            'content' => 'required|string',
            'status' => 'nullable|integer|in:0,1',
        ];

        if ($request->hasFile('imgName')) {
            $rules['imgName'] = 'file|mimes:jpeg,png,jpg,gif,mp4,mov,avi,mkv|max:51200';
        } else {
            $rules['imgName'] = 'nullable|string';
        }

        $messages = [
            'content.required' => 'Nội dung không được để trống.',
            'content.string' => 'Nội dung phải là chuỗi.',

            'status.integer' => 'Trạng thái phải là số nguyên.',
            'status.in' => 'Trạng thái không hợp lệ. Chỉ chấp nhận 0 hoặc 1.',

            'imgName.file' => 'Tệp tải lên không hợp lệ.',
            'imgName.mimes' => 'Tệp phải có định dạng jpeg, png, jpg, gif, mp4, mov, avi hoặc mkv.',
            'imgName.max' => 'Tệp không được vượt quá 100MB.',
            'imgName.string' => 'Tên tệp phải là chuỗi.',
        ];

        $validatedData = $request->validate($rules, $messages);

        $profilepost = ProfilePost::where('IdUser', $IdUser)->where('Id', $postId)->first();

        $MediaPath = $profilepost->Image;
        if ($request->hasFile('imgName')) {
            $MediaPath = $request->file('imgName')->store('Img/UserPost', 'public');
            $MediaPath = "/storage/" . $MediaPath;
        } elseif ($request->input('imgName') === null) {
            $MediaPath = null;
        } elseif ($request->input('imgName')) {
            $MediaPath = $request->input('imgName');
        }

        $profilepost->IdUser = $IdUser;
        $profilepost->Content = $Content;
        $profilepost->Image = $MediaPath;
        $profilepost->Status = $Status;
        $profilepost->update();

        broadcast(new ProfilePostUpdated($profilepost, "Update"));
    }
}
