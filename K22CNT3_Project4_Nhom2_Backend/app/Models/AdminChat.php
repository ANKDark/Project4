<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminChat extends Model
{
    protected $table = 'AdminChats';

    protected $primaryKey = 'id';

    public $timestamps = true;

    protected $fillable = [
        'IdAdmin',
        'Message',
        'FilePath',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(AdminAccounts::class, 'IdAdmin');
    }

    public function reads()
    {
        return $this->hasMany(AdminChatRead::class, 'IdAdminChat');
    }
}
