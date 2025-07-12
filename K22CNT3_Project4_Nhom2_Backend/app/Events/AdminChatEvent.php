<?php

namespace App\Events;

use App\Models\AdminChat;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AdminChatEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $adminChat;

    public function __construct(AdminChat $adminChat)
    {
        $this->adminChat = $adminChat->load('admin');
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
        return 'admin.chat';
    }

    public function broadcastWith(): array
    {
        return [
            'adminChat' => $this->adminChat->toArray(),
        ];
    }
}