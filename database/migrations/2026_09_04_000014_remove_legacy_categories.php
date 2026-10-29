<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $categories = [
            ['For You', 'for-you'], ['Fashion', 'fashion'], ['Mobiles', 'mobiles'],
            ['Electronics', 'electronics'], ['Beauty', 'beauty'], ['Home', 'home'],
            ['Appliances', 'appliances'], ['Toys, Baby & Kids', 'toys-baby-kids'],
            ['Food & Beverages', 'food-beverages'], ['Auto Accessories', 'auto-accessories'],
            ['Sports & Fitness', 'sports-fitness'], ['Furniture', 'furniture'],
            ['Books & More', 'books-more'], ['2 Wheelers', '2-wheelers'],
        ];

        foreach ($categories as $sortOrder => [$name, $slug]) {
            DB::table('categories')->insertOrIgnore([
                'name' => $name,
                'slug' => $slug,
                'description' => $name . ' products',
                'is_active' => true,
                'sort_order' => $sortOrder + 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->mergeLegacyCategory('clothing', 'Fashion', 'fashion');
        $this->mergeLegacyCategory('home-kitchen', 'Home', 'home');

        DB::table('categories')->whereIn('slug', [
            'for-you', 'fashion', 'mobiles', 'electronics', 'beauty', 'home', 'appliances',
            'toys-baby-kids', 'food-beverages', 'auto-accessories', 'sports-fitness',
            'furniture', 'books-more', '2-wheelers',
        ])->update(['is_active' => true]);
    }

    private function mergeLegacyCategory(string $legacySlug, string $name, string $slug): void
    {
        $legacy = DB::table('categories')->where('slug', $legacySlug)->first();
        if (! $legacy) {
            return;
        }

        $target = DB::table('categories')->where('slug', $slug)->first();
        if ($target) {
            DB::table('products')->where('category_id', $legacy->id)->update(['category_id' => $target->id]);
            DB::table('categories')->where('id', $legacy->id)->delete();
            return;
        }

        DB::table('categories')->where('id', $legacy->id)->update([
            'name' => $name,
            'slug' => $slug,
        ]);
    }

    public function down(): void
    {
        // Legacy category names are intentionally not restored.
    }
};