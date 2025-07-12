<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class FilterSensitiveWords
{
    public function handle(Request $request, Closure $next)
    {
        $input = $request->all();
        $badWords = include resource_path('sensitive_words.php');

        $pattern = '/\b(' . implode('|', array_map(function ($word) {
            return preg_quote($word, '/');
        }, $badWords)) . ')\b/iu';

        $errors = [];

        foreach ($input as $key => $value) {
            if (is_string($value)) {
                if (preg_match($pattern, $value, $matches)) {
                    $errors[$key][] = "Nội dung chứa từ không phù hợp: " . $matches[1];
                }
            }
        }

        if (!empty($errors)) {
            throw ValidationException::withMessages($errors);
        }

        return $next($request);
    }
}

