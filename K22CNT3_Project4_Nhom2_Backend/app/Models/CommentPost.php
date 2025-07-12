<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommentPost extends Model
{
    use HasFactory;

    protected $table = 'commentpost';
    protected $primaryKey = 'Id';
    public $timestamps = false;

    protected $fillable = [
        'IdUser',
        'IdProfilePost',
        'Visibility',
        'CreateDate',
    ];

    public function users()
    {
        return $this->belongsTo(User::class, 'IdUser', 'id');
    }

    public function profilePost()
    {
        return $this->belongsTo(ProfilePost::class, 'IdProfilePost', 'Id');
    }

    public function commentPostDetails()
    {
        return $this->hasMany(CommentPostDetails::class, 'IdCommentPost', 'Id');
    }
    public function commentPostDetailsReply()
    {
        return $this->hasMany(ReplyCommentsPost::class, 'IdCommentPost', 'Id');
    }

    public function interactionCommentPost()
    {
        return $this->hasMany(InteractionsComment::class, 'IdCommentPost', 'Id');
    }
}
