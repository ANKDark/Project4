<?php

namespace App\Events;

use App\Models\Truong;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class UniversityManagerUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $truong;
    public $type;

    /**
     * Create a new event instance.
     */
    public function __construct(Truong $truong, string $type)
    {
        $this->truong = $truong;
        $this->type = $type;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('channel-admin'),
        ];
    }

    /**
     * Define the event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs()
    {
        return 'university.updated';
    }

    /**
     * Customize the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        $this->truong->load('category', 'ratings');
        return [
            'type' => $this->type,
            'truong' => $this->truong->toArray(),
        ];
    }
}