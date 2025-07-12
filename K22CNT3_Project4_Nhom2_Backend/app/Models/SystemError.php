<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemError extends Model
{
    use HasFactory;

    protected $table = 'system_errors';
    protected $primaryKey = 'id';
    protected $fillable = [
        'name',
        'description',
        'error_time',
        'os',
        'attachment_path',
        'is_fixed',
    ];

    protected $casts = [
        'error_time' => 'datetime',
        'is_fixed' => 'boolean',
    ];
}
