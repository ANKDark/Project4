<?php

use App\Models\AdminAccounts;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

Broadcast::channel('admin-status', function ($admin) {
    return !is_null($admin);
}, ['guards' => ['admin']]);


Broadcast::channel('private-admin', function ($admin) {
    return !is_null($admin);
}, ['guards' => ['admin']]);



