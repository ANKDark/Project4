<?php
namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements MustVerifyEmail, JWTSubject
{
    use HasFactory, Notifiable;

    protected $table = 'Users';
    protected $primaryKey = 'id';
    protected $fillable = [
        'name',
        'email',
        'password',
        'profile_photo_path',
        'status',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    public function Comments()
    {
        return $this->hasMany(Comment::class, 'IdUser', 'id');
    }

    public function commentPost()
    {
        return $this->hasMany(CommentPost::class, 'IdUser', 'id');
    }

    public function replyToComments()
    {
        return $this->hasMany(ReplyToComment::class, 'IdUser', 'id');
    }

    public function interactions()
    {
        return $this->hasMany(Interactions::class, 'IdUser', 'id');
    }

    public function interactionPost()
    {
        return $this->hasMany(InteractionPost::class, 'IdUser', 'id');
    }

    public function ratings()
    {
        return $this->hasMany(Rating_Unv::class, 'IdUser', 'id');
    }

    public function following()
    {
        return $this->hasMany(FollowRelation::class, 'FollowerID', 'id');
    }

    public function followers()
    {
        return $this->hasMany(FollowRelation::class, 'FollowedUserID', 'id');
    }

    public function profileposts()
    {
        return $this->hasMany(ProfilePost::class, 'IdUser', 'id');
    }

    public function userinfo()
    {
        return $this->hasMany(UserInfo::class, 'IdUser', 'id');
    }

    public function commentPostsThroughProfilePosts()
    {
        return $this->hasManyThrough( CommentPost::class, ProfilePost::class, 'IdUser', 'IdProfilePost', 'id', 'id');
    }
}