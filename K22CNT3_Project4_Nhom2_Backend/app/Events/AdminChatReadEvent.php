<?php

namespace App\Events;

use App\Models\AdminChatRead;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AdminChatReadEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $adminChatRead;

    public function __construct(AdminChatRead $adminChatRead)
    {
        // Eager-load mối quan hệ admin
        $this->adminChatRead = $adminChatRead->load('admin');
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('private-admin'),
            new Channel('channel-admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'admin.chat.read';
    }

    public function broadcastWith(): array
    {
        return [
            'adminChatRead' => $this->adminChatRead->toArray(),
        ];
    }
}