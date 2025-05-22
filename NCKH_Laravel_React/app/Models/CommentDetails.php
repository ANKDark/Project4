<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommentDetails extends Model
{
    use HasFactory;

    protected $table = 'CommentDetails';
    protected $primaryKey = 'IdDetails';
    public $timestamps = false;
    protected $fillable = [
        'IdComment',
        'Text',
        'CreateDate',
    ];

    public function comments()
    {
        return $this->belongsTo(Comment::class, 'IdComment', 'Id');
    }
}
