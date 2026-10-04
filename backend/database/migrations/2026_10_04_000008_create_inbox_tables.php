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
        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('email', 190);
            $table->string('phone', 30);
            $table->string('subject', 150);
            $table->text('message');
            $table->string('status', 20)->index();
            $table->timestamp('read_at')->nullable();
            $table->foreignId('handled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('handled_at')->nullable();
            $table->text('internal_note')->nullable();
            // HMAC of the sender IP: enough to spot abuse without storing the IP.
            $table->string('ip_hash', 64)->nullable();
            $table->timestamps();
        });

        Schema::create('admission_requests', function (Blueprint $table) {
            $table->id();
            $table->string('parent_name', 120);
            $table->string('child_name', 120);
            $table->date('child_birth_date');
            $table->foreignId('level_id')->nullable()->constrained('school_levels')->nullOnDelete();
            // Level as chosen in the form, kept until the official level list exists.
            $table->string('level_label', 100)->nullable();
            $table->string('phone', 30);
            $table->string('email', 190);
            $table->text('message')->nullable();
            $table->string('academic_year', 20)->nullable();
            $table->string('status', 20)->index();
            $table->foreignId('handled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('handled_at')->nullable();
            $table->text('internal_note')->nullable();
            $table->string('ip_hash', 64)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admission_requests');
        Schema::dropIfExists('contact_messages');
    }
};
