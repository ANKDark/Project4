<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Cache;

class OnlineAdminManager
{
    protected static $key = 'online_admins';

    public static function add($admin)
    {
        $admins = Cache::get(self::$key, []);
        $admins[$admin->id] = [
            'name' => $admin->name,
            'email' => $admin->email,
            'avatar' => $admin->avatar,
            'role' => $admin->role,
            'last_seen' => now()->toDateTimeString()
        ];
        Cache::put(self::$key, $admins, now()->addHours(12));
    }

    public static function remove($adminId)
    {
        $admins = Cache::get(self::$key, []);
        unset($admins[$adminId]);
        Cache::put(self::$key, $admins, now()->addHours(12));
    }

    public static function all()
    {
        return Cache::get(self::$key, []);
    }
}
