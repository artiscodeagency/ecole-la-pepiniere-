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
        Schema::create('news', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title_fr');
            $table->string('title_en')->nullable();
            $table->text('excerpt_fr');
            $table->text('excerpt_en')->nullable();
            $table->longText('body_fr');
            $table->longText('body_en')->nullable();
            $table->foreignId('category_id')->constrained('news_categories')->restrictOnDelete();
            $table->foreignId('cover_media_id')->nullable()->constrained('media')->restrictOnDelete();
            // Share image for WhatsApp / Facebook; the cover is used when empty.
            $table->foreignId('og_media_id')->nullable()->constrained('media')->restrictOnDelete();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 20);
            // A future date schedules the publication.
            $table->timestamp('published_at')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->string('seo_title_fr')->nullable();
            $table->string('seo_title_en')->nullable();
            $table->string('seo_description_fr', 300)->nullable();
            $table->string('seo_description_en', 300)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'published_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('news');
    }
};
