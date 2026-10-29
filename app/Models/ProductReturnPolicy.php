<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductReturnPolicy extends Model
{
    protected $fillable = ['return_available', 'return_window', 'replacement_available', 'refund_available', 'conditions', 'non_returnable', 'shipping_responsibility'];
    protected $casts = ['return_available' => 'boolean', 'replacement_available' => 'boolean', 'refund_available' => 'boolean', 'non_returnable' => 'boolean'];

    public function product() { return $this->belongsTo(Product::class); }
}
