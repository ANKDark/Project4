<?php

namespace App\Http\Controllers;

use App\Models\ProfilePost;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AllPostsController extends Controller
{
    public function allPosts()
    {
        $currentUserId = Auth::id();

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

        $postsByFollow = ProfilePost::with([
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
        ->get();

        $allUsers = User::where('Status', 1)->get();

        return Inertia::render('ListAllUserPost', [
            'posts' => $posts,
            'currentUserId' => $currentUserId,
            'allUser' => $allUsers,
            'postsByFollow' => $postsByFollow,
        ]);
    }
}
