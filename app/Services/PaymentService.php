<?php

namespace App\Services;

use App\Models\Payment;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentService
{
    /**
     * Process a payment through the configured gateway.
     *
     * In a production application this method would call the selected payment
     * gateway (eSewa, Khalti, Stripe, etc.). For the purposes of this project we
     * simulate a successful gateway response so checkout flow can be tested.
     */
    public function processPayment(Payment $payment, $data = [])
    {
        $method = $payment->payment_method;

        try {
            // Simulate a gateway initiation / approval.
            $transactionId = Str::upper($method) . '-' . Str::upper(Str::random(14));

            return [
                'success' => true,
                'transaction_id' => $transactionId,
                'message' => 'Payment processed successfully.',
            ];
        } catch (\Exception $e) {
            Log::error('Payment failed: ' . $e->getMessage());

            throw $e;
        }
    }
}