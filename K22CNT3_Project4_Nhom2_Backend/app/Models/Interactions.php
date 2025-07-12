<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Interactions extends Model
{
    protected $table = 'interactions';
    public $timestamps = false;
    protected $primaryKey = 'Id';


    protected $fillable = [
        'IdUser',
        'IdComment',
        'Like_or_Dislike',
    ];

    public function users()
    {
        return $this->belongsTo(User::class, 'IdUser', 'id');
    }

    public function comments()
    {
        return $this->belongsTo(Comment::class, 'IdComment', 'Id');
    }
}
