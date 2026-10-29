<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'seller_id',
        'category_id',
        'brand_id',
        'name',
        'title',
        'short_name',
        'subtitle',
        'slug',
        'short_description',
        'description',
        'highlights',
        'whats_included',
        'usage_instructions',
        'care_instructions',
        'sku',
        'seller_sku',
        'model_number',
        'model_name',
        'manufacturer',
        'product_type',
        'condition',
        'price',
        'compare_price',
        'cost_price',
        'discount_type',
        'discount_value',
        'stock_quantity',
        'reserved_quantity',
        'low_stock_threshold',
        'min_order_quantity',
        'max_order_quantity',
        'barcode',
        'ean',
        'upc',
        'isbn',
        'gtin',
        'weight',
        'shipping_class',
        'handling_time',
        'dispatch_time',
        'shipping_method',
        'estimated_delivery',
        'country_of_origin',
        'manufacturer_details',
        'compliance_information',
        'stock_status',
        'is_featured',
        'is_approved',
        'is_active',
        'approval_status',
        'rating',
        'total_reviews',
        'total_views',
        'total_sales',
        'meta_title',
        'meta_description',
        'seo_keywords',
        'canonical_url',
        'status',
        'rejection_reason',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'compare_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'discount_value' => 'decimal:2',
        'weight' => 'decimal:3',
        'reserved_quantity' => 'integer',
        'low_stock_threshold' => 'integer',
        'min_order_quantity' => 'integer',
        'max_order_quantity' => 'integer',
        'rating' => 'decimal:2',
        'is_featured' => 'boolean',
        'is_approved' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function seller()
    {
        return $this->belongsTo(Seller::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function videos()
    {
        return $this->hasMany(ProductVideo::class);
    }

    public function specifications()
    {
        return $this->hasMany(ProductSpecification::class);
    }

    public function tags()
    {
        return $this->hasMany(ProductTag::class);
    }

    public function includedItems()
    {
        return $this->hasMany(ProductIncludedItem::class)->orderBy('sort_order');
    }

    public function shipping()
    {
        return $this->hasOne(ProductShipping::class);
    }

    public function warranty()
    {
        return $this->hasOne(ProductWarranty::class);
    }

    public function returnPolicy()
    {
        return $this->hasOne(ProductReturnPolicy::class);
    }

    public function tax()
    {
        return $this->hasOne(ProductTax::class);
    }

    public function approvalHistory()
    {
        return $this->hasMany(ProductApprovalHistory::class);
    }

    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getImageUrlAttribute()
    {
        $primaryImage = $this->primaryImage;
        if ($primaryImage) {
            return asset('storage/' . ltrim($primaryImage->image_path, '/'));
        }
        return asset('images/default-product.png');
    }

    public function getDiscountPercentageAttribute()
    {
        if ($this->compare_price && $this->compare_price > $this->price) {
            return round((($this->compare_price - $this->price) / $this->compare_price) * 100, 2);
        }
        return 0;
    }

    public function hasDiscount()
    {
        return $this->compare_price && $this->compare_price > $this->price;
    }

    public function isInStock()
    {
        return $this->stock_status === 'in_stock' && $this->stock_quantity > 0;
    }

    public function setNameAttribute($value)
    {
        $this->attributes['name'] = $value;
        $this->attributes['slug'] = Str::slug($value);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                     ->where('is_approved', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('stock_status', 'in_stock');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function updateRating()
    {
        $avgRating = $this->reviews()->avg('rating') ?? 0;
        $totalReviews = $this->reviews()->count();
        
        $this->update([
            'rating' => round($avgRating, 2),
            'total_reviews' => $totalReviews,
        ]);
    }
}