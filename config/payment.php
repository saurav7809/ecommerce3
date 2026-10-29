<?php

return [
    'gateways' => [
        'esewa' => [
            'merchant_id' => env('ESEWA_MERCHANT_ID'),
            'secret_key' => env('ESEWA_SECRET_KEY'),
            'test_mode' => env('ESEWA_TEST_MODE', true),
            'success_url' => env('ESEWA_SUCCESS_URL'),
            'failure_url' => env('ESEWA_FAILURE_URL'),
        ],
        'khalti' => [
            'public_key' => env('KHALTI_PUBLIC_KEY'),
            'secret_key' => env('KHALTI_SECRET_KEY'),
            'test_mode' => env('KHALTI_TEST_MODE', true),
        ],
        'stripe' => [
            'public_key' => env('STRIPE_PUBLIC_KEY'),
            'secret_key' => env('STRIPE_SECRET_KEY'),
        ],
    ],
];