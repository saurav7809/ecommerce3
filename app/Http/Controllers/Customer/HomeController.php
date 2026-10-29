<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $featuredProducts = Product::active()
            ->featured()
            ->with(['seller', 'images'])
            ->limit(12)
            ->get();

        $newArrivals = Product::active()
            ->orderBy('created_at', 'desc')
            ->with(['seller', 'images'])
            ->limit(12)
            ->get();

        $bestSellers = Product::active()
            ->orderBy('total_sales', 'desc')
            ->with(['seller', 'images'])
            ->limit(12)
            ->get();

        $categoryOrder = [
            'for-you', 'fashion', 'mobiles', 'electronics', 'beauty', 'home', 'appliances',
            'toys-baby-kids', 'food-beverages', 'auto-accessories', 'sports-fitness',
            'furniture', 'books-more', '2-wheelers',
        ];

        $categories = Category::where('is_active', true)
            ->withCount('products')
            ->get()
            ->sortBy(function ($category) use ($categoryOrder) {
                $position = array_search($category->slug, $categoryOrder, true);

                return $position === false ? 999 : $position;
            })
            ->values();

        $mobileBrands = collect();
        $fashionCategories = collect();
        $electronicsCategories = collect();
        $beautyCategories = collect();
        $homeCategories = collect();
        $applianceCategories = collect();
        $kidsCategories = collect();
        $groceryCategories = collect();
        $autoAccessoriesCategories = collect();
        $sportsCategories = collect();
        $furnitureCategories = collect();
        $booksCategories = collect();
        $twoWheelerBrands = collect();

        if ($request->boolean('show_mobile_brands')) {
            $mobileImages = [
                'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
                'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5',
                'https://images.unsplash.com/photo-1598327105666-5b89351aff97',
                'https://images.unsplash.com/photo-1556656793-08538906a9f8',
                'https://images.unsplash.com/photo-1565849904461-04a58ad377e0',
                'https://images.unsplash.com/photo-1603302576837-37561b2e2302',
            ];

            $mobileBrands = collect(config('mobile_brands'))->map(function (array $brand, int $index) use ($mobileImages) {
                $brand['id'] = Brand::where('name', $brand['name'])->value('id');
                $brand['logo_url'] = 'https://cdn.simpleicons.org/' . $brand['logo'];
                $brand['image_url'] = ($mobileImages[$index % count($mobileImages)]) . '?auto=format&fit=crop&w=520&q=82';

                return $brand;
            });
        }

        if ($request->boolean('show_fashion_categories')) {
            $fashionImages = [
                'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', 'https://images.unsplash.com/photo-1542272604-787c3835535d', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3', 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3', 'https://images.unsplash.com/photo-1610652492500-ded49ceeb378', 'https://images.unsplash.com/photo-1548883354-7622d03aca27', 'https://images.unsplash.com/photo-1483985988355-763728e1935b', 'https://images.unsplash.com/photo-1566206091558-7f218b696731', 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86', 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e', 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3', 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1', 'https://images.unsplash.com/photo-1551028719-00167b16eac5', 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03', 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3', 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b',
            ];

            $fashionCategories = collect(config('fashion_categories'))->map(function (array $category, int $index) use ($fashionImages) {
                $category['key'] = $index;
                $category['image'] = ($fashionImages[$index] ?? $fashionImages[0]) . '?auto=format&fit=crop&w=520&q=82';

                return $category;
            });
        }

        if ($request->boolean('show_electronics_categories')) {
            $electronicsImages = [
                'https://images.unsplash.com/photo-1496181133206-80ce9b88a853', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12', 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b', 'https://images.unsplash.com/photo-1609592424754-965f95d99f72', 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9', 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc', 'https://images.unsplash.com/photo-1585771724684-38269d6639fd', 'https://images.unsplash.com/photo-1593305841991-05c297ba4575', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f', 'https://images.unsplash.com/photo-1600267165477-6d4cc741b379', 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32', 'https://images.unsplash.com/photo-1609592424754-965f95d99f72', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', 'https://images.unsplash.com/photo-1584515933487-779824d29309', 'https://images.unsplash.com/photo-1612810436541-336d58f9b5b6', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
            ];

            $electronicsCategories = collect(config('electronics_categories'))->map(function (array $category, int $index) use ($electronicsImages) {
                $category['key'] = $index;
                $category['image'] = ($electronicsImages[$index] ?? $electronicsImages[0]) . '?auto=format&fit=crop&w=520&q=82';

                return $category;
            });
        }

        if ($request->boolean('show_beauty_categories')) {
            $beautyImages = [
                'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9', 'https://images.unsplash.com/photo-1526045478516-99145907023c', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348', 'https://images.unsplash.com/photo-1612810436541-336d58f9b5b6', 'https://images.unsplash.com/photo-1556228720-195a672e8a03', 'https://images.unsplash.com/photo-1515377905703-c4788e51af15', 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b', 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc', 'https://images.unsplash.com/photo-1600428877878-1a0f3a0a4a53', 'https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d', 'https://images.unsplash.com/photo-1556228720-195a672e8a03', 'https://images.unsplash.com/photo-1559599101-f09722fb4948', 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f',
            ];

            $beautyCategories = collect(config('beauty_categories'))->map(function (array $category, int $index) use ($beautyImages) {
                $category['key'] = $index;
                $category['image'] = ($beautyImages[$index] ?? $beautyImages[0]) . '?auto=format&fit=crop&w=520&q=82';

                return $category;
            });
        }

        if ($request->boolean('show_home_categories')) {
            $homeImages = [
                'https://images.unsplash.com/photo-1555041469-a586c61ea9bc', 'https://images.unsplash.com/photo-1556912167-f556f1f39fdf', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc', 'https://images.unsplash.com/photo-1532372320572-cda25653a26d', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace', 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6', 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91', 'https://images.unsplash.com/photo-1618220179428-22790b461013', 'https://images.unsplash.com/photo-1558997519-83ea9252edf8', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', 'https://images.unsplash.com/photo-1558997519-83ea9252edf8', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2', 'https://images.unsplash.com/photo-1593784991095-a205069470b6', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea', 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4',
            ];

            $homeCategories = collect(config('home_categories'))->map(function (array $category, int $index) use ($homeImages) {
                $category['key'] = $index;
                $category['image'] = ($homeImages[$index] ?? $homeImages[0]) . '?auto=format&fit=crop&w=520&q=82';

                return $category;
            });
        }

        if ($request->boolean('show_appliance_categories')) {
            $applianceImages = [
                'https://images.unsplash.com/photo-1593784991095-a205069470b6', 'https://images.unsplash.com/photo-1585771724684-38269d6639fd', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef', 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f', 'https://images.unsplash.com/photo-1556912167-f556f1f39fdf', 'https://images.unsplash.com/photo-1609592424754-965f95d99f72', 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9', 'https://images.unsplash.com/photo-1584515933487-779824d29309', 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15', 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc',
            ];

            $applianceCategories = collect(config('appliance_categories'))->map(function (array $category, int $index) use ($applianceImages) {
                $category['key'] = $index;
                $category['image'] = ($applianceImages[$index] ?? $applianceImages[0]) . '?auto=format&fit=crop&w=520&q=82';

                return $category;
            });
        }

        if ($request->boolean('show_kids_categories')) {
            $kidsImages = [
                'https://images.unsplash.com/photo-1503676260728-1c00da094a0b', 'https://images.unsplash.com/photo-1596464716127-f2a82984de30', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883', 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1', 'https://images.unsplash.com/photo-1516627145497-ae6968895b74', 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088', 'https://images.unsplash.com/photo-1594784055414-51e5c1e4f3f6', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9', 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902', 'https://images.unsplash.com/photo-1516627145497-ae6968895b74', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b', 'https://images.unsplash.com/photo-1587654780291-39c9404d746b',
            ];

            $kidsImages[0] = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc';
            $kidsCategories = collect(config('kids_categories'))->map(function (array $category, int $index) use ($kidsImages) {
                $category['key'] = $index;
                $category['image'] = ($kidsImages[$index] ?? $kidsImages[0]) . '?auto=format&fit=crop&w=520&q=82';

                return $category;
            });
        }

        if ($request->boolean('show_grocery_categories')) {
            $groceryCategories = collect(config('grocery_categories'))->map(function (array $category, int $index) {
                $category['key'] = $index;

                return $category;
            });
        }

        if ($request->boolean('show_auto_accessories_categories')) {
            $autoAccessoriesCategories = collect(config('auto_accessories_categories'))->map(function (array $category, int $index) {
                $category['key'] = $index;

                return $category;
            });
        }

        if ($request->boolean('show_sports_categories')) {
            $sportsCategories = collect(config('sports_categories'))->map(function (array $category, int $index) {
                $category['key'] = $index;

                return $category;
            });
        }

        if ($request->boolean('show_furniture_categories')) {
            $furnitureCategories = collect(config('furniture_categories'))->map(function (array $category, int $index) {
                $category['key'] = $index;

                return $category;
            });
        }

        if ($request->boolean('show_books_categories')) {
            $booksCategories = collect(config('books_categories'))->map(function (array $category, int $index) {
                $category['key'] = $index;

                return $category;
            });
        }

        if ($request->boolean('show_two_wheeler_categories')) {
            $twoWheelerBrands = collect(config('two_wheeler_brands'))->map(function (array $brand, int $index) {
                $brand['key'] = $index;
                $brand['logo_url'] = 'https://cdn.simpleicons.org/' . $brand['slug'];

                return $brand;
            });
        }

        return view('customer.home', compact(
            'featuredProducts',
            'newArrivals',
            'bestSellers',
            'categories',
            'mobileBrands',
            'fashionCategories',
            'electronicsCategories',
            'beautyCategories',
            'homeCategories',
            'applianceCategories',
            'kidsCategories',
            'groceryCategories',
            'autoAccessoriesCategories',
            'sportsCategories',
            'furnitureCategories',
            'booksCategories',
            'twoWheelerBrands'
        ));
    }
}