<?php

namespace App\Events;

use App\Models\Comment;
use App\Models\CommentDetails;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CommentUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public $comment;
    public $commentDetails;
    public $isDeleted;
    public function __construct(Comment $comment, CommentDetails $commentDetails, bool $isDeleted = false)
    {
        $this->comment = $comment;
        $this->commentDetails = $commentDetails;
        $this->isDeleted = $isDeleted;
    }
    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel("comment.{$this->comment->IdTruong}"),
            new PrivateChannel("private-admin"),
            new Channel("channel-admin"),
        ];
    }

    public function broadcastAs()
    {
        return 'admin.comment';
    }
}
