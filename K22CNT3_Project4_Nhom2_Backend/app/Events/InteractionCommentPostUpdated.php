<?php

namespace App\Events;

use App\Models\InteractionsComment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class InteractionCommentPostUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public InteractionsComment $interactionsCommentPost)
    {
        Log::info($interactionsCommentPost);
    }
    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channelId = $this->interactionsCommentPost->IdCommentPost
            ?? $this->interactionsCommentPost->IdReplyCommentPost;

        return [
            new Channel("interactionCommentPost.{$channelId}"),
        ];
    }
}
