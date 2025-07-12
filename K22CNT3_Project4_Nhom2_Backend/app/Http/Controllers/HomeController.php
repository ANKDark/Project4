<?php

namespace App\Http\Controllers;

use App\Models\Rating_Unv;
use App\Models\Truong;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HomeController extends Controller
{
    public function index()
    {
        $truongs = Truong::where('Is_verified', 1)
            ->with('category')
            ->get();

        $sumRatingUnv = Rating_Unv::selectRaw('IdTruong, AVG(Rate) as average_rating')
            ->groupBy('IdTruong')
            ->take(3)
            ->get();

        return response()->json([
            'truongs' => $truongs,
            'topRated' => $sumRatingUnv,
        ]);
    }

    public function details(int $id)
    {
        $truong = Truong::with([
            'category',
            'commentDetails',
            'users',
            'replyToComments',
            'comments',
            'interactions',
            'ratings',
        ])->findOrFail($id);

        return response()->json([
            'truong' => $truong,
            'category' => $truong->category,
            'commentDetails' => $truong->commentDetails,
            'users' => $truong->users,
            'replyToComments' => $truong->replyToComments,
            'comments' => $truong->comments,
            'interactions' => $truong->interactions,
            'ratings' => $truong->ratings,
        ]);
    }
}
