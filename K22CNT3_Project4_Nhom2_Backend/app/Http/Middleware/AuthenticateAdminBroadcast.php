<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class AuthenticateAdminBroadcast
{
    public function handle($request, Closure $next)
    {
        if ($request->is('broadcasting/auth')) {
            if (Auth::guard('admin')->check()) {
                Auth::shouldUse('admin');
            }
        }

        return $next($request);
    }
}
