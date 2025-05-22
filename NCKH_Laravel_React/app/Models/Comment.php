<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $table = 'Comment';
    protected $primaryKey = 'Id';
    public $timestamps = false;
    protected $fillable = [
        'IdUser',
        'IdTruong',
        'Visibility',
        'CreateDate',
    ];

    public function users()
    {
        return $this->belongsTo(User::class, 'IdUser', 'id');
    }

    public function truong()
    {
        return $this->belongsTo(Truong::class, 'IdTruong', 'Id');
    }

    public function commentDetails()
    {
        return $this->hasMany(CommentDetails::class, 'IdComment', 'Id');
    }

    public function replyToComments()
    {
        return $this->hasMany(ReplyToComment::class, 'IdComment', 'Id');
    }

    public function interactions() {
        return $this->hasMany(Interactions::class, 'IdComment', 'Id');
    }
}
