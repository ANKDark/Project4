<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SuggestionWebsite extends Model
{
    use HasFactory;

    protected $table = 'suggestions_website';
    protected $primaryKey = 'id';

    protected $fillable = [
        'user_name',
        'suggestion_type',
        'description',
        'resolved',
        'created_at',
        'updated_at',
    ];
}
