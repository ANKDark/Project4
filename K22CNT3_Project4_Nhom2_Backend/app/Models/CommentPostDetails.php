<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommentPostDetails extends Model
{
    use HasFactory;

    protected $table = 'commentpostdetails';
    protected $primaryKey = 'Id';
    public $timestamps = false;
    protected $fillable = [
        'IdCommentPost',
        'Text',
        'CreateDate',
    ];

    public function commentPost()
    {
        return $this->belongsTo(CommentPost::class, 'IdCommentPost', 'Id');
    }
}
