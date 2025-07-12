<?php

namespace App\Events;

use App\Models\ReplyCommentsPost;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ReplyCommentPostUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public ReplyCommentsPost $replyCommentPost, public bool $isDeleted = false)
    {
        Log::info('Broadcasting replycommentpost updated event', ['replyCommentPost' => $this->replyCommentPost]);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel("replycommentpost.{$this->replyCommentPost->IdCommentPost}"),
            new PrivateChannel("private-admin"),
            new Channel('channel-admin'),

        ];
    }

    public function broadcastAs(): string
    {
        return 'admin.replycommentpost';
    }
}
