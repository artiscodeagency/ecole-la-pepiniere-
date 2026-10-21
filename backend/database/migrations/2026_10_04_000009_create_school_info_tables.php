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
        // Single values: contacts, address, hours, social links, academic year...
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Amounts are whole FCFA, formatted by the frontend for each language.
        Schema::create('school_fees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->nullable()->constrained()->restrictOnDelete();
            $table->string('label_fr');
            $table->string('label_en')->nullable();
            $table->unsignedInteger('first_installment');
            $table->unsignedInteger('second_installment');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('admission_fees', function (Blueprint $table) {
            $table->id();
            $table->string('label_fr');
            $table->string('label_en')->nullable();
            $table->unsignedInteger('amount')->nullable();
            // For items that are not an amount, such as two rolls of toilet paper.
            $table->string('amount_text_fr')->nullable();
            $table->string('amount_text_en')->nullable();
            $table->foreignId('section_id')->nullable()->constrained()->restrictOnDelete();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('required_documents', function (Blueprint $table) {
            $table->id();
            $table->string('label_fr');
            $table->string('label_en')->nullable();
            $table->foreignId('section_id')->nullable()->constrained()->restrictOnDelete();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('faq_items', function (Blueprint $table) {
            $table->id();
            $table->string('question_fr');
            $table->string('question_en')->nullable();
            $table->text('answer_fr');
            $table->text('answer_en')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
        });

        Schema::create('transport_tariffs', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('amount');
            $table->string('label_fr')->nullable();
            $table->string('label_en')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('staff_members', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('role_fr');
            $table->string('role_en')->nullable();
            $table->foreignId('photo_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_members');
        Schema::dropIfExists('transport_tariffs');
        Schema::dropIfExists('faq_items');
        Schema::dropIfExists('required_documents');
        Schema::dropIfExists('admission_fees');
        Schema::dropIfExists('school_fees');
        Schema::dropIfExists('settings');
    }
};
