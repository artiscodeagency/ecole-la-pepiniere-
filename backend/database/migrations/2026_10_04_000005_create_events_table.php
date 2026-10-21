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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title_fr');
            $table->string('title_en')->nullable();
            $table->text('description_fr');
            $table->text('description_en')->nullable();
            $table->date('event_date');
            // For events lasting several days.
            $table->date('end_date')->nullable();
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('location_fr')->nullable();
            $table->string('location_en')->nullable();
            // Empty: the whole school.
            $table->foreignId('section_id')->nullable()->constrained()->restrictOnDelete();
            // Events share the official news categories.
            $table->foreignId('category_id')->nullable()->constrained('news_categories')->restrictOnDelete();
            $table->foreignId('image_media_id')->nullable()->constrained('media')->restrictOnDelete();
            $table->string('status', 20);
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'event_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
