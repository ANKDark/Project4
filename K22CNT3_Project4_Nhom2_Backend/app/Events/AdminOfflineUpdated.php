<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AdminOfflineUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $adminId;

    public function __construct($admin)
    {
        $this->adminId = $admin->id;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('admin-status');
        return new Channel('admin-status');
    }

    public function broadcastAs()
    {
        return 'admin.offline';
    }
}
