<?php

namespace App\Http\Controllers\Admin;

use App\Events\AdminChatEvent;
use App\Events\AdminChatReadEvent;
use App\Http\Controllers\Controller;
use App\Models\AdminChat;
use App\Models\AdminChatRead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Broadcast;

class ChatController extends Controller
{
    public function index()
    {
        $messages = AdminChat::with([
            'admin' => function ($query) {
                $query->select('id', 'name', 'avatar');
            },
            'reads.admin' => function ($query) {
                $query->select('id', 'name');
            }
        ])
            ->orderBy('created_at', 'asc')
            ->get(['id', 'IdAdmin', 'Message', 'FilePath', 'created_at']);

        return response()->json([
            'messages' => $messages,
            'adminId' => Auth::guard('admin')->id(),
        ], 200);
    }

    public function markAsRead(Request $request)
    {
        $adminId = Auth::guard('admin')->id();

        $unread = AdminChat::where('IdAdmin', '!=', $adminId)
            ->whereDoesntHave('reads', function ($query) use ($adminId) {
                $query->where('IdAdmin', $adminId);
            })
            ->pluck('id');

        foreach ($unread as $chatId) {
            $read = AdminChatRead::create([
                'IdAdminChat' => $chatId,
                'IdAdmin' => $adminId,
                'read_at' => now(),
            ]);

            Broadcast::event(new AdminChatReadEvent($read));
        }

        return response()->json(['message' => 'Đã đánh dấu tin nhắn đã đọc'], 200);
    }

    public function sendMessage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required_without:file|string|max:1000',
            'file' => 'nullable|file|mimes:jpg,jpeg,png,gif,bmp,webp,pdf,doc,docx,xls,xlsx,ppt,pptx,zip,rar,7z,mp4,mov,avi,mkv,wmv|max:307200',
        ], [
            'message.required_without' => 'Vui lòng nhập tin nhắn hoặc chọn file.',
            'message.max' => 'Tin nhắn không được vượt quá 1000 ký tự.',
            'file.mimes' => 'Tệp phải có định dạng hợp lệ: jpg, jpeg, png, gif, bmp, webp, pdf, doc, docx, xls, xlsx, ppt, pptx, zip, rar, 7z, mp4, mov, avi, mkv, wmv.',
            'file.max' => 'Dung lượng tệp tối đa là 300MB.',
            'file.file' => 'Tệp không hợp lệ.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $adminId = Auth::guard('admin')->id();
        $filePath = null;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('FileChat', 'public');
            $filePath = Storage::url($path);
        }

        $adminChat = AdminChat::create([
            'IdAdmin' => $adminId,
            'Message' => $request->input('message'),
            'FilePath' => $filePath,
        ]);

        Broadcast::event(new AdminChatEvent($adminChat->load(['admin', 'reads'])));

        return response()->json([
            'message' => 'Tin nhắn đã được gửi',
            'adminChat' => $adminChat->load(['admin', 'reads']),
        ], 200);
    }
}