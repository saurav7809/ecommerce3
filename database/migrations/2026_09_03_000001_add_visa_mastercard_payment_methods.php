<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Selected payment methods that the storefront currently offers.
    // 'card', 'bank_transfer', 'connectips' and 'wallet' are kept so any
    // existing rows created under the previous schema keep working.
    private const METHODS = ['cod', 'esewa', 'khalti', 'visa', 'mastercard', 'card', 'bank_transfer', 'connectips', 'wallet'];

    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('payment_method', self::METHODS)->nullable()->change();
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->enum('payment_method', self::METHODS)->change();
        });
    }

    public function down(): void
    {
        $legacy = ['cod', 'esewa', 'khalti', 'card', 'bank_transfer'];

        Schema::table('orders', function (Blueprint $table) use ($legacy) {
            $table->enum('payment_method', $legacy)->nullable()->change();
        });

        Schema::table('payments', function (Blueprint $table) use ($legacy) {
            $table->enum('payment_method', $legacy)->change();
        });
    }
};