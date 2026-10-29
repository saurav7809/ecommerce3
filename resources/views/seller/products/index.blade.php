@extends('layouts.app')

@section('title', 'Seller Products')

@section('content')
<div class="container py-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div><p class="text-uppercase small text-primary fw-bold mb-1">Catalog workspace</p><h1 class="h3 mb-1">Products</h1><p class="text-muted mb-0">Manage your catalog and approval status.</p></div>
        <a href="{{ route('seller.products.create') }}" class="btn btn-primary"><i class="fas fa-plus me-2"></i>Add product</a>
    </div>

    @if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif
    <div class="card border-0 shadow-sm">
        <div class="card-body border-bottom">
            <form class="row g-2" method="GET">
                <div class="col-md-6"><input class="form-control" name="q" value="{{ request('q') }}" placeholder="Search by product name or SKU"></div>
                <div class="col-md-3"><select class="form-select" name="status"><option value="">All statuses</option>@foreach(['draft','pending','approved','rejected','active','inactive'] as $status)<option value="{{ $status }}" @selected(request('status') === $status)>{{ ucfirst($status) }}</option>@endforeach</select></div>
                <div class="col-md-3"><button class="btn btn-outline-primary w-100">Filter products</button></div>
            </form>
        </div>
        <div class="table-responsive">
            <table class="table align-middle mb-0">
                <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
                <tbody>
                @forelse($products as $product)
                    <tr>
                        <td><div class="d-flex align-items-center gap-2"><img src="{{ $product->image_url }}" width="48" height="48" class="rounded object-fit-cover" alt=""><div><strong>{{ $product->name }}</strong><small class="d-block text-muted">{{ $product->brand->name ?? 'Unbranded' }}</small></div></div></td>
                        <td>{{ $product->seller_sku ?: $product->sku }}</td><td>{{ $product->category->name ?? '-' }}</td><td>Rs. {{ number_format($product->price, 2) }}</td><td>{{ $product->stock_quantity }}</td>
                        <td><span class="badge text-bg-{{ in_array($product->status, ['approved','active']) ? 'success' : ($product->status === 'rejected' ? 'danger' : 'warning') }}">{{ ucfirst($product->status) }}</span></td>
                        <td class="text-end"><a class="btn btn-sm btn-outline-secondary" href="{{ route('seller.products.edit', $product) }}" title="Edit product"><i class="fas fa-pen"></i></a></td>
                    </tr>
                @empty
                    <tr><td colspan="7" class="text-center py-5 text-muted">No products yet. Start with your first catalog item.</td></tr>
                @endforelse
                </tbody>
            </table>
        </div>
        @if($products->hasPages())<div class="card-body">{{ $products->links() }}</div>@endif
    </div>
</div>
@endsection
