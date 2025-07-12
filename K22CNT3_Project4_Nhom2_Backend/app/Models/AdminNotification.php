<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminNotification extends Model
{
    protected $table = 'AdminNotifications';
    public $timestamps = false;
    protected $primaryKey = 'id';
    protected $fillable = [
        'AdminId',
        'Type',
        'Content',
        'ActionTime',
    ];

    public function admin()
    {
        return $this->belongsTo(AdminAccounts::class, 'AdminId');
    }
}
