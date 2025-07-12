<?php

namespace App\Http\Controllers;

use App\Events\CommentPostUpdated;
use App\Events\CommentUpdated;
use App\Events\FollowUserUpdated;
use App\Events\InteractionCommentPostUpdated;
use App\Events\InteractionPostUpdated;
use App\Events\InteractionUpdated;
use App\Events\RatingUpdated;
use App\Events\ReplyCommentPostUpdated;
use App\Events\ReplyToCommentUpdated;
use App\Models\CommentPost;
use App\Models\FollowRelation;
use App\Models\ReplyToComment;
use App\Models\Interactions;
use App\Models\Comment;
use App\Models\CommentDetails;
use App\Models\CommentPostDetails;
use App\Models\InteractionPost;
use App\Models\InteractionsComment;
use App\Models\Rating_Unv;
use App\Models\ReplyCommentsPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class InteractionController extends Controller
{
    public function comment(Request $request)
    {
        $idUser = Auth::guard('api')->id();
        
        if (!$idUser) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $IdTruong = $request->input('IdTruong');
        $visibility = $request->input('visibility', 'Public');
        $text = $request->input('text');
        Log::info($request->all());
        $request->validate(
            [
                'IdTruong' => 'required|integer|exists:truong,id',
                'visibility' => 'in:Public,Private,Hidden',
                'text' => 'nullable|string',
            ],
            [
                'IdTruong.required' => 'Trường không được để trống.',
                'IdTruong.exists' => 'Không tìm thấy trường.',
                'visibility.in' => 'Tính năng không hợp lệ.',
                'text.string' => 'Nội dung không hợp lệ.',
            ]
        );
        $comment = new Comment();
        $comment->IdUser = $idUser;
        $comment->IdTruong = $IdTruong;
        $comment->Visibility = $visibility;
        $comment->CreateDate = now();
        $comment->save();

        $commentDetails = new CommentDetails();
        $commentDetails->IdComment = $comment->Id;
        $commentDetails->Text = $text;
        $commentDetails->CreateDate = now();
        $commentDetails->save();
        broadcast(new CommentUpdated($comment, $commentDetails));
    }

    public function interaction(Request $request)
    {
        $idUser = Auth::guard('api')->id();
        $IdComment = $request->input('IdComment');
        $Like_or_Dislike = $request->input('Like_or_Dislike');

        $request->validate(
            [
                'IdComment' => 'required|integer|exists:comment,Id',
                'Like_or_Dislike' => 'required|boolean',
            ],
            [
                'IdComment.required' => 'Bình luận không được để trống.',
                'IdComment.exists' => 'Không tìm thấy bình luận.',
                'Like_or_Dislike.required' => 'Tương tác không được để trống.',
                'Like_or_Dislike.boolean' => 'Tương tác không hợp lệ.',
            ]
        );

        $interaction = Interactions::where('IdUser', $idUser)
            ->where('IdComment', $IdComment)
            ->first();

        if ($interaction) {
            if ($interaction->Like_or_Dislike == $Like_or_Dislike) {
                $oldInteraction = $interaction->replicate();
                $oldInteraction->setAttribute('Id', $interaction->Id);
                $interaction->delete();
                broadcast(new InteractionUpdated($oldInteraction));
            } else {
                $interaction->Like_or_Dislike = $Like_or_Dislike;
                $updatedInteraction = $interaction->replicate();
                $updatedInteraction->setAttribute('Id', $interaction->Id);
                $interaction->save();
                broadcast(new InteractionUpdated($updatedInteraction));
            }
        } else {
            $interaction = new Interactions();
            $interaction->IdUser = $idUser;
            $interaction->IdComment = $IdComment;
            $interaction->Like_or_Dislike = $Like_or_Dislike;
            $interaction->save();
            broadcast(new InteractionUpdated($interaction));
        }
    }

    public function interactionPost(Request $request)
    {
        $idUser = Auth::guard('api')->id();
        $IdPost = $request->input('IdPost');
        $Like_or_Dislike = $request->input('Like_or_Dislike');

        $request->validate(
            [
                'IdPost' => 'required|integer|exists:ProfilePost,id',
                'Like_or_Dislike' => 'required|boolean',
            ],
            [
                'IdPost.required' => 'Bài viết không được để trống.',
                'IdPost.exists' => 'Không tìm thấy bài viết.',
                'Like_or_Dislike.required' => 'Tương tác không được để trống.',
                'Like_or_Dislike.boolean' => 'Tương tác không hợp lệ.',
            ]
        );

        $interactionPost = InteractionPost::where('IdUser', $idUser)
            ->where('IdPost', $IdPost)
            ->first();

        if ($interactionPost) {
            if ($interactionPost->Like_or_Dislike == $Like_or_Dislike) {
                $oldInteraction = $interactionPost->replicate();
                $oldInteraction->setAttribute('id', $interactionPost->id);
                $interactionPost->delete();
                broadcast(new InteractionPostUpdated($oldInteraction));
            }
        } else {
            $interactionPost = new InteractionPost();
            $interactionPost->IdUser = $idUser;
            $interactionPost->IdPost = $IdPost;
            $interactionPost->Like_or_Dislike = $Like_or_Dislike;
            $interactionPost->save();
            broadcast(new InteractionPostUpdated($interactionPost));
        }
    }

    public function interactionCommentPost(Request $request)
    {
        $idUser = Auth::guard('api')->id();
        $IdCommentPost = $request->input('IdCommentPost');
        $IdReplyCommentPost = $request->input('IdReplyCommentPost');
        $Like = $request->input('Like');

        $request->validate(
            [
                'IdCommentPost' => 'nullable|integer|exists:CommentPost,Id',
                'IdReplyCommentPost' => 'nullable|integer|exists:ReplyCommentsPost,id',
                'Like' => 'required|boolean',
            ],
            [
                'IdCommentPost.exists' => 'Không tìm thấy bài viết.',
                'IdReplyCommentPost.exists' => 'Không tìm thấy bài viết.',
                'Like.required' => 'Tương tác không được để trống.',
                'Like.boolean' => 'Tương tác không hợp lệ.',
            ]
        );

        if ($IdCommentPost && $IdReplyCommentPost != null) {
            return redirect()->withErrors(['error' => 'Không thể tồn tại cả 2 trường Id Comment và Id Reply Comment. Vui lòng xem lại!']);
        }

        if ($IdCommentPost != null) {
            $interactionCommentPost = InteractionsComment::where('IdUser', $idUser)
                ->where('IdCommentPost', $IdCommentPost)
                ->first();

            if ($interactionCommentPost) {
                if ($interactionCommentPost->Like == $Like) {
                    $oldInteractionCommentPost = $interactionCommentPost->replicate();
                    $oldInteractionCommentPost->setAttribute('id', $interactionCommentPost->id);
                    $interactionCommentPost->delete();
                    broadcast(new InteractionCommentPostUpdated($oldInteractionCommentPost));
                }
            } else {
                $interactionPost = new InteractionsComment();
                $interactionPost->IdUser = $idUser;
                $interactionPost->IdCommentPost = $IdCommentPost;
                $interactionPost->Like = $Like;
                $interactionPost->created_at = now();
                $interactionPost->save();
                broadcast(new InteractionCommentPostUpdated($interactionPost));
            }
        } else {
            $interactionReplyCommentPost = InteractionsComment::where('IdUser', $idUser)
                ->where('IdReplyCommentPost', $IdReplyCommentPost)
                ->first();

            if ($interactionReplyCommentPost) {
                if ($interactionReplyCommentPost->Like == $Like) {
                    $oldInteractionReplyCommentPost = $interactionReplyCommentPost->replicate();
                    $oldInteractionReplyCommentPost->setAttribute('id', $interactionReplyCommentPost->id);
                    $interactionReplyCommentPost->delete();
                    broadcast(new InteractionCommentPostUpdated($oldInteractionReplyCommentPost));
                }
            } else {
                $interactionReplyCommentPost = new InteractionsComment();
                $interactionReplyCommentPost->IdUser = $idUser;
                $interactionReplyCommentPost->IdReplyCommentPost = $IdReplyCommentPost;
                $interactionReplyCommentPost->Like = $Like;
                $interactionReplyCommentPost->created_at = now();
                $interactionReplyCommentPost->save();
                broadcast(new InteractionCommentPostUpdated($interactionReplyCommentPost));
            }
        }
    }

    public function replyToComment(Request $request)
    {
        $idUser = Auth::guard('api')->id();
        $IdComment = $request->input('IdComment');
        $IdTruong = $request->input('IdTruong');
        $text = $request->input('text');

        $request->validate(
            [
                'IdComment' => 'required|integer|exists:comment,Id',
                'text' => 'nullable|string',
                'IdTruong' => 'required|integer|exists:truong,id',
            ],
            [
                'IdComment.exists' => 'Không tìm thấy bình luận.',
                'IdComment.required' => 'Bình luận không được để trống.',
                'IdTruong.required' => 'Trường không được để trống.',
                'IdTruong.exists' => 'Không tìm thấy trường.',
                'text.required' => 'Nội dung không được để trống.',
                'text.string' => 'Nôi dung không hợp lệ.',
            ]
        );

        $reply = new ReplyToComment();
        $reply->IdUser = $idUser;
        $reply->IdComment = $IdComment;
        $reply->Text = $text;
        $reply->CreateDate = now();
        $reply->save();
        broadcast(new ReplyToCommentUpdated($reply));
    }

    public function rating(Request $request)
    {
        $idUser = Auth::guard('api')->id();
        if (!$idUser) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $request->validate(
            [
                'IdTruong' => 'required|integer|exists:truong,id',
                'Rate' => 'required|numeric|min:0|max:5',
            ],
            [
                'IdTruong.required' => 'Trường không được để trống.',
                'IdTruong.exists' => 'Không tìm thấy trường.',
                'Rate.required' => 'Đánh giá không được để trống.',
                'Rate.numeric' => 'Đánh giá không hợp lệ.',
                'Rate.min' => 'Đánh giá phải lớn hơn hoặc bằng 0.',
                'Rate.max' => 'Đánh giá phải nhỏ hơn hoặc bằng 5.',
            ]
        );

        $IdTruong = $request->input('IdTruong');
        $Rate = $request->input('Rate');

        $ratechange = Rating_Unv::where('IdUser', $idUser)
            ->where('IdTruong', $IdTruong)
            ->first();

        if ($ratechange) {
            $ratechange->Rate = $Rate;
            $ratechange->save();
            broadcast(new RatingUpdated($ratechange));
            return response()->json(['message' => 'Cập nhật đánh giá thành công', 'rating' => $ratechange], 200);
        } else {
            $rate = new Rating_Unv();
            $rate->IdUser = $idUser;
            $rate->IdTruong = $IdTruong;
            $rate->Rate = $Rate;
            $rate->save();
            broadcast(new RatingUpdated($rate));
            return response()->json(['message' => 'Tạo đánh giá thành công', 'rating' => $rate], 201);
        }
    }

    public function replyCommentPost(Request $request)
    {
        $idUser = Auth::guard('api')->id();
        $IdCommentPost = $request->input('IdCommentPost');
        $IdUserReply = $request->input('IdUserReply');
        $Text = $request->input('Text');
        $request->validate(
            [
                'IdCommentPost' => 'required|integer|exists:commentpost,Id',
                'IdUserReply' => 'nullable|integer|exists:users,id',
                'Text' => 'nullable|string|max:2000',
            ],
            [
                'IdCommentPost.required' => 'Bình luận không được để trống.',
                'IdCommentPost.exists' => 'Không tìm thấy bình luận.',
                'IdUserReply.exists' => 'Người dùng không tồn tại.',
                'Text.string' => 'Nội dung không hợp lệ.',
                'Text.max' => 'Nội dung không được vượt quá 2000 ký tự.',
            ]
        );
        $replyCommentPost = new ReplyCommentsPost();
        $replyCommentPost->IdUser = $idUser;
        $replyCommentPost->IdCommentPost = $IdCommentPost;
        $replyCommentPost->IdUserReply = $IdUserReply;
        $replyCommentPost->Text = $Text;
        $replyCommentPost->CreateDate = now();
        $replyCommentPost->save();
        broadcast(new ReplyCommentPostUpdated($replyCommentPost));
    }

    public function commentPost(Request $request)
    {
        $idUser = Auth::guard('api')->id();
        $IdPost = $request->input('IdPost');
        $Visibility = $request->input('Visibility');
        $Text = $request->input('Text');

        $request->validate(
            [
                'IdPost' => 'required|integer|exists:profilepost,id',
                'Visibility' => 'in:Public,Private,Hidden',
                'Text' => 'nullable|string|max:2000',
            ],
            [
                'IdPost.required' => 'Bài viết không được để trống.',
                'IdPost.exists' => 'Không tìm thấy bài viết.',
                'Visibility.in' => 'Tính năng không hợp lệ.',
                'Text.string' => 'Nội dung không hợp lệ.',
                'Text.max' => 'Nội dung không được vượt quá 2000 ký tự.',
            ]
        );
        $commentPost = new CommentPost();
        $commentPost->IdUser = $idUser;
        $commentPost->IdProfilePost = $IdPost;
        $commentPost->Visibility = $Visibility;
        $commentPost->CreateDate = now();
        $commentPost->save();

        $commentDetails = new CommentPostDetails();
        $commentDetails->IdCommentPost = $commentPost->Id;
        $commentDetails->Text = $Text;
        $commentDetails->CreateDate = now();
        $commentDetails->save();
        broadcast(new CommentPostUpdated($commentPost, $commentDetails));
    }

    public function followUser(Request $request)
    {
        $FollowerID = Auth::guard('api')->id();
        if (!$FollowerID) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }
        $FollowedUserID = $request->input('FollowedUserID');
        $request->validate(
            [
                'FollowedUserID' => 'required|numeric|exists:users,id',
            ],
            [
                'FollowedUserID.required' => 'Người dùng không được để trống.',
                'FollowedUserID.exists' => 'Không tìm thấy người dùng.',
            ]
        );
        if ($FollowerID == $FollowedUserID) {
            return redirect()->route('profile.blog', ['id' => $FollowedUserID])
                ->withErrors(['error' => 'Bạn không thể theo dõi chính mình.']);
        }
        $follow = FollowRelation::where('FollowerID', $FollowerID)
            ->where('FollowedUserID', $FollowedUserID)
            ->first();

        if ($follow) {
            $oldFollow = $follow->replicate();
            $oldFollow->setAttribute('Id', $follow->Id);
            $follow->delete();
            Log::info('Broadcasting unfollow event', ['followRelation' => $oldFollow]);
            broadcast(new FollowUserUpdated($oldFollow));
        } else {
            $follow = new FollowRelation();
            $follow->FollowerID = $FollowerID;
            $follow->FollowedUserID = $FollowedUserID;
            $follow->save();
            broadcast(new FollowUserUpdated($follow));
        }
    }
}
