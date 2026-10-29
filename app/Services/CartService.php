<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class CartService
{
    public function getOrCreateCart($userId)
    {
        $cart = Cart::where('customer_id', $userId)->first();
        
        if (!$cart) {
            $cart = Cart::create([
                'customer_id' => $userId,
                'subtotal' => 0,
                'total' => 0,
            ]);
        }

        return $cart;
    }

    public function getUserCart($userId)
    {
        return Cart::where('customer_id', $userId)->first();
    }

    public function addItem($cart, $data)
    {
        $product = Product::find($data['product_id']);
        $variantId = $data['variant_id'] ?? null;
        $quantity = $data['quantity'];
        $sellerId = $data['seller_id'];

        $unitPrice = $product->price;

        $existingItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $product->id)
            ->where('product_variant_id', $variantId)
            ->first();

        if ($existingItem) {
            $existingItem->quantity += $quantity;
            $existingItem->total_price = $existingItem->quantity * $unitPrice;
            $existingItem->save();
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'product_variant_id' => $variantId,
                'seller_id' => $sellerId,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'total_price' => $quantity * $unitPrice,
            ]);
        }

        $this->updateCartTotals($cart);

        return $cart;
    }

    public function updateItemQuantity($cartItem, $quantity)
    {
        $cartItem->quantity = $quantity;
        $cartItem->total_price = $quantity * $cartItem->unit_price;
        $cartItem->save();

        $this->updateCartTotals($cartItem->cart);

        return $cartItem;
    }

    public function getCartCount($userId)
    {
        $cart = $this->getUserCart($userId);
        if (!$cart) {
            return 0;
        }

        return $cart->items()->sum('quantity');
    }

    public function calculateCartSummary($cart)
    {
        if (!$cart) {
            return [
                'subtotal' => 0,
                'discount' => 0,
                'tax' => 0,
                'shipping' => 0,
                'total' => 0,
                'item_count' => 0,
            ];
        }

        $items = $cart->items()->with(['product', 'seller'])->get();
        
        $summary = [
            'subtotal' => 0,
            'discount' => $cart->coupon_discount ?? 0,
            'tax' => 0,
            'shipping' => 0,
            'total' => 0,
            'item_count' => $items->sum('quantity'),
        ];

        foreach ($items as $item) {
            $summary['subtotal'] += $item->total_price;
        }

        // Calculate tax (13% VAT for Nepal)
        $summary['tax'] = $summary['subtotal'] * 0.13;

        // Calculate shipping (free if subtotal > 1000)
        $summary['shipping'] = $summary['subtotal'] >= 1000 ? 0 : 100;

        // Calculate total
        $summary['total'] = $summary['subtotal'] 
            - $summary['discount'] 
            + $summary['tax'] 
            + $summary['shipping'];

        return $summary;
    }

    private function updateCartTotals($cart)
    {
        $summary = $this->calculateCartSummary($cart);
        
        $cart->subtotal = $summary['subtotal'];
        $cart->discount = $summary['discount'];
        $cart->tax = $summary['tax'];
        $cart->shipping = $summary['shipping'];
        $cart->total = $summary['total'];
        $cart->save();

        return $cart;
    }
}