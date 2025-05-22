<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReplyCommentsPost extends Migration
{
    public function up()
    {
        Schema::create('ReplyCommentsPost', function (Blueprint $table) {
            $table->id('id');
            $table->unsignedInteger('IdUser')->length(10);
            $table->unsignedInteger('IdCommentPost')->length(10);
            $table->unsignedInteger('IdUserReply')->nullable()->length(10);
            $table->text('Text')->notNull();
            $table->timestamp('CreateDate')->useCurrent();

            $table->foreign('IdUser')->references('id')->on('users');
            $table->foreign('IdCommentPost')->references('Id')->on('commentpost');
            $table->foreign('IdUserReply')->references('id')->on('users');
        });
    }

    public function down()
    {
        Schema::dropIfExists('ReplyCommentsPost');
    }
}
