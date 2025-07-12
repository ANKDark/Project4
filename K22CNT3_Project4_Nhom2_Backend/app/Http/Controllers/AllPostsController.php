<?php

namespace App\Http\Controllers;

use App\Models\ProfilePost;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

class AllPostsController extends Controller
{
    public function allPosts()
    {
        $currentUserId = Auth::guard('api')->check() ? Auth::guard('api')->id() : null;

        $posts = ProfilePost::with([
            'users',
            'commentPost.commentPostDetails',
            'commentPost.interactionCommentPost',
            'commentPost.commentPostDetailsReply',
            'commentPost.commentPostDetailsReply.interactionReplyCommentPost',
            'interactionPost'
        ])
        ->orderBy('created_at', 'desc')
        ->where('Status', 1)
        ->get();

        $postsByFollow = $currentUserId
            ? ProfilePost::with([
                'users',
                'commentPost.commentPostDetails',
                'interactionPost'
            ])
            ->whereIn('IdUser', function ($query) use ($currentUserId) {
                $query->select('FollowedUserID')
                    ->from('followrelations')
                    ->where('FollowerID', $currentUserId);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            : collect([]);

        $allUsers = User::where('Status', 1)->get();

        return response()->json([
            'posts' => $posts,
            'currentUserId' => $currentUserId,
            'allUser' => $allUsers,
            'postsByFollow' => $postsByFollow,
        ]);
    }
}