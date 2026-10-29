<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Seller;
use App\Models\User;
use App\Models\Payment;
use App\Models\Review;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $stats = $this->getStatistics();
        $recentOrders = Order::with(['customer', 'seller'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
        
        $salesChart = $this->getSalesChart();
        $pendingTasks = $this->getPendingTasks();

        return view('admin.dashboard.index', compact(
            'stats',
            'recentOrders',
            'salesChart',
            'pendingTasks'
        ));
    }

    private function getStatistics()
    {
        $today = Carbon::today();
        $monthStart = Carbon::now()->startOfMonth();
        $delivered = Order::where('status', 'delivered');
        
        return [
            'total_users' => User::count(),
            'new_users_today' => User::whereDate('created_at', $today)->count(),
            'new_users_month' => User::where('created_at', '>=', $monthStart)->count(),
            'total_sellers' => Seller::count(),
            'pending_sellers' => Seller::where('verification_status', 'pending')->count(),
            'total_products' => Product::count(),
            'pending_products' => Product::where('approval_status', 'pending')->count(),
            'active_products' => Product::where('is_active', true)->count(),
            'low_stock_products' => Product::where('stock_quantity', '>', 0)->whereColumn('stock_quantity', '<=', 'low_stock_threshold')->count(),
            'out_of_stock_products' => Product::where('stock_quantity', '<=', 0)->count(),
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'processing_orders' => Order::whereIn('status', ['confirmed', 'processing'])->count(),
            'shipped_orders' => Order::where('status', 'shipped')->count(),
            'delivered_orders' => Order::where('status', 'delivered')->count(),
            'cancelled_orders' => Order::where('status', 'cancelled')->count(),
            'today_sales' => Order::whereDate('created_at', $today)
                ->where('status', 'delivered')
                ->sum('total'),
            'monthly_sales' => Order::where('created_at', '>=', $monthStart)->where('status', 'delivered')->sum('total'),
            'total_revenue' => $delivered->sum('total'),
            'average_order_value' => Order::count() ? Order::avg('total') : 0,
            'pending_payments' => Payment::where('status', 'pending')->sum('amount'),
            'refund_amount' => Payment::where('status', 'refunded')->sum('amount'),
            'review_count' => Review::count(),
        ];
    }

    private function getSalesChart($days = 30)
    {
        $data = [];
        $startDate = Carbon::today()->subDays($days - 1);

        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i);
            $data[$date->format('Y-m-d')] = [
                'date' => $date->format('Y-m-d'),
                'sales' => (float) Order::whereDate('created_at', $date)->where('status', 'delivered')->sum('total'),
                'orders' => Order::whereDate('created_at', $date)->count(),
            ];
        }

        return $data;
    }

    private function getPendingTasks()
    {
        return [
            'products_to_approve' => Product::where('approval_status', 'pending')->count(),
            'sellers_to_verify' => Seller::where('verification_status', 'pending')->count(),
            'orders_to_process' => Order::where('status', 'pending')->count(),
        ];
    }
}