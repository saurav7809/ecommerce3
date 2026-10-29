@extends('layouts.app')

@section('title', 'Seller Dashboard')

@section('content')
<div class="container py-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
            <p class="text-muted mb-1">{{ $seller->store_name }}</p>
            <h1 class="h3 mb-0">Seller Dashboard</h1>
        </div>
        <div class="d-flex align-items-center gap-2">
            <a href="{{ route('seller.products.create') }}" class="btn btn-primary"><i class="fas fa-plus me-2"></i>Add product</a>
            <span class="badge text-bg-{{ $seller->verification_status === 'approved' ? 'success' : 'warning' }} px-3 py-2">{{ ucfirst($seller->verification_status) }}</span>
        </div>
    </div>

    <div class="row g-3 mb-4">
        <div class="col-6 col-xl-3">
            <div class="card h-100"><div class="card-body"><div class="text-muted small">Delivered sales</div><div class="h4 mb-0">Rs. {{ number_format($stats['sales'], 2) }}</div></div></div>
        </div>
        <div class="col-6 col-xl-3">
            <div class="card h-100"><div class="card-body"><div class="text-muted small">Total orders</div><div class="h4 mb-0">{{ number_format($stats['orders']) }}</div><small class="text-warning">{{ $stats['pending_orders'] }} awaiting action</small></div></div>
        </div>
        <div class="col-6 col-xl-3">
            <div class="card h-100"><div class="card-body"><div class="text-muted small">Catalog</div><div class="h4 mb-0">{{ number_format($stats['products']) }}</div><small class="text-danger">{{ $stats['out_of_stock'] }} out of stock</small></div></div>
        </div>
        <div class="col-6 col-xl-3">
            <div class="card h-100"><div class="card-body"><div class="text-muted small">Store rating</div><div class="h4 mb-0">{{ number_format($stats['rating'], 2) }} / 5</div><small class="text-warning">{{ $stats['low_stock'] }} low stock</small></div></div>
        </div>
    </div>

    <div class="card border-0 shadow-sm mb-4">
        <div class="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
                <h2 class="h5 mb-1">Manage your catalog</h2>
                <p class="text-muted mb-0">Add new items, update listings, and track approval status.</p>
            </div>
            <a href="{{ route('seller.products.index') }}" class="btn btn-outline-primary"><i class="fas fa-boxes-stacked me-2"></i>View products</a>
        </div>
    </div>

    <div class="row g-4">
        <div class="col-lg-8">
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center"><strong>Recent orders</strong><span class="badge text-bg-info">{{ $stats['processing_orders'] }} processing</span></div>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                        <tbody>
                        @forelse($recentOrders as $order)
                            <tr>
                                <td>{{ $order->order_number }}</td>
                                <td>{{ $order->customer->full_name ?? 'Unknown customer' }}</td>
                                <td>Rs. {{ number_format($order->total, 2) }}</td>
                                <td><span class="badge text-bg-{{ $order->status_class }}">{{ $order->status_text }}</span></td>
                                <td>{{ $order->created_at->format('Y-m-d') }}</td>
                            </tr>
                        @empty
                            <tr><td colspan="5" class="text-center text-muted py-4">No orders assigned yet.</td></tr>
                        @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="col-lg-4">
            <div class="card">
                <div class="card-header"><strong>Inventory attention</strong></div>
                <div class="list-group list-group-flush">
                    @forelse($lowStockProducts as $product)
                        <div class="list-group-item d-flex justify-content-between gap-3">
                            <span class="text-truncate">{{ $product->name }}</span>
                            <span class="badge text-bg-{{ $product->stock_quantity === 0 ? 'danger' : 'warning' }}">{{ $product->stock_quantity }}</span>
                        </div>
                    @empty
                        <div class="list-group-item text-muted">Inventory levels are healthy.</div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
