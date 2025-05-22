<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class ViolationReport extends Model
{
    use HasFactory;

    protected $table = 'violation_reports';
    protected $primaryKey = 'id';

    protected $fillable = [
        'violation_type',
        'description',
        'datetime',
        'user_id',
        'image_path',
        'resolved',
    ];

    protected $casts = [
        'resolved' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
