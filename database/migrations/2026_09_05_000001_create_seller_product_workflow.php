<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('title')->nullable()->after('name');
            $table->string('short_name')->nullable()->after('title');
            $table->string('subtitle')->nullable()->after('short_name');
            $table->string('seller_sku')->nullable()->after('sku');
            $table->string('model_number')->nullable()->after('seller_sku');
            $table->string('model_name')->nullable()->after('model_number');
            $table->string('manufacturer')->nullable()->after('model_name');
            $table->string('product_type')->nullable()->after('manufacturer');
            $table->enum('condition', ['new', 'refurbished', 'used'])->default('new')->after('product_type');
            $table->text('highlights')->nullable()->after('description');
            $table->text('whats_included')->nullable()->after('highlights');
            $table->text('usage_instructions')->nullable()->after('whats_included');
            $table->text('care_instructions')->nullable()->after('usage_instructions');
            $table->decimal('cost_price', 15, 2)->nullable()->after('compare_price');
            $table->enum('discount_type', ['percentage', 'fixed'])->nullable()->after('cost_price');
            $table->decimal('discount_value', 15, 2)->nullable()->after('discount_type');
            $table->integer('reserved_quantity')->default(0)->after('stock_quantity');
            $table->integer('low_stock_threshold')->default(5)->after('reserved_quantity');
            $table->integer('min_order_quantity')->default(1)->after('low_stock_threshold');
            $table->integer('max_order_quantity')->nullable()->after('min_order_quantity');
            $table->string('barcode')->nullable()->after('max_order_quantity');
            $table->string('ean')->nullable()->after('barcode');
            $table->string('upc')->nullable()->after('ean');
            $table->string('isbn')->nullable()->after('upc');
            $table->string('gtin')->nullable()->after('isbn');
            $table->decimal('weight', 10, 3)->nullable()->after('gtin');
            $table->string('shipping_class')->nullable()->after('weight');
            $table->string('handling_time')->nullable()->after('shipping_class');
            $table->string('dispatch_time')->nullable()->after('handling_time');
            $table->string('shipping_method')->nullable()->after('dispatch_time');
            $table->string('estimated_delivery')->nullable()->after('shipping_method');
            $table->string('country_of_origin')->nullable()->after('estimated_delivery');
            $table->text('manufacturer_details')->nullable()->after('country_of_origin');
            $table->text('compliance_information')->nullable()->after('manufacturer_details');
            $table->string('seo_keywords')->nullable()->after('meta_description');
            $table->string('canonical_url')->nullable()->after('seo_keywords');
            $table->enum('status', ['draft', 'pending', 'approved', 'rejected', 'active', 'inactive'])->default('draft')->after('approval_status');
            $table->text('rejection_reason')->nullable()->after('status');
            $table->index(['seller_id', 'status']);
            $table->unique(['seller_id', 'seller_sku']);
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->decimal('mrp', 15, 2)->nullable()->after('price');
            $table->enum('discount_type', ['percentage', 'fixed'])->nullable()->after('mrp');
            $table->decimal('discount_value', 15, 2)->nullable()->after('discount_type');
            $table->string('color')->nullable()->after('discount_value');
            $table->string('size')->nullable()->after('color');
            $table->string('storage')->nullable()->after('size');
            $table->string('ram')->nullable()->after('storage');
            $table->decimal('weight', 10, 3)->nullable()->after('ram');
            $table->string('barcode')->nullable()->after('weight');
            $table->string('image_path')->nullable()->after('barcode');
            $table->json('attributes')->nullable()->after('image_path');
            $table->enum('status', ['active', 'inactive'])->default('active')->after('is_active');
        });

        Schema::create('product_videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('youtube_url')->nullable();
            $table->string('video_path')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->timestamps();
        });

        Schema::create('product_specifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('value');
            $table->timestamps();
            $table->index(['product_id', 'name']);
        });

        Schema::create('product_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();
            $table->unique(['product_id', 'name']);
        });

        Schema::create('product_included_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('product_shipping', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('package_weight', 10, 3)->nullable();
            $table->decimal('length', 10, 2)->nullable();
            $table->decimal('width', 10, 2)->nullable();
            $table->decimal('height', 10, 2)->nullable();
            $table->decimal('shipping_charge', 15, 2)->default(0);
            $table->decimal('free_shipping_threshold', 15, 2)->nullable();
            $table->text('delivery_locations')->nullable();
            $table->timestamps();
        });

        Schema::create('product_warranties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->unique()->constrained()->cascadeOnDelete();
            $table->boolean('available')->default(false);
            $table->string('duration')->nullable();
            $table->string('type')->nullable();
            $table->string('provider')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('product_return_policies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->unique()->constrained()->cascadeOnDelete();
            $table->boolean('return_available')->default(false);
            $table->unsignedInteger('return_window')->nullable();
            $table->boolean('replacement_available')->default(false);
            $table->boolean('refund_available')->default(false);
            $table->text('conditions')->nullable();
            $table->boolean('non_returnable')->default(false);
            $table->string('shipping_responsibility')->nullable();
            $table->timestamps();
        });

        Schema::create('product_taxes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('category')->nullable();
            $table->decimal('percentage', 5, 2)->default(0);
            $table->string('hsn_sac_code')->nullable();
            $table->boolean('included_in_price')->default(true);
            $table->boolean('exempt')->default(false);
            $table->timestamps();
        });

        Schema::create('product_approval_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status');
            $table->text('reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_approval_history');
        Schema::dropIfExists('product_taxes');
        Schema::dropIfExists('product_return_policies');
        Schema::dropIfExists('product_warranties');
        Schema::dropIfExists('product_shipping');
        Schema::dropIfExists('product_included_items');
        Schema::dropIfExists('product_tags');
        Schema::dropIfExists('product_specifications');
        Schema::dropIfExists('product_videos');
        Schema::table('product_variants', function (Blueprint $table) {
            foreach (['mrp', 'discount_type', 'discount_value', 'color', 'size', 'storage', 'ram', 'weight', 'barcode', 'image_path', 'attributes', 'status'] as $column) {
                $table->dropColumn($column);
            }
        });
        Schema::table('products', function (Blueprint $table) {
            foreach (['title', 'short_name', 'subtitle', 'seller_sku', 'model_number', 'model_name', 'manufacturer', 'product_type', 'condition', 'highlights', 'whats_included', 'usage_instructions', 'care_instructions', 'cost_price', 'discount_type', 'discount_value', 'reserved_quantity', 'low_stock_threshold', 'min_order_quantity', 'max_order_quantity', 'barcode', 'ean', 'upc', 'isbn', 'gtin', 'weight', 'shipping_class', 'handling_time', 'dispatch_time', 'shipping_method', 'estimated_delivery', 'country_of_origin', 'manufacturer_details', 'compliance_information', 'seo_keywords', 'canonical_url', 'status', 'rejection_reason'] as $column) {
                $table->dropColumn($column);
            }
            $table->dropUnique('products_seller_id_seller_sku_unique');
            $table->dropIndex('products_seller_id_status_index');
        });
    }
};
