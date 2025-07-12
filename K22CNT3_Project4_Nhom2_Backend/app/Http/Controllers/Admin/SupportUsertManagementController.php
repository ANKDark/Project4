<?php

namespace App\Http\Controllers\Admin;

use App\Events\AdminNotificationRT;
use App\Events\SuggestionWebsiteUpdated;
use App\Events\SystemErrorUpdated;
use App\Events\ViolationReportUpdated;
use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use App\Models\SuggestionWebsite;
use App\Models\SystemError;
use App\Models\ViolationReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SupportUsertManagementController extends Controller
{
    public function updateFixed($id)
    {
        $error = SystemError::find($id);
        $error->is_fixed = !$error->is_fixed;
        $error->save();

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Update";
        $notification->Content = "Cập nhật thành công lỗi: " . $error->name;
        $notification->ActionTime = Date('Y-m-d H:i:s');
        $notification->save();

        broadcast(new AdminNotificationRT($notification))->toOthers();
        broadcast(new SystemErrorUpdated($error, "Update"))->toOthers();
    }

    public function deleteSystemError($id)
    {
        $error = SystemError::find($id);
        $oldError = $error->replicate();
        $oldError->setAttribute('id', $error->id);

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Delete";
        $notification->Content = "Xóa lỗi: " . $error->name;
        $notification->ActionTime = Date('Y-m-d H:i:s');
        $notification->save();

        broadcast(new AdminNotificationRT($notification))->toOthers();
        broadcast(new SystemErrorUpdated($oldError, "Delete"))->toOthers();
        $error->delete();
    }

    public function updateResolved($id)
    {
        $violation = ViolationReport::find($id);
        $violation->resolved = !$violation->resolved;
        $violation->save();

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Update";
        $notification->Content = "Cập nhật thành công tố cáo: " . $violation->violation_type;
        $notification->ActionTime = Date('Y-m-d H:i:s');
        $notification->save();

        broadcast(new AdminNotificationRT($notification))->toOthers();
        broadcast(new ViolationReportUpdated($violation, "Update"))->toOthers();
    }

    public function deleteViolationReport($id)
    {
        $violation = ViolationReport::find($id);
        $oldViolation = $violation->replicate();
        $oldViolation->setAttribute('id', $violation->id);

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Delete";
        $notification->Content = "Xóa tố cáo: " . $violation->violation_type;
        $notification->ActionTime = Date('Y-m-d H:i:s');
        $notification->save();

        broadcast(new AdminNotificationRT($notification))->toOthers();
        broadcast(new ViolationReportUpdated($oldViolation, "Delete"))->toOthers();
        $violation->delete();
    }

    public function updatedSuggestionWebsite($id)
    {
        $suggestion = SuggestionWebsite::find($id);
        $suggestion->resolved = !$suggestion->resolved;
        $suggestion->save();

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Update";
        $notification->Content = "Cập nhật tố cáo: " . $suggestion->suggestion_type;
        $notification->ActionTime = Date('Y-m-d H:i:s');
        $notification->save();

        broadcast(new AdminNotificationRT($notification))->toOthers();
        broadcast(new SuggestionWebsiteUpdated($suggestion, "Update"))->toOthers();
    }

    public function deleteSuggestionWebsite($id)
    {
        $suggestion = SuggestionWebsite::find($id);
        $oldSuggestion = $suggestion->replicate();
        $oldSuggestion->setAttribute('id', $suggestion->id);

        $notification = new AdminNotification;
        $notification->AdminId = Auth::guard('admin')->user()->id;
        $notification->Type = "Delete";
        $notification->Content = "Xóa tố cáo: " . $suggestion->suggestion_type;
        $notification->ActionTime = Date('Y-m-d H:i:s');
        $notification->save();

        broadcast(new AdminNotificationRT($notification))->toOthers();
        broadcast(new SuggestionWebsiteUpdated($oldSuggestion, "Delete"))->toOthers();
        $suggestion->delete();
    }
}
