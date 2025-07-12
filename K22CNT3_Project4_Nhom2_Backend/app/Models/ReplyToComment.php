<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReplyToComment extends Model
{
    use HasFactory;

    protected $table = 'replytocomment';
    protected $primaryKey = 'Id';
    public $timestamps = false;

    protected $fillable = [
        'IdUser',
        'IdComment',
        'Text',
        'CreateDate',
    ];

    public function users()
    {
        return $this->belongsTo(User::class, 'IdUser', 'id');
    }

    public function comment()
    {
        return $this->belongsTo(Comment::class, 'IdComment', 'Id');
    }
}
