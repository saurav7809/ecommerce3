<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;

class SellerDashboardController extends Controller
{
    public function index()
    {
        $seller = Auth::user()->seller;

        abort_unless($seller, 403, 'Seller profile is not available.');

        $products = Product::where('seller_id', $seller->id);
        $orders = Order::where('seller_id', $seller->id);

        $stats = [
            'sales' => (clone $orders)->where('status', 'delivered')->sum('total'),
            'orders' => (clone $orders)->count(),
            'pending_orders' => (clone $orders)->whereIn('status', ['pending', 'confirmed'])->count(),
            'processing_orders' => (clone $orders)->whereIn('status', ['processing', 'shipped'])->count(),
            'products' => (clone $products)->count(),
            'low_stock' => (clone $products)->whereBetween('stock_quantity', [1, 5])->count(),
            'out_of_stock' => (clone $products)->where('stock_quantity', '<=', 0)->count(),
            'rating' => $seller->rating,
        ];

        $recentOrders = (clone $orders)
            ->with('customer')
            ->latest()
            ->limit(8)
            ->get();

        $lowStockProducts = (clone $products)
            ->where('stock_quantity', '<=', 5)
            ->orderBy('stock_quantity')
            ->limit(6)
            ->get();

        return view('seller.dashboard.index', compact('seller', 'stats', 'recentOrders', 'lowStockProducts'));
    }
}
