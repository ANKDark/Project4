<?php

namespace App\Http\Controllers\Admin;

use App\Events\AdminNotificationRT;
use App\Events\CommentPostUpdated;
use App\Events\ProfilePostUpdated;
use App\Events\ReplyCommentPostUpdated;
use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use App\Models\CommentPost;
use App\Models\ProfilePost;
use App\Models\ReplyCommentsPost;
use Illuminate\Support\Facades\Auth;

class ProfilePostManagementController extends Controller
{
    public function deletePrfPost($id)
    {
        $profilePost = ProfilePost::find($id);
        $oldProfilePost = $profilePost->replicate();
        $oldProfilePost->setAttribute('Id', $profilePost->Id);

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Delete";
        $notification->Content = "Xóa bài viết: " . $profilePost->Content;
        $notification->ActionTime = Date('Y-m-d H:i:s');
        $notification->save();
        
        $profilePost->delete();

        broadcast(new ProfilePostUpdated($oldProfilePost,'', true))->toOthers();
        broadcast(new AdminNotificationRT($notification))->toOthers();
    }

    public function deleteCommentPost($id)
    {
        $commentPost = CommentPost::find($id);
        $oldCommentPost = $commentPost->replicate();
        $oldCommentPost->setAttribute('Id', $commentPost->Id);
        $commentDetailsPost = $commentPost->commentPostDetails->first();

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Delete";
        $notification->Content = "Xóa bình luận: " . $commentDetailsPost->Text;
        $notification->ActionTime = Date('Y-m-d H:i:s');
        $notification->save();
        
        $commentPost->delete();

        broadcast(new CommentPostUpdated($oldCommentPost,$commentDetailsPost, true))->toOthers();
        broadcast(new AdminNotificationRT($notification))->toOthers();
    }

    public function deleteReplyCommentPost($id)
    {
        $replyCommentPost = ReplyCommentsPost::find($id);
        $oldreplyCommentPost = $replyCommentPost->replicate();
        $oldreplyCommentPost->setAttribute('id', $replyCommentPost->id);

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Delete";
        $notification->Content = "Xóa trả lời bình luận: " . $replyCommentPost->Text;
        $notification->ActionTime = Date('Y-m-d H:i:s');
        $notification->save();
        
        $replyCommentPost->delete();

        broadcast(new ReplyCommentPostUpdated($oldreplyCommentPost, true))->toOthers();
        broadcast(new AdminNotificationRT($notification))->toOthers();
    }
}
