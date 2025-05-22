<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InteractionsComment extends Model
{
    protected $table = 'interactionscomment';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'IdUser',
        'IdCommentPost',
        'IdReplyCommentPost',
        'Like',
        'created_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'IdUser');
    }

    public function commentPost()
    {
        return $this->belongsTo(CommentPost::class, 'IdCommentPost');
    }

    public function replyCommentPost()
    {
        return $this->belongsTo(ReplyCommentsPost::class, 'IdReplyCommentPost');
    }

}
