<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['seller', 'category', 'brand', 'images'])
            ->active();

        // Apply filters
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->boolean('on_sale')) {
            $query->whereNotNull('compare_price')
                ->whereColumn('compare_price', '>', 'price');
        }

        if ($request->filled('brand')) {
            $brand = $request->input('brand');

            if (is_numeric($brand)) {
                $query->where('brand_id', $brand);
            } else {
                $query->whereHas('brand', function ($brandQuery) use ($brand) {
                    $brandQuery->where('name', $brand)
                        ->orWhere('slug', $brand);
                });
            }
        }

        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->has('sort')) {
            switch ($request->sort) {
                case 'popular':
                    $query->orderBy('total_sales', 'desc');
                    break;
                case 'price_low':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_high':
                    $query->orderBy('price', 'desc');
                    break;
                case 'newest':
                    $query->orderBy('created_at', 'desc');
                    break;
                default:
                    $query->latest();
            }
        } else {
            $query->latest();
        }

        $products = $query->paginate(24);
        
        $categories = Category::where('is_active', true)->get();
        $brands = Brand::where('is_active', true)->get();

        return view('customer.products.index', compact('products', 'categories', 'brands'));
    }

    public function show($slug)
    {
        $product = Product::with([
            'seller',
            'category',
            'brand',
            'images',
            'videos',
            'specifications',
            'shipping',
            'warranty',
            'returnPolicy',
            'reviews' => function ($query) {
                $query->latest();
            },
            'reviews.user'
        ])->where('slug', $slug)
          ->active()
          ->firstOrFail();

        // Increment view count
        $product->increment('total_views');

        // Get related products
        $relatedProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->active()
            ->limit(10)
            ->get();

        // Calculate rating statistics
        $ratingStats = $this->calculateRatingStats($product);

        return view('customer.products.show', compact(
            'product',
            'relatedProducts',
            'ratingStats'
        ));
    }

    public function search(Request $request)
    {
        $query = $request->input('q');
        $products = Product::where('name', 'LIKE', "%{$query}%")
            ->orWhere('short_description', 'LIKE', "%{$query}%")
            ->orWhere('description', 'LIKE', "%{$query}%")
            ->active()
            ->paginate(24);

        return view('customer.search.index', compact('products', 'query'));
    }

    private function calculateRatingStats($product)
    {
        $ratings = $product->reviews()->get(['rating']);
        $total = $ratings->count();
        $stats = [];

        for ($i = 5; $i >= 1; $i--) {
            $count = $ratings->where('rating', $i)->count();
            $percentage = $total > 0 ? ($count / $total) * 100 : 0;
            $stats[$i] = [
                'count' => $count,
                'percentage' => round($percentage, 1),
            ];
        }

        return $stats;
    }
}