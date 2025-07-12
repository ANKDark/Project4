<?php

namespace App\Http\Middleware;

use App\Models\AdminAccounts;
use App\Models\AdminNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;
use Illuminate\Support\Facades\Session;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $authType = null;
        $admin = Auth::guard('admin')->user();

        if (Auth::guard('admin')->check()) {
            $authType = 'admin';
        } elseif ($request->user()) {
            $authType = 'user';
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'admin' => Auth::guard('admin')->user(),
            ],
            'authType' => $authType,
            'flash' => [
                'newUser' => Session::get('newUser'),
                'newComment' => Session::get('newComment'),
                'newCommentDetails' => Session::get('newCommentDetails'),
                'newReplyToComment' => Session::get('newReplyToComment'),
                'newRating' => Session::get('newRating'),
            ],
            'notifications' => $authType === 'admin' ? AdminNotification::orderByDesc('ActionTime')->get() : [],
            'listadmin' => $authType === 'admin' ? AdminAccounts::select('id', 'name', 'email', 'avatar', 'role', 'phone')->get() : [],
        ];
    }
}
