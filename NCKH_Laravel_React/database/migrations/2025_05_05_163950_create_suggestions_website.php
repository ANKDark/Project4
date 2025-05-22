<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('suggestions_website', function (Blueprint $table) {
            $table->id();
            $table->string('user_name')->nullable();
            $table->string('suggestion_type');
            $table->text('description');
            $table->boolean('resolved')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suggestions_website');
    }
};
