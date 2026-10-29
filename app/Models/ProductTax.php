<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductTax extends Model
{
    protected $fillable = ['category', 'percentage', 'hsn_sac_code', 'included_in_price', 'exempt'];
    protected $casts = ['percentage' => 'decimal:2', 'included_in_price' => 'boolean', 'exempt' => 'boolean'];

    public function product() { return $this->belongsTo(Product::class); }
}
