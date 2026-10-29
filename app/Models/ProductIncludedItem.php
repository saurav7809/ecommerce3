<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductIncludedItem extends Model
{
    protected $fillable = ['product_id', 'name', 'sort_order'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
