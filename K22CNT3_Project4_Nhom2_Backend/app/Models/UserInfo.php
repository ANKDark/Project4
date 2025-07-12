<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserInfo extends Model
{
    use HasFactory;

    protected $table = 'userinfo';  
    protected $primaryKey = 'Id';
    public $incrementing = true;  
    public $timestamps = false;

    protected $fillable = [
        'IdUser',
        'DateOfBirth',
        'Birthplace',
        'Residence',
        'Education',
        'CreatedAt',
    ];

    public function users() {
        return $this->belongsTo(User::class, 'IdUser', 'id');
    }
}
