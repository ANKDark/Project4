<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        /*
        $table->increments('id');
        $table->string('name');
        $table->string('email')->unique('email');
        $table->string('password');
        $table->string('profile_photo_path')->nullable();
        $table->dateTime('email_verified_at')->nullable();
        $table->rememberToken();
        $table->enum('status', ['Active', 'Inactive'])->nullable()->default('Active');
        $table->enum('role', ['Admin', 'User'])->nullable()->default('User');
        $table->dateTime('created_at')->nullable()->useCurrent();
        $table->dateTime('updated_at')->useCurrentOnUpdate()->nullable()->useCurrent();*/

        // Schema::create('users', function (Blueprint $table) {
        //     $table->increments('id');
        //     $table->string('name');
        //     $table->string('email')->unique();
        //     $table->timestamp('email_verified_at')->nullable();
        //     $table->string('profile_photo_path')->nullable();
        //     $table->string('password');
        //     $table->enum('status', ['Active', 'Inactive'])->nullable()->default('Active');
        //     $table->enum('role', ['Admin', 'User'])->nullable()->default('User');
        //     $table->rememberToken();
        //     $table->dateTime('created_at')->nullable()->useCurrent();
        //     $table->dateTime('updated_at')->useCurrentOnUpdate()->nullable()->useCurrent();
        // });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
