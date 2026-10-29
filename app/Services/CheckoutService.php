<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Address;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CheckoutService
{
    protected $cartService;
    protected $paymentService;

    public function __construct(CartService $cartService, PaymentService $paymentService)
    {
        $this->cartService = $cartService;
        $this->paymentService = $paymentService;
    }

    public function processCheckout($customerId, $addressId, $paymentMethod, $data = [])
    {
        $cart = $this->cartService->getUserCart($customerId);
        
        if (!$cart || $cart->items()->count() === 0) {
            throw new \Exception('Cart is empty.');
        }

        $cartSummary = $this->cartService->calculateCartSummary($cart);
        
        DB::beginTransaction();

        try {
            $address = Address::where('id', $addressId)
                ->where('user_id', $customerId)
                ->first();

            if (!$address) {
                throw new \Exception('Invalid address.');
            }

            // Create order
            $order = $this->createOrder($customerId, $address, $cartSummary, $paymentMethod);
            
            // Create order items
            $this->createOrderItems($order, $cart);
            
            // Process payment
            if ($paymentMethod !== 'cod') {
                $payment = $this->processPayment($order, $paymentMethod, $data);
            }
            
            // Clear cart
            $cart->items()->delete();
            $cart->delete();

            DB::commit();

            return [
                'order' => $order,
                'payment' => $payment ?? null,
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Checkout failed: ' . $e->getMessage());
            throw $e;
        }
    }

    private function createOrder($customerId, $address, $cartSummary, $paymentMethod)
    {
        $order = Order::create([
            'order_number' => 'ORD-' . date('Ymd') . '-' . Str::upper(Str::random(8)),
            'customer_id' => $customerId,
            'address_id' => $address->id,
            'subtotal' => $cartSummary['subtotal'],
            'discount' => $cartSummary['discount'],
            'tax' => $cartSummary['tax'],
            'shipping_charge' => $cartSummary['shipping'],
            'total' => $cartSummary['total'],
            'status' => 'pending',
            'payment_status' => $paymentMethod === 'cod' ? 'pending' : 'pending',
            'payment_method' => $paymentMethod,
            'coupon_code' => $cartSummary['coupon_code'] ?? null,
            'coupon_discount' => $cartSummary['coupon_discount'] ?? 0,
            'placed_at' => now(),
        ]);

        return $order;
    }

    private function createOrderItems($order, $cart)
    {
        foreach ($cart->items as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item->product_id,
                'product_variant_id' => $item->product_variant_id,
                'seller_id' => $item->seller_id,
                'product_name' => $item->product->name,
                'product_sku' => $item->product->sku,
                'unit_price' => $item->unit_price,
                'quantity' => $item->quantity,
                'total' => $item->total_price,
                'status' => 'pending',
            ]);

            // Update product stock
            $product = $item->product;
            $product->decrement('stock_quantity', $item->quantity);
            if ($product->stock_quantity <= 0) {
                $product->update(['stock_status' => 'out_of_stock']);
            }
            
            // Update product sales
            $product->increment('total_sales', $item->quantity);
        }
    }

    private function processPayment($order, $paymentMethod, $data)
    {
        $payment = Payment::create([
            'order_id' => $order->id,
            'customer_id' => $order->customer_id,
            'payment_method' => $paymentMethod,
            'amount' => $order->total,
            'status' => 'pending',
        ]);

        try {
            $response = $this->paymentService->processPayment($payment, $data);
            
            if ($response['success']) {
                $payment->update([
                    'status' => 'paid',
                    'transaction_id' => $response['transaction_id'],
                    'paid_at' => now(),
                ]);
                
                $order->update([
                    'payment_status' => 'paid',
                    'payment_transaction_id' => $response['transaction_id'],
                ]);
            }

            return $payment;

        } catch (\Exception $e) {
            $payment->update([
                'status' => 'failed',
                'failure_reason' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}