<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FollowRelation extends Model
{
    protected $table = 'followrelations';

    protected $primaryKey = 'Id';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = ['FollowerID', 'FollowedUserID'];

    public function follower()
    {
        return $this->belongsTo(User::class, 'FollowerID');
    }

    public function followedUser()
    {
        return $this->belongsTo(User::class, 'FollowedUserID');
    }
}
