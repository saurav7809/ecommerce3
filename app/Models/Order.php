<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'order_number',
        'customer_id',
        'seller_id',
        'address_id',
        'subtotal',
        'discount',
        'tax',
        'shipping_charge',
        'total',
        'status',
        'payment_status',
        'payment_method',
        'payment_transaction_id',
        'coupon_code',
        'coupon_discount',
        'placed_at',
        'delivered_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax' => 'decimal:2',
        'shipping_charge' => 'decimal:2',
        'total' => 'decimal:2',
        'coupon_discount' => 'decimal:2',
        'placed_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function seller()
    {
        return $this->belongsTo(Seller::class);
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function getStatusTextAttribute()
    {
        return [
            'pending' => 'Pending',
            'processing' => 'Processing',
            'confirmed' => 'Confirmed',
            'shipped' => 'Shipped',
            'delivered' => 'Delivered',
            'cancelled' => 'Cancelled',
        ][$this->status] ?? $this->status;
    }

    public function getStatusClassAttribute()
    {
        return [
            'pending' => 'warning',
            'processing' => 'info',
            'confirmed' => 'info',
            'shipped' => 'primary',
            'delivered' => 'success',
            'cancelled' => 'danger',
        ][$this->status] ?? 'secondary';
    }

    public function getPaymentMethodTextAttribute()
    {
        return [
            'cod' => __('messages.payment_cod'),
            'esewa' => __('messages.payment_esewa'),
            'khalti' => __('messages.payment_khalti'),
            'visa' => __('messages.payment_visa'),
            'mastercard' => __('messages.payment_mastercard'),
            'card' => __('messages.payment_card'),
            'bank_transfer' => __('messages.payment_bank_transfer'),
            'connectips' => __('messages.payment_connectips'),
            'wallet' => __('messages.payment_wallet'),
        ][$this->payment_method] ?? $this->payment_method;
    }

    public function getPaymentMethodLogoAttribute()
    {
        $logos = [
            'cod'        => 'cod.svg',
            'esewa'      => 'esewa.png',
            'khalti'     => 'khalti.svg',
            'visa'       => 'visa.svg',
            'mastercard' => 'mastercard.svg',
        ];

        return isset($logos[$this->payment_method])
            ? asset('images/payments/' . $logos[$this->payment_method])
            : null;
    }

    public function isDelivered()
    {
        return $this->status === 'delivered';
    }

    public function canBeCancelled()
    {
        return in_array($this->status, ['pending', 'processing']);
    }

    public function updateStatus($status, $notes = null)
    {
        $this->update(['status' => $status]);
        return $this;
    }
}