<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Truong extends Model
{
    use HasFactory;

    protected $table = 'truong';

    protected $primaryKey = 'Id';
    public $timestamps = false;

    protected $fillable = [
        'TenTruong',
        'MoTaTruong',
        'NamThanhLap',
        'Img',
        'IdCategory',
        'AverageRating',
        'Is_verified',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'IdCategory');
    }
    public function comments()
    {
        
        return $this->hasMany(Comment::class, 'IdTruong', 'Id');
    }

    public function commentDetails()
    {
        return $this->hasManyThrough(CommentDetails::class, Comment::class, 'IdTruong', 'IdComment', 'Id', 'Id');
    }

    public function users()
    {
        return $this->hasManyThrough(User::class, Comment::class, 'IdTruong', 'id', 'Id', 'IdUser');
    }

    public function replyToComments()
    {
        return $this->hasManyThrough(ReplyToComment::class, Comment::class, 'IdTruong', 'IdComment', 'Id', 'Id');
    }

    public function interactions()
    {
        return $this->hasManyThrough(Interactions::class, Comment::class, 'IdTruong', 'IdComment', 'Id', 'Id');
    }
    public function ratings()
    {
        return $this->hasMany(Rating_Unv::class, 'IdTruong', 'Id');
    }
}
