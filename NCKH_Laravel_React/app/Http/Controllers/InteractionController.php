<?php

namespace App\Http\Controllers;

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

class InteractionController extends Controller
{
    public function comment(Request $request)
    {
        $idUser = Auth::id();
        $IdTruong = $request->input('IdTruong');
        $visibility = $request->input('visibility', 'Public');
        $text = $request->input('text');

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
        return redirect()->route('details', ['id' => $IdTruong])
            ->with('newComment', $comment)
            ->with('newCommentDetails', $commentDetails)
            ->with('newUser', $idUser);
    }

    public function interaction(Request $request)
    {
        $idUser = Auth::id();
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
                $interaction->delete();
            } else {
                $interaction->Like_or_Dislike = $Like_or_Dislike;
                $interaction->save();
            }
        } else {
            $interaction = new Interactions();
            $interaction->IdUser = $idUser;
            $interaction->IdComment = $IdComment;
            $interaction->Like_or_Dislike = $Like_or_Dislike;
            $interaction->save();
        }
    }

    public function interactionPost(Request $request)
    {
        $idUser = Auth::id();
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
                $interactionPost->delete();
            }
        } else {
            $interactionPost = new InteractionPost();
            $interactionPost->IdUser = $idUser;
            $interactionPost->IdPost = $IdPost;
            $interactionPost->Like_or_Dislike = $Like_or_Dislike;
            $interactionPost->save();
        }
    }

    public function interactionCommentPost(Request $request)
    {
        $idUser = Auth::id();
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

        if($IdCommentPost && $IdReplyCommentPost !=null ) {
            return redirect()->withErrors(['error' => 'Không thể tồn tại cả 2 trường Id Comment và Id Reply Comment. Vui lòng xem lại!']);
        }

        if ($IdCommentPost != null) {
            $interactionCommentPost = InteractionsComment::where('IdUser', $idUser)
                ->where('IdCommentPost', $IdCommentPost)
                ->first();

            if ($interactionCommentPost) {
                if ($interactionCommentPost->Like == $Like) {
                    $interactionCommentPost->delete();
                }
            } else {
                $interactionPost = new InteractionsComment();
                $interactionPost->IdUser = $idUser;
                $interactionPost->IdCommentPost = $IdCommentPost;
                $interactionPost->Like = $Like;
                $interactionPost->created_at = now();
                $interactionPost->save();
            }
        } else {
            $interactionReplyCommentPost = InteractionsComment::where('IdUser', $idUser)
                ->where('IdReplyCommentPost', $IdReplyCommentPost)
                ->first();

            if ($interactionReplyCommentPost) {
                if ($interactionReplyCommentPost->Like == $Like) {
                    $interactionReplyCommentPost->delete();
                }
            } else {
                $interactionReplyCommentPost = new InteractionsComment();
                $interactionReplyCommentPost->IdUser = $idUser;
                $interactionReplyCommentPost->IdReplyCommentPost = $IdReplyCommentPost;
                $interactionReplyCommentPost->Like = $Like;
                $interactionReplyCommentPost->created_at = now();
                $interactionReplyCommentPost->save();
            }
        }
    }

    public function replyToComment(Request $request)
    {
        $idUser = Auth::id();
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
        return redirect()->route('details', ['id' => $IdTruong])->with('newReplyToComment', $reply);
    }

    public function rating(Request $request)
    {
        $idUser = Auth::id();
        $IdTruong = $request->input('IdTruong');
        $Rate = $request->input('Rate');
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
        $ratechange = Rating_Unv::where('IdUser', $idUser)
            ->where('IdTruong', $IdTruong)
            ->first();

        if ($ratechange) {
            $ratechange->Rate = $Rate;
            $ratechange->save();
        } else {
            $ratechange = new Rating_Unv();
            $ratechange->IdUser = $idUser;
            $ratechange->IdTruong = $IdTruong;
            $ratechange->Rate = $Rate;
            $ratechange->save();
        }
        return redirect()->route('details', ['id' => $IdTruong])->with('newRating', $ratechange);
    }

    public function replyCommentPost(Request $request)
    {
        $idUser = Auth::id();
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
        return redirect()->back();
    }

    public function commentPost(Request $request)
    {
        $idUser = Auth::id();
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
    }

    public function followUser(Request $request)
    {
        $FollowerID = Auth::id();
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
            $follow->delete();
            return redirect()->back();
        } else {
            $follow = new FollowRelation();
            $follow->FollowerID = $FollowerID;
            $follow->FollowedUserID = $FollowedUserID;
            $follow->save();
            return redirect()->back();
        }
    }
}
