<?php

use App\Http\Controllers\Admin\AccountManagementController;
use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\CategoryManagementController;
use App\Http\Controllers\Admin\ChatController;
use App\Http\Controllers\Admin\CommentManagementController;
use App\Http\Controllers\Admin\DasboardManagementController;
use App\Http\Controllers\Admin\ProfileAdminController;
use App\Http\Controllers\Admin\ProfilePostManagementController;
use App\Http\Controllers\Admin\SupportUsertManagementController;
use App\Http\Controllers\Admin\UnvManagementController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\AllPostsController;
use App\Http\Controllers\InteractionController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\LogUnvController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SupportUserController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;

Route::post('/admin/login', [AdminAuthController::class, 'login']);
Route::post('/admin/verify-otp', [AdminAuthController::class, 'verifyOtp']);

Route::middleware('auth:admin')->prefix('admin')->group(function () {
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::post('/update-password', [AdminAuthController::class, 'updatePassword']);
    Route::get('/me', [AdminAuthController::class, 'getAdminData']);
    Route::get('/dashboard', [DasboardManagementController::class, 'index']);
    Route::get('/universities', [DasboardManagementController::class, 'indexUnv']);
    Route::post('/changeVerifiedStatus/{id}', [UnvManagementController::class, 'changeVerifiedStatus']);
    Route::post('/editUnv', [UnvManagementController::class, 'editUnv']);
    Route::post('/addUnv', [UnvManagementController::class, 'addUnv']);
    Route::delete('/university/{id}', [UnvManagementController::class, 'deleteUnv']);
    Route::get('/listAccount', [DasboardManagementController::class, 'listAccount']);
    Route::post('/addAdmin', [AccountManagementController::class, 'addAdmin']);
    Route::post('/updateAdmin', [AccountManagementController::class, 'updateAdmin']);
    Route::delete('/deleteAdmin/{id}', [AccountManagementController::class, 'deleteAdmin']);
    Route::post('/addUser', [AccountManagementController::class, 'addUser']);
    Route::post('/updateUser', [AccountManagementController::class, 'updateUser']);
    Route::delete('/deleteUser/{id}', [AccountManagementController::class, 'deleteUser']);
    Route::post('/addCategory', [CategoryManagementController::class, 'addCategory']);
    Route::post('/updateCategory', [CategoryManagementController::class, 'updateCategory']);
    Route::delete('/deleteCategory/{id}', [CategoryManagementController::class, 'deleteCategory']);
    Route::get('/listCategory', [DasboardManagementController::class, 'listCategory']);
    Route::get('/listComment', [DasboardManagementController::class, 'listComment']);
    Route::delete('/deleteComment/{id}', [CommentManagementController::class, 'deleteComment']);
    Route::post('/updateVisibilityComment/{id}', [CommentManagementController::class, 'updateVisibilityComment']);
    Route::delete('/deleteReplyComment/{id}', [CommentManagementController::class, 'deleteReplyComment']);
    Route::get('/profileManagement', [ProfileAdminController::class, 'profileManagement']);
    Route::post('/updateProfile', [ProfileAdminController::class, 'updateProfile']);
    Route::post('/updatePassword', [AdminAuthController::class, 'updatePassword']);
    Route::get('/listSystemError', [DasboardManagementController::class, 'listSystemError']);
    Route::post('/updateFixed/{id}', [SupportUsertManagementController::class, 'updateFixed']);
    Route::delete('/deleteSystemError/{id}', [SupportUsertManagementController::class, 'deleteSystemError']);
    Route::get('/listSuggestionWebsite', [DasboardManagementController::class, 'listSuggestionWebsite']);
    Route::post('/updatedSuggestionWebsite/{id}', [SupportUsertManagementController::class, 'updatedSuggestionWebsite']);
    Route::delete('/deleteSuggestionWebsite/{id}', [SupportUsertManagementController::class, 'deleteSuggestionWebsite']);

    Route::get('/listAdminOnline', [DasboardManagementController::class, 'listAdminOnline']);

    Route::get('/listViolationReport', [DasboardManagementController::class, 'listViolationReport']);
    Route::post('/updateResolved/{id}', [SupportUsertManagementController::class, 'updateResolved']);
    Route::delete('/deleteViolationReport/{id}', [SupportUsertManagementController::class, 'deleteViolationReport']);

    Route::get('/chat', [ChatController::class, 'index']);
    Route::post('/chat/mark-as-read', [ChatController::class, 'markAsRead']);
    Route::post('/chat/send-message', [ChatController::class, 'sendMessage']);

    Route::get('/listProfilePost', [DasboardManagementController::class, 'listProfilePost']);
    Route::delete('/deletePrfPost/{id}', [ProfilePostManagementController::class, 'deletePrfPost']);
    Route::delete('/deleteCommentPost/{id}', [ProfilePostManagementController::class, 'deleteCommentPost']);
    Route::delete('/deleteReplyCommentPost/{id}', [ProfilePostManagementController::class, 'deleteReplyCommentPost']);
});

Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login');
Route::post('/register', [AuthenticatedSessionController::class, 'register'])->name('register');
Route::get('/profile/{id}', [ProfileController::class, 'profileblog']);
Route::post('/logVisit', [LogUnvController::class, 'logVisit']);
Route::post('/logSearch', [LogUnvController::class, 'logSearch']);
Route::get('/allposts', [AllPostsController::class, 'allPosts'])->name('allposts');
Route::post('/password/email', [PasswordResetLinkController::class, 'store'])->name('password.email');
Route::post('/password/reset', [NewPasswordController::class, 'store'])->name('password.store');

Route::post('/suggestUniversities', [SupportUserController::class, 'suggestUniversities']);
Route::post('/reportSystemError', [SupportUserController::class, 'reportSystemError']);
Route::post('/reportViolation', [SupportUserController::class, 'reportViolation']);
Route::post('/suggestionWebsite', [SupportUserController::class, 'suggestionWebsite']);

Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);
    Route::get('/user', function () {
        return response()->json(['user' => auth('api')->user()]);
    });
    Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])->name('verification.send');
    Route::get('/universities/{id}', [InteractionController::class, 'show']);
    Route::post('/rating', [InteractionController::class, 'rating']);
    Route::post('/comment', [InteractionController::class, 'comment']);
    Route::post('/replyToComment', [InteractionController::class, 'replyToComment']);
    Route::post('/interaction', [InteractionController::class, 'interaction']);
    Route::post('/interactionPost', [InteractionController::class, 'interactionPost']);
    Route::post('/commentPost', [InteractionController::class, 'commentPost']);
    Route::post('/replyCommentPost', [InteractionController::class, 'replyCommentPost']);
    Route::post('/interactionCommentPost', [InteractionController::class, 'interactionCommentPost']);
    Route::post('/usercreatepost', [ProfileController::class, 'userCreatePost'])->name('userCreatePost');
    Route::delete('/userpost/{id}', [ProfileController::class, 'userDelPost'])->name('userDelPost');
    Route::post('/userinfo', [ProfileController::class, 'userinfo'])->name('userinfo');
    Route::post('/userUpdatePost/{id}', [ProfileController::class, 'userUpdatePost'])->name('userUpdatePost');
    Route::post('/follow', [InteractionController::class, 'followUser'])->name('followUser');
});