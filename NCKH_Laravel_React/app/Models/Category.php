<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $table = 'Category';
    protected $primaryKey = 'IdCategory';

    protected $fillable = [
        'CategoryName',
        'Description',
    ];

    public function truongs()
    {
        return $this->hasMany(Truong::class, 'IdCategory', 'IdCategory');
    }
}

