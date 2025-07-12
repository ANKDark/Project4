<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as BaseVerifier;

class DisableCsrfForBroadcast extends BaseVerifier
{
    protected function inExceptArray($request)
    {
        return $request->is('admin/broadcasting/auth');
    }
}
