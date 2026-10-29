<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sellers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('business_name');
            $table->string('store_name')->unique();
            $table->string('store_slug')->unique();
            $table->text('store_description')->nullable();
            $table->string('store_logo')->nullable();
            $table->string('store_banner')->nullable();
            $table->string('business_registration_number')->nullable();
            $table->string('tax_number')->nullable();
            $table->enum('verification_status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->decimal('commission_rate', 5, 2)->default(0);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('total_products')->default(0);
            $table->integer('total_reviews')->default(0);
            $table->integer('total_orders')->default(0);
            $table->decimal('total_revenue', 15, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('verification_status');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sellers');
    }
};