<?php

namespace App\Events;

use App\Models\CommentPost;
use App\Models\CommentPostDetails;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentPostUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public CommentPost $commentPost,public CommentPostDetails $commentPostDetails, public bool $isDeleted = false)
    {
        //
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel("commentpost.{$this->commentPost->IdProfilePost}"),
            new PrivateChannel("private-admin"),
            new Channel("channel-admin"),
        ];
    }

    public function broadcastAs()
    {
        return 'admin.commentpost';
    }
}
