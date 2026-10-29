<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Customer\HomeController;
use App\Http\Controllers\Customer\ProductController;
use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Customer\CheckoutController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Seller\SellerDashboardController;
use App\Http\Controllers\Seller\ProductController as SellerProductController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;

// NOTE: The following controllers have not been implemented in this project
// yet, so their routes are commented out. Uncomment them (and create the
// controllers) once they are available.

// Guest routes
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{slug}', [ProductController::class, 'show'])->name('product.show');
Route::get('/search', [ProductController::class, 'search'])->name('search');

// Language switcher
Route::post('/language/{locale}', function (string $locale) {
    $supported = array_keys(config('locale.supported'));

    if (in_array($locale, $supported)) {
        session(['locale' => $locale]);
        app()->setLocale($locale);
    }

    return redirect()->back();
})->name('language.switch');

// Authentication routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login'])->name('login.submit');
    Route::get('/register', [RegisterController::class, 'showRegistrationForm'])->name('register');
    Route::post('/register', [RegisterController::class, 'register'])->name('register.submit');
});

Route::post('/logout', [LoginController::class, 'logout'])->name('logout')->middleware('auth');

// Customer routes
Route::post('/customer/cart/add', [CartController::class, 'add'])->name('customer.cart.add');
Route::get('/customer/checkout', [CheckoutController::class, 'index'])->name('customer.checkout.index');
Route::post('/customer/checkout', [CheckoutController::class, 'process'])->name('customer.checkout.process');

Route::middleware(['auth'])->prefix('customer')->name('customer.')->group(function () {
    // Cart routes
    Route::prefix('cart')->name('cart.')->group(function () {
        Route::get('/', [CartController::class, 'index'])->name('index');
        Route::put('/update/{id}', [CartController::class, 'update'])->name('update');
        Route::delete('/remove/{id}', [CartController::class, 'remove'])->name('remove');
        Route::get('/count', [CartController::class, 'getCartCount'])->name('count');
    });

    // Checkout routes
    Route::prefix('checkout')->name('checkout.')->group(function () {
        Route::get('/success/{id}', [CheckoutController::class, 'success'])->name('success');
        Route::get('/failure/{id}', [CheckoutController::class, 'failure'])->name('failure');
    });

    // NOTE: Re-enable these when App\Http\Controllers\Customer\ProfileController
    // and OrderController are implemented:
    // Route::get('/dashboard', [ProfileController::class, 'dashboard'])->name('dashboard');
    // Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    // Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    // Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    // Route::get('/orders/{id}', [OrderController::class, 'show'])->name('orders.show');
});

// Admin routes
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/products', [AdminProductController::class, 'index'])->name('products.index');
    Route::put('/products/{product}', [AdminProductController::class, 'update'])->name('products.update');
    Route::patch('/products/{product}/toggle', [AdminProductController::class, 'toggle'])->name('products.toggle');
    Route::delete('/products/{product}', [AdminProductController::class, 'destroy'])->name('products.destroy');

    // NOTE: Admin resource routes are commented out until their controllers
    // are implemented:
    // Route::resource('products', AdminProductController::class);
    // Route::resource('orders', AdminOrderController::class);
    // Route::resource('sellers', AdminSellerController::class);
    // Route::resource('users', AdminUserController::class);
});

Route::middleware(['auth', 'seller'])->prefix('seller')->name('seller.')->group(function () {
    Route::get('/dashboard', [SellerDashboardController::class, 'index'])->name('dashboard');
    Route::resource('products', SellerProductController::class)->except(['show']);
});