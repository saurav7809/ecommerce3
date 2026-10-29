@extends('layouts.app')

@section('title', 'Manage Products')

@section('content')
<div class="manager-layout">
    @include('admin.partials.sidebar')
    <div class="manager-main">
        <header class="manager-topbar">
            <button class="btn manager-menu-toggle d-lg-none" data-manager-sidebar-open><i class="fas fa-bars"></i></button>
            <div><div class="manager-eyebrow">Catalog control</div><h1 class="h3 mb-0">Products</h1></div>
            <a class="btn btn-primary" href="{{ route('admin.products.index', ['status' => 'pending']) }}"><i class="fas fa-check-double me-2"></i>Review queue</a>
        </header>
        <main class="manager-content">
            <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4"><div><h2 class="h4 mb-1">Product management</h2><p class="text-muted mb-0">Approve, publish, pause, and remove marketplace listings.</p></div><div class="manager-date"><i class="fas fa-boxes-stacked me-2"></i>{{ $products->total() }} total products</div></div>
            @if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif
            <div class="manager-panel p-0">
                <div class="p-3 border-bottom"><form class="row g-2" method="GET"><div class="col-md-6"><div class="input-group"><span class="input-group-text bg-white"><i class="fas fa-search"></i></span><input class="form-control" name="q" value="{{ request('q') }}" placeholder="Search product name or SKU"></div></div><div class="col-md-3"><select class="form-select" name="status"><option value="">All statuses</option>@foreach(['pending','approved','active','inactive','rejected','draft'] as $status)<option value="{{ $status }}" @selected(request('status') === $status)>{{ ucfirst($status) }}</option>@endforeach</select></div><div class="col-md-3"><button class="btn btn-outline-primary w-100">Filter catalog</button></div></form></div>
                <div class="table-responsive"><table class="table manager-table align-middle mb-0"><thead><tr><th>Product</th><th>Seller</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th class="text-end">Actions</th></tr></thead><tbody>
                @forelse($products as $product)
                    <tr><td><div class="d-flex gap-2 align-items-center"><img src="{{ $product->image_url }}" width="48" height="48" class="rounded object-fit-cover" alt=""><span><strong>{{ $product->name }}</strong><small>{{ $product->seller_sku ?: $product->sku }}</small></span></div></td><td>{{ $product->seller->store_name ?? '-' }}</td><td>{{ $product->category->name ?? '-' }}</td><td>Rs. {{ number_format($product->price, 2) }}</td><td><span class="{{ $product->stock_quantity <= 0 ? 'text-danger' : ($product->stock_quantity <= $product->low_stock_threshold ? 'text-warning' : 'text-success') }} fw-bold">{{ $product->stock_quantity }}</span></td><td><span class="status-pill {{ in_array($product->status, ['approved','active']) ? 'success' : ($product->status === 'rejected' ? 'danger' : 'warning') }}">{{ ucfirst($product->status) }}</span></td><td class="text-end"><div class="d-flex justify-content-end gap-1">@if($product->status === 'pending')<form method="POST" action="{{ route('admin.products.update', $product) }}">@csrf @method('PUT')<button name="status" value="approved" class="btn btn-sm btn-success" title="Approve"><i class="fas fa-check"></i></button></form>@else<form method="POST" action="{{ route('admin.products.toggle', $product) }}">@csrf @method('PATCH')<button class="btn btn-sm btn-outline-primary" title="{{ $product->is_active ? 'Deactivate' : 'Activate' }}"><i class="fas fa-power-off"></i></button></form>@endif<form method="POST" action="{{ route('admin.products.destroy', $product) }}" onsubmit="return confirm('Move this product to the recycle bin?')">@csrf @method('DELETE')<button class="btn btn-sm btn-outline-danger" title="Delete"><i class="fas fa-trash"></i></button></form></div></td></tr>
                @empty
                    <tr><td colspan="7" class="text-center text-muted py-5">No products match your filters.</td></tr>
                @endforelse
                </tbody></table></div><div class="p-3">{{ $products->links() }}</div>
            </div>
        </main>
    </div>
</div>
@endsection

@push('styles')
<style>
.object-fit-cover{object-fit:cover}.manager-layout{display:flex;min-height:calc(100vh - 105px);background:#f4f7fb}.manager-sidebar{width:252px;flex:0 0 252px;background:#102a43;color:#d9e7f5;display:flex;flex-direction:column}.manager-brand{height:76px;padding:0 1.25rem;display:flex;align-items:center;gap:.7rem;color:#fff;font-weight:800;border-bottom:1px solid rgba(255,255,255,.1)}.manager-mark{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:#f2b134;color:#102a43;font-weight:900}.manager-nav{padding:1.2rem .8rem;flex:1}.manager-nav-label{padding:1.2rem .8rem .5rem;color:#7190ac;text-transform:uppercase;font-size:.68rem;font-weight:800}.manager-nav-link{display:flex;align-items:center;gap:.75rem;padding:.72rem .8rem;margin:.18rem 0;color:#c3d3e2;border-radius:9px;font-size:.9rem}.manager-nav-link i{width:18px;text-align:center;color:#91abc2}.manager-nav-link:hover,.manager-nav-link.active{background:#1f4869;color:#fff}.manager-nav-link.active i{color:#f2b134}.manager-nav-link b{margin-left:auto;background:#f2b134;color:#102a43;border-radius:20px;padding:.1rem .42rem}.manager-sidebar-footer{padding:1rem;border-top:1px solid rgba(255,255,255,.1)}.manager-main{min-width:0;flex:1}.manager-topbar{height:76px;background:#fff;border-bottom:1px solid #dce5ee;padding:0 2rem;display:flex;justify-content:space-between;align-items:center}.manager-eyebrow{text-transform:uppercase;letter-spacing:.11em;color:#6c8095;font-size:.67rem;font-weight:800;margin-bottom:.28rem}.manager-content{padding:2rem;max-width:1500px}.manager-menu-toggle{font-size:1.2rem}.manager-date{padding:.55rem .8rem;background:#fff;border:1px solid #dce5ee;border-radius:8px;color:#5f7388;font-size:.82rem}.manager-panel{background:#fff;border:1px solid #e0e8f0;border-radius:12px;box-shadow:0 4px 14px rgba(16,42,67,.04)}.manager-table{font-size:.82rem}.manager-table th{font-size:.7rem;text-transform:uppercase;color:#7e91a3;letter-spacing:.04em;border-bottom:1px solid #e6edf3}.manager-table td{border-color:#edf1f5}.manager-table td small{display:block;color:#8798a8;font-size:.7rem;margin-top:.2rem}.status-pill{display:inline-block;padding:.28rem .52rem;border-radius:99px;background:#fff1d1;color:#a77210;font-size:.7rem}.status-pill.success{background:#e2f6ec;color:#16895c}.status-pill.danger{background:#ffe5e6;color:#c23940}@media(max-width:991.98px){.manager-sidebar{position:fixed;z-index:1050;inset:0 auto 0 0;height:100vh;transform:translateX(-100%);transition:transform .2s ease}.manager-sidebar.is-open{transform:translateX(0)}.manager-topbar{padding:0 1rem}.manager-content{padding:1.25rem}}
</style>
@endpush
@push('scripts')<script>document.querySelector('[data-manager-sidebar-open]')?.addEventListener('click',()=>document.getElementById('managerSidebar').classList.add('is-open'));document.querySelector('[data-manager-sidebar-close]')?.addEventListener('click',()=>document.getElementById('managerSidebar').classList.remove('is-open'));</script>@endpush
