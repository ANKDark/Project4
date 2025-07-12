<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\OnlineAdminManager;
use App\Http\Controllers\Controller;
use App\Models\AdminAccounts;
use App\Models\Category;
use App\Models\Comment;
use App\Models\ProfilePost;
use App\Models\SuggestionWebsite;
use App\Models\SystemError;
use App\Models\Truong;
use App\Models\UniversityLog;
use App\Models\User;
use App\Models\ViolationReport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DasboardManagementController extends Controller
{
    public function indexUnv(Request $request)
    {
       $currentAdmin = Auth::guard('admin')->user();
        if (!$currentAdmin) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $unv = Truong::with([
            'category',
            'comments',
            'ratings',
        ])->get();

        $categories = Category::all();

        return response()->json([
            'universities' => $unv,
            'categories' => $categories,
            'currentAdmin' => $currentAdmin,
        ], 200);
    }

    public function listAdminOnline(Request $request)
    {
        $currentAdmin = Auth::guard('admin')->user();

        if (!$currentAdmin) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $listAdmin = OnlineAdminManager::all();

        return response()->json([
            'listAdmin' => $listAdmin,
            'currentAdmin' => $currentAdmin,
        ], 200);
    }

    public function listAccount()
    {
        $currentAdmin = Auth::guard('admin')->user();

        if (!$currentAdmin) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        if ($currentAdmin->role != '1') {
            return response()->json(['message' => 'Bạn không đủ quyền để truy cập trang này.'], 403);
        }

        $listAccountAdmins = AdminAccounts::all();
        $listAccountUsers = User::with('following', 'followers', 'userinfo')->get();

        return response()->json([
            'currentAdmin' => $currentAdmin,
            'listAccountAdmins' => $listAccountAdmins,
            'listAccountUsers' => $listAccountUsers,
        ], 200);
    }

    public function listCategory(Request $request)
    {
        $currentAdmin = Auth::guard('admin')->user();

        if (!$currentAdmin) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $categories = Category::all();

        return response()->json([
            'categories' => $categories,
        ], 200);
    }

    public function listComment(Request $request)
    {
        $currentAdmin = Auth::guard('admin')->user();

        if (!$currentAdmin) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $comment = Comment::with(['truong', 'users', 'commentDetails', 'replyToComments', 'interactions'])->get();
        $user = User::all();

        return response()->json([
            'comment' => $comment,
            'user' => $user,
        ], 200);
    }

    public function listProfilePost(Request $request)
    {
        $currentAdmin = Auth::guard('admin')->user();

        if (!$currentAdmin) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $profilePost = ProfilePost::with(['commentPost', 'users', 'interactionPost'])->get();
        $user = User::all();

        return response()->json([
            'profilePost' => $profilePost,
            'user' => $user,
        ], 200);
    }

    public function listSystemError(Request $request)
    {
        $currentAdmin = Auth::guard('admin')->user();

        if (!$currentAdmin) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $systemError = SystemError::all();

        return response()->json([
            'systemError' => $systemError,
        ], 200);
    }

    public function listViolationReport(Request $request)
    {
        $currentAdmin = Auth::guard('admin')->user();

        if (!$currentAdmin) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $violationReport = ViolationReport::all();

        return response()->json([
            'violationReport' => $violationReport,
        ], 200);
    }

    public function listSuggestionWebsite(Request $request)
    {
        $currentAdmin = Auth::guard('admin')->user();

        if (!$currentAdmin) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $suggestionWebsite = SuggestionWebsite::all();

        return response()->json([
            'suggestionWebsite' => $suggestionWebsite,
        ], 200);
    }

    public function index(Request $request)
    {
        if (!Auth::guard('admin')->check()) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }
        $stats = [
            'totalUsers' => User::count(),
            'totalPosts' => ProfilePost::count(),
            'totalViolations' => ViolationReport::count(),
            'totalErrors' => SystemError::count(),
            'totalSuggestions' => SuggestionWebsite::count(),
            'totalUniversities' => Truong::count(),
            'totalCategories' => Category::count(),
        ];

        $violationsByMonth = ViolationReport::selectRaw('MONTH(datetime) as month, COUNT(*) as count')
            ->groupBy('month')
            ->pluck('count', 'month')
            ->toArray();
        $errorsByMonth = SystemError::selectRaw('MONTH(error_time) as month, COUNT(*) as count')
            ->groupBy('month')
            ->pluck('count', 'month')
            ->toArray();

        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;
        $topUniversities = UniversityLog::selectRaw('IdTruong, COUNT(*) as visit_count')
            ->whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->groupBy('IdTruong')
            ->orderByDesc('visit_count')
            ->limit(5)
            ->with([
                'truong' => function ($query) {
                    $query->select('Id', 'TenTruong');
                }
            ])
            ->get()
            ->map(function ($log) {
                return [
                    'IdTruong' => $log->IdTruong,
                    'TenTruong' => $log->truong ? $log->truong->TenTruong : 'Không xác định',
                    'visit_count' => $log->visit_count,
                ];
            });

        $chartData = [
            'violationsByMonth' => array_replace(array_fill(1, 12, 0), $violationsByMonth),
            'errorsByMonth' => array_replace(array_fill(1, 12, 0), $errorsByMonth),
            'violationStatus' => [
                'resolved' => ViolationReport::where('resolved', true)->count(),
                'unresolved' => ViolationReport::where('resolved', false)->count(),
            ],
            'suggestionStatus' => [
                'resolved' => SuggestionWebsite::where('resolved', true)->count(),
                'unresolved' => SuggestionWebsite::where('resolved', false)->count(),
            ],
        ];

        return response()->json([
            'dashboardData' => compact('stats', 'chartData', 'topUniversities')
        ], 200);
    }
}