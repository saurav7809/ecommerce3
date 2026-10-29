<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id',
        'name',
        'sku',
        'price',
        'mrp',
        'discount_type',
        'discount_value',
        'color',
        'size',
        'storage',
        'ram',
        'weight',
        'barcode',
        'image_path',
        'attributes',
        'stock_quantity',
        'stock_status',
        'is_active',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'mrp' => 'decimal:2',
        'discount_value' => 'decimal:2',
        'weight' => 'decimal:3',
        'stock_quantity' => 'integer',
        'is_active' => 'boolean',
        'attributes' => 'array',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}