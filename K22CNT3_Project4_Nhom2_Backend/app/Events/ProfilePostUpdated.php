<?php

namespace App\Events;

use App\Models\ProfilePost;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProfilePostUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public array $followerIds;
    public $message;
    public function __construct(public ProfilePost $post, $message, public bool $isDeleted = false)
    {
        $this->followerIds = $post->users->followers->pluck('FollowerID')->toArray();
        $this->message = $message;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel("post.{$this->post->IdUser}"),
            new PrivateChannel("private-admin"),
            new Channel('channel-admin'),

        ];
    }

    public function broadcastAs(): string
    {
        return 'admin.profilepost';
    }
}
