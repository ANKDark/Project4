<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('interactionsComment', function (Blueprint $table) {
           $table->integer('id', false, true)->autoIncrement()->primary();
            $table->unsignedInteger('IdUser')->index();
            $table->unsignedInteger('IdCommentPost')->nullable()->index();
            $table->unsignedInteger('IdReplyCommentPost')->nullable()->index();
            $table->boolean('Like');
            $table->date('created_at');

            $table->foreign('IdUser')->references('id')->on('users');
            $table->foreign('IdCommentPost')->references('Id')->on('commentpost');
            $table->foreign('IdReplyCommentPost')->references('id')->on('replycommentspost');
        });

        DB::statement("
            ALTER TABLE interactionsComment
            ADD CONSTRAINT chk_one_comment_or_reply CHECK (
                (IdCommentPost IS NOT NULL AND IdReplyCommentPost IS NULL)
                OR
                (IdCommentPost IS NULL AND IdReplyCommentPost IS NOT NULL)
            )
        ");
    }

    public function down(): void
    {
        Schema::dropIfExists('interactionsComment');
    }
};

