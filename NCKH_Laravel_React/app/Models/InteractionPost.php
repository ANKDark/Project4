<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InteractionPost extends Model
{
    use HasFactory;
    protected $table = 'interactionpost';
    public $timestamps = false;
    protected $primaryKey = 'id';


    protected $fillable = [
        'IdUser',
        'IdPost',
        'Like_or_Dislike',
    ];

    public function users()
    {
        return $this->belongsTo(User::class, 'IdUser', 'id');
    }

    public function profilePost()
    {
        return $this->belongsTo(ProfilePost::class, 'IdPost', 'Id');
    }
}
