<?php

use App\Http\Controllers\{AllPostsController, HomeController, InteractionController, ProfileController, SupportUserController};
use App\Http\Middleware\FilterSensitiveWords;
use App\Models\Interactions;
use Illuminate\Support\Facades\Route;

Route::get("/", [HomeController::class, 'index'])->name('index');
Route::get("/supportUser", [HomeController::class, 'supportUser'])->name('supportUser');
Route::get('details/{id}', [HomeController::class, 'details'])->name('details');

Route::get('/allposts', [AllPostsController::class, 'allPosts'])->name('allposts');

Route::middleware([FilterSensitiveWords::class])->group(function () {
    Route::post('/suggestUniversities', [SupportUserController::class, 'SuggestUniversities'])->name('suggestUniversities');
    Route::post('/reportSystemError', [SupportUserController::class, 'ReportSystemError'])->name('reportSystemError');
    Route::post('/reportViolation', [SupportUserController::class, 'ReportViolation'])->name('reportViolation');
    Route::post('/suggestionWebsite', [SupportUserController::class, 'SuggestionWebsite'])->name('suggestionWebsite');
});

Route::middleware('auth')->group(function () {
    Route::controller(ProfileController::class)->group(function () {
        Route::get('/profile', 'edit')->name('profile.edit');
        Route::patch('/profile', 'update')->name('profile.update');
        Route::delete('/profile', 'destroy')->name('profile.destroy');
        Route::get('/profile/{id}', 'profileBlog')->name('profile.blog');

        Route::middleware(FilterSensitiveWords::class)->group(function () {
            Route::post("/usercreatepost", 'userCreatePost')->name('usercreatepost');
            Route::post("/userinfo", 'userinfo')->name('userinfo');
            Route::post("/userUpdatePost/{id}", 'userUpdatePost')->name('userUpdatePost');
            Route::patch('/profile', 'update')->name('profile.update');
        });

        Route::delete("/userDelPost/{postId}", 'userDelPost')->name('userDelPost');
    });

    Route::controller(InteractionController::class)->group(function () {
        Route::middleware(FilterSensitiveWords::class)->group(function () {
            Route::post("/comment", 'comment')->name('comment');
            Route::post("/interaction", 'interaction')->name('interaction');
            Route::post("/interactionPost", 'interactionPost')->name('interactionPost');
            Route::post("/commentPost", 'commentPost')->name('commentPost');
            Route::post("/followUser", 'followUser')->name('followUser');
            Route::post("/replyToComment", 'replyToComment')->name('replyToComment');
            Route::post("/replyCommentPost", 'replyCommentPost')->name('replyCommentPost');
            Route::post("/interactionCommentPost", 'interactionCommentPost')->name('interactionCommentPost');
            Route::post("/rating", 'rating')->name('rating');
        });
    });
});

require __DIR__ . '/auth.php';
