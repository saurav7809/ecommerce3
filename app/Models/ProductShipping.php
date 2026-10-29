<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductShipping extends Model
{
    protected $table = 'product_shipping';
    protected $fillable = ['package_weight', 'length', 'width', 'height', 'shipping_charge', 'free_shipping_threshold', 'delivery_locations'];
    protected $casts = ['package_weight' => 'decimal:3', 'length' => 'decimal:2', 'width' => 'decimal:2', 'height' => 'decimal:2', 'shipping_charge' => 'decimal:2', 'free_shipping_threshold' => 'decimal:2'];

    public function product() { return $this->belongsTo(Product::class); }
}
