<?php

namespace App\Http\Controllers\Admin;

use App\Events\AdminNotificationRT;
use App\Events\CommentUpdated;
use App\Events\ReplyToCommentUpdated;
use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use App\Models\Comment;
use App\Models\ReplyToComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentManagementController extends Controller
{
    public function deleteComment($id)
    {
        $comment = Comment::find($id);

        if (!$comment) {
            return response()->json(['message' => 'Không tìm thấy bình luận.'], 404);
        }

        $details = $comment->commentDetails->first();

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Delete";
        $notification->Content = "Đã xóa bình luận: " . ($details?->Text ?? 'Không rõ nội dung');
        $notification->ActionTime = now();
        $notification->save();

        $comment->delete();

        broadcast(new CommentUpdated($comment, $details, true))->toOthers();
        broadcast(new AdminNotificationRT($notification))->toOthers();

        return response()->json(['message' => 'Xóa bình luận thành công.'], 200);
    }

    public function updateVisibilityComment($id)
    {
        $comment = Comment::find($id);

        if (!$comment) {
            return response()->json(['message' => 'Không tìm thấy bình luận.'], 404);
        }

        $current = $comment->Visibility;
        $next = match ($current) {
            'Public' => 'Private',
            'Private' => 'Hidden',
            default => 'Public',
        };

        $comment->Visibility = $next;
        $comment->save();

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Update";
        $notification->Content = "Đã chuyển trạng thái hiển thị bình luận: " . optional($comment->commentDetails->first())->Text . " sang [$next]";
        $notification->ActionTime = now();
        $notification->save();

        broadcast(new CommentUpdated($comment, $comment->commentDetails->first()))->toOthers();
        broadcast(new AdminNotificationRT($notification))->toOthers();

        return response()->json([
            'message' => 'Cập nhật trạng thái thành công.',
            'new_visibility' => $next
        ], 200);
    }

    public function deleteReplyComment($id)
    {
        $reply = ReplyToComment::find($id);

        if (!$reply) {
            return response()->json(['message' => 'Không tìm thấy trả lời bình luận.'], 404);
        }

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Delete";
        $notification->Content = "Đã xóa trả lời bình luận: " . $reply->Text;
        $notification->ActionTime = now();
        $notification->save();

        broadcast(new ReplyToCommentUpdated($reply, true))->toOthers();
        broadcast(new AdminNotificationRT($notification))->toOthers();

        $reply->delete();

        return response()->json(['message' => 'Xóa trả lời bình luận thành công.'], 200);
    }
}
