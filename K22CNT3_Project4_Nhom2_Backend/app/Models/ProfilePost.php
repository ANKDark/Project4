<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfilePost extends Model
{
    use HasFactory;

    protected $table = 'profilepost';

    protected $primaryKey = 'Id';
    protected $fillable = [
        'IdUser',
        'Content',
        'Status',
        'Image',
        'created_at',
        'updated_at',
    ];

    public function users()
    {
        return $this->belongsTo(User::class, 'IdUser', 'id');
    }

    public function commentPost()
    {
        return $this->hasMany(CommentPost::class, 'IdProfilePost', 'Id')
            ->with([
                'users',
                'commentPostDetails',
                'commentPostDetailsReply.user',
                'commentPostDetailsReply.userReply',
                'commentPostDetailsReply.interactionReplyCommentPost',
                'interactionCommentPost'
            ]);
    }
    public function interactionPost()
    {
        return $this->hasMany(InteractionPost::class, 'IdPost', 'Id');
    }
}
