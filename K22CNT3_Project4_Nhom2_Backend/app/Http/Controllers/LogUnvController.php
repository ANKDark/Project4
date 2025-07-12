<?php

namespace App\Http\Controllers;

use App\Models\UniversityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class LogUnvController extends Controller
{
    public function logSearch(Request $request)
    {
        $request->validate([
            'IdTruong' => 'required|integer',
        ]);

        $userId = Auth::guard('api')->id();
        $ip = $request->getClientIp();
        $truongId = $request->IdTruong;

        $alreadyLogged = UniversityLog::where('type', 'search')
            ->where('IdTruong', $truongId)
            ->where(function ($q) use ($userId, $ip) {
                if ($userId) {
                    $q->where('IdUser', $userId);
                } else {
                    $q->where('ip_address', $ip);
                }
            })
            ->where('created_at', '>=', now()->subMinutes(1))
            ->exists();

        if (!$alreadyLogged) {
            UniversityLog::create([
                'IdTruong' => $truongId,
                'type' => 'visit',
                'IdUser' => $userId,
                'ip_address' => $ip,
                'created_at' => now(),
            ]);
        }
    }

    public function logVisit(Request $request)
    {
        $request->validate([
            'IdTruong' => 'required|integer',
        ]);

        $userId = Auth::guard('api')->id();
        $ip = $request->getClientIp();
        $truongId = $request->IdTruong;

        $alreadyLogged = UniversityLog::where('type', 'visit')
            ->where('IdTruong', $truongId)
            ->where(function ($q) use ($userId, $ip) {
                if ($userId) {
                    $q->where('IdUser', $userId);
                } else {
                    $q->where('ip_address', $ip);
                }
            })
            ->where('created_at', '>=', now()->subMinutes(1))
            ->exists();

        if (!$alreadyLogged) {
            UniversityLog::create([
                'IdTruong' => $truongId,
                'type' => 'visit',
                'IdUser' => $userId,
                'ip_address' => $ip,
                'created_at' => now(),
            ]);
        }
    }
}