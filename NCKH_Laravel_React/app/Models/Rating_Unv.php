<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rating_Unv extends Model
{
    use HasFactory;

    protected $table = 'Rating_Unv';

    protected $primaryKey = 'Id';
    public $timestamps = false;

    protected $fillable = [
        'IdUser',
        'IdTruong',
        'Rate',
        'CreateDate',
    ];

    public function truong() {
        return $this->belongsTo(Truong::class, "IdTruong");
    }
    public function user() {
        return $this->belongsTo(User::class, "IdUser");
    }
}
