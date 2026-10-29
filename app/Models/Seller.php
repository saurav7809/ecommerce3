<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Seller extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'business_name',
        'store_name',
        'store_slug',
        'store_description',
        'store_logo',
        'store_banner',
        'business_registration_number',
        'tax_number',
        'verification_status',
        'status',
        'commission_rate',
        'rating',
        'total_products',
        'total_reviews',
        'total_orders',
        'total_revenue',
    ];

    protected $casts = [
        'commission_rate' => 'decimal:2',
        'rating' => 'decimal:2',
        'total_revenue' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function scopeVerified($query)
    {
        return $query->where('verification_status', 'approved');
    }

    public function getStoreLogoUrlAttribute()
    {
        if ($this->store_logo) {
            return asset('storage/sellers/' . $this->store_logo);
        }

        return asset('images/default-store.png');
    }
}