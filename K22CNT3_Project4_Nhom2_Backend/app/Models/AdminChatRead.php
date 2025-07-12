<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminChatRead extends Model
{
    protected $table = 'AdminChatReads';

    public $timestamps = false;

    protected $fillable = [
        'IdAdmin',
        'IdAdminChat',
        'read_at',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(AdminAccounts::class, 'IdAdmin');
    }

    public function chat(): BelongsTo
    {
        return $this->belongsTo(AdminChat::class, 'IdAdminChat');
    }
}
