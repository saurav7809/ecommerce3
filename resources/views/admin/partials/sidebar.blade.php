<aside class="manager-sidebar" id="managerSidebar">
    <div class="manager-brand"><span class="manager-mark">S</span><span>SUMIT Manager</span><button class="btn btn-sm text-white d-lg-none ms-auto" type="button" data-manager-sidebar-close><i class="fas fa-times"></i></button></div>
    <nav class="manager-nav" aria-label="Manager navigation">
        <a class="manager-nav-link {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}" href="{{ route('admin.dashboard') }}"><i class="fas fa-chart-line"></i><span>Dashboard</span></a>
        <div class="manager-nav-label">Catalog</div>
        <a class="manager-nav-link {{ request()->routeIs('admin.products.*') ? 'active' : '' }}" href="{{ route('admin.products.index') }}"><i class="fas fa-boxes-stacked"></i><span>Products</span>@if(($stats['pending_products'] ?? 0) > 0)<b>{{ $stats['pending_products'] }}</b>@endif</a>
        <a class="manager-nav-link" href="{{ route('admin.products.index') }}"><i class="fas fa-plus-circle"></i><span>Catalog actions</span></a>
        <a class="manager-nav-link" href="{{ route('products.index') }}"><i class="fas fa-eye"></i><span>Storefront</span></a>
        <div class="manager-nav-label">Operations</div>
        <a class="manager-nav-link" href="#orders"><i class="fas fa-receipt"></i><span>Orders</span></a>
        <a class="manager-nav-link" href="#inventory"><i class="fas fa-warehouse"></i><span>Inventory</span></a>
        <a class="manager-nav-link" href="#customers"><i class="fas fa-users"></i><span>Customers</span></a>
        <div class="manager-nav-label">Growth</div>
        <a class="manager-nav-link" href="#reports"><i class="fas fa-chart-pie"></i><span>Reports</span></a>
        <a class="manager-nav-link" href="#settings"><i class="fas fa-sliders"></i><span>Settings</span></a>
    </nav>
    <div class="manager-sidebar-footer"><div class="small text-white-50">Signed in as</div><strong>{{ auth()->user()->full_name }}</strong><form method="POST" action="{{ route('logout') }}" class="mt-3">@csrf<button class="btn btn-sm btn-outline-light w-100"><i class="fas fa-arrow-right-from-bracket me-2"></i>Logout</button></form></div>
</aside>
