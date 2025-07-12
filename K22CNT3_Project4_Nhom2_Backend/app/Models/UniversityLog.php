<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UniversityLog extends Model
{
    protected $table = 'university_logs';

    public $timestamps = false;

    protected $fillable = [
        'IdTruong',
        'IdUser',
        'ip_address',
        'type',
        'created_at',
    ];

    public function truong()
    {
        return $this->belongsTo(Truong::class, 'IdTruong');
    }
}