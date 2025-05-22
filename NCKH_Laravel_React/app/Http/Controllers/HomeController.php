<?php

namespace App\Http\Controllers;

use App\Models\Rating_Unv;
use App\Models\Truong;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class HomeController extends Controller
{
    public function index()
    {
        $currentUserId = Auth::id();
        $truong = Truong::where('Is_verified', 1)->get();
        $sumRatingUnv = Rating_Unv::selectRaw('IdTruong, AVG(Rate) as average_rating')
            ->groupBy('IdTruong')
            ->take(3)
            ->get();

        return Inertia::render('Home', [
            'truong' => $truong,
            'currentUserId' => $currentUserId,
            'sumRatingUnv' => $sumRatingUnv,
        ]);
    }

    public function details(int $id)
    {
        $currentUserId = Auth::id();
        $truong = Truong::with(['category', 'commentDetails', 'users', 'replyToComments', 'comments', 'interactions', 'ratings'])->findOrFail($id);

        return Inertia::render('UnvDetails', [
            'truong' => $truong,
            'category' => $truong->category,
            'commentDetails' => $truong->commentDetails,
            'users' => $truong->users,
            'replyToComments' => $truong->replyToComments,
            'comments' => $truong->Comments,
            'interactions' => $truong->interactions,
            'currentUserId' => $currentUserId,
            'ratings' => $truong->ratings,
        ]);
    }

    public function supportUser()
    {
        return Inertia::render('SupportUser');
    }
}

