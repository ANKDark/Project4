<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReplyCommentsPost extends Model
{
    use HasFactory;

    protected $table = 'ReplyCommentsPost';

    protected $primaryKey = 'id';

    public $incrementing = true;

    public $timestamps = false;

    protected $fillable = [
        'IdUser',
        'IdCommentPost',
        'IdUserReply',
        'Text',
        'CreateDate',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'IdUser');
    }

    public function commentPost()
    {
        return $this->belongsTo(CommentPost::class, 'IdCommentPost');
    }

    public function userReply()
    {
        return $this->belongsTo(User::class, 'IdUserReply');
    }

    public function interactionReplyCommentPost()
    {
        return $this->hasMany(InteractionsComment::class, 'IdReplyCommentPost', 'id');
    }
}
