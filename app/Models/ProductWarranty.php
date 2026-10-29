<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductWarranty extends Model
{
    protected $table = 'product_warranties';
    protected $fillable = ['available', 'duration', 'type', 'provider', 'description'];
    protected $casts = ['available' => 'boolean'];

    public function product() { return $this->belongsTo(Product::class); }
}
