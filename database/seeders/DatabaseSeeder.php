<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'sumitadmin@gmail.com',
            'phone' => '9800000000',
            'password' => 'nepal9817@',
            'is_admin' => true,
            'email_verified_at' => now(),
        ]);

        // Seller user + seller profile
        $sellerUser = User::create([
            'first_name' => 'Seller',
            'last_name' => 'Demo',
            'email' => 'sumitseller@gmail.com',
            'phone' => '9800000001',
            'password' => 'nepal9817@',
            'is_seller' => true,
            'email_verified_at' => now(),
        ]);

        $seller = Seller::create([
            'user_id' => $sellerUser->id,
            'business_name' => 'Demo Traders Pvt. Ltd.',
            'store_name' => 'SUMIT',
            'store_slug' => 'demo-store',
            'store_description' => 'Quality products at great prices.',
            'verification_status' => 'approved',
            'status' => 'active',
            'commission_rate' => 10,
            'total_products' => 0,
        ]);

        // Customer + default address
        $customer = User::create([
            'first_name' => 'Customer',
            'last_name' => 'Demo',
            'email' => 'customer@ecomm.test',
            'phone' => '9800000002',
            'password' => 'customer123',
            'email_verified_at' => now(),
        ]);

        Address::create([
            'user_id' => $customer->id,
            'full_name' => 'Customer Demo',
            'phone' => '9800000002',
            'address_line1' => 'Naxal',
            'city' => 'Kathmandu',
            'state' => 'Bagmati',
            'postal_code' => '44600',
            'country' => 'NP',
            'is_default' => true,
        ]);

        // Categories
        $electronics = Category::create(['name' => 'Electronics', 'slug' => 'electronics', 'description' => 'Gadgets and electronics', 'is_active' => true, 'sort_order' => 4]);
        $clothing = Category::create(['name' => 'Fashion', 'slug' => 'fashion', 'description' => 'Men and women fashion', 'is_active' => true, 'sort_order' => 2]);
        $home = Category::create(['name' => 'Home', 'slug' => 'home', 'description' => 'Home essentials', 'is_active' => true, 'sort_order' => 6]);
        foreach ([
            ['For You', 'for-you'], ['Mobiles', 'mobiles'], ['Beauty', 'beauty'], ['Appliances', 'appliances'],
            ['Toys, Baby & Kids', 'toys-baby-kids'], ['Food & Beverages', 'food-beverages'],
            ['Auto Accessories', 'auto-accessories'], ['Sports & Fitness', 'sports-fitness'],
            ['Furniture', 'furniture'], ['Books & More', 'books-more'], ['2 Wheelers', '2-wheelers']
        ] as $sortOrder => [$name, $slug]) {
            Category::create([
                'name' => $name,
                'slug' => $slug,
                'description' => $name . ' products',
                'is_active' => true,
                'sort_order' => $sortOrder + 1 + ($sortOrder >= 3 ? 1 : 0),
            ]);
        }

        // Brands
        $samsung = Brand::create(['name' => 'Samsung', 'slug' => 'samsung', 'is_active' => true]);
        $nike = Brand::create(['name' => 'Nike', 'slug' => 'nike', 'is_active' => true]);
        $philips = Brand::create(['name' => 'Philips', 'slug' => 'philips', 'is_active' => true]);

        // Products
        $products = [
            ['name' => 'Samsung Galaxy A54 5G', 'category_id' => $electronics->id, 'brand_id' => $samsung->id, 'price' => 54999, 'compare_price' => 59999, 'stock' => 25, 'featured' => true, 'desc' => 'A powerful mid-range smartphone with stunning AMOLED display.'],
            ['name' => 'Nike Air Zoom Pegasus 40', 'category_id' => $clothing->id, 'brand_id' => $nike->id, 'price' => 12999, 'compare_price' => null, 'stock' => 10, 'featured' => true, 'desc' => 'Responsive running shoes with Zoom Air cushioning.'],
            ['name' => 'Philips Air Fryer HD9252', 'category_id' => $home->id, 'brand_id' => $philips->id, 'price' => 18999, 'compare_price' => 22500, 'stock' => 8, 'featured' => true, 'desc' => 'Rapid air technology for healthy, crispy frying.'],
            ['name' => 'Wireless Noise Cancelling Headphones', 'category_id' => $electronics->id, 'brand_id' => null, 'price' => 8999, 'compare_price' => 10999, 'stock' => 15, 'featured' => false, 'desc' => 'Immersive sound with active noise cancellation.'],
            ['name' => 'Men Premium Cotton T-Shirt', 'category_id' => $clothing->id, 'brand_id' => null, 'price' => 1299, 'compare_price' => 1799, 'stock' => 50, 'featured' => false, 'desc' => 'Soft 100% combed cotton casual t-shirt.'],
            ['name' => 'Stainless Steel Cookware Set', 'category_id' => $home->id, 'brand_id' => $philips->id, 'price' => 24999, 'compare_price' => null, 'stock' => 6, 'featured' => false, 'desc' => '5-piece induction ready cookware set.'],
        ];

        foreach ($products as $p) {
            Product::create([
                'seller_id' => $seller->id,
                'category_id' => $p['category_id'],
                'brand_id' => $p['brand_id'],
                'name' => $p['name'],
                'short_description' => $p['desc'],
                'description' => $p['desc'],
                'sku' => strtoupper(Str::random(10)),
                'price' => $p['price'],
                'compare_price' => $p['compare_price'],
                'stock_quantity' => $p['stock'],
                'stock_status' => 'in_stock',
                'is_featured' => $p['featured'],
                'is_approved' => true,
                'is_active' => true,
                'approval_status' => 'approved',
            ]);
        }

        $this->command->info('Database seeded successfully!');
        $this->command->info('Admin:    sumitadmin@gmail.com / nepal9817@');
        $this->command->info('Seller:   sumitseller@gmail.com / nepal9817@');
        $this->command->info('Customer: customer@ecomm.test / customer123');
    }
}
