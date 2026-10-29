@php
    $cartCount = auth()->check() ? app(\App\Services\CartService::class)->getCartCount(auth()->id()) : 0;
    $currentLocale = app()->getLocale();
    $locales = config('locale.supported');
@endphp
<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
        <a class="navbar-brand" href="{{ route('home') }}">
            <img src="{{ asset('images/logo.png') }}?v={{ filemtime(public_path('images/logo.png')) }}" alt="SUMIT home" class="brand-logo">
        </a>
        <div class="d-flex align-items-center d-lg-none">
            <a href="{{ route('customer.cart.index') }}" class="nav-link position-relative cart-icon me-2" title="{{ __('messages.cart') }}">
                <i class="fas fa-shopping-cart fa-lg"></i><span class="position-absolute top-0 start-100 translate-middle badge cart-count">{{ $cartCount }}</span>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"><span class="navbar-toggler-icon"></span></button>
        </div>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
                <li class="nav-item"><a class="nav-link" href="{{ route('products.index') }}">{{ __('messages.products') }}</a></li>
                <li class="nav-item"><a class="nav-link" href="#">{{ __('messages.categories') }}</a></li>
                <li class="nav-item"><a class="nav-link" href="#">{{ __('messages.deals') }}</a></li>
            </ul>
            <form class="d-flex mx-auto" action="{{ route('search') }}" method="GET">
                <input class="form-control me-2" type="search" name="q" placeholder="{{ __('messages.search_placeholder') }}" aria-label="{{ __('messages.search') }}">
                <button class="btn btn-outline-success" type="submit"><i class="fas fa-search"></i></button>
            </form>
            <ul class="navbar-nav ms-auto align-items-lg-center">
                <li class="nav-item d-none d-lg-block"><a href="{{ route('customer.cart.index') }}" class="nav-link position-relative cart-icon" title="{{ __('messages.cart') }}"><i class="fas fa-shopping-cart fa-lg"></i><span class="badge cart-count">{{ $cartCount }}</span></a></li>
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="languageDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" title="{{ __('messages.language') }}"><i class="fas fa-globe me-1"></i><span class="d-none d-md-inline">{{ $locales[$currentLocale]['native'] ?? 'English' }}</span></a>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="languageDropdown">
                        @foreach($locales as $code => $lang)
                            <li><form method="POST" action="{{ route('language.switch', $code) }}" class="language-form m-0">@csrf<button type="submit" class="dropdown-item d-flex align-items-center {{ $currentLocale === $code ? 'active' : '' }}"><span class="me-2">{{ $lang['flag'] }}</span>{{ $lang['native'] }}</button></form></li>
                        @endforeach
                    </ul>
                </li>
                @auth
                    <li class="nav-item dropdown user-account-item">
                        <a class="nav-link dropdown-toggle d-flex align-items-center gap-2 user-account-trigger" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <img src="{{ auth()->user()->avatar_url }}" alt="Avatar" class="rounded-circle user-account-avatar" width="34" height="34">
                            <span class="user-account-name d-none d-lg-inline">{{ auth()->user()->first_name }}</span>
                        </a>
                        <div class="dropdown-menu dropdown-menu-end customer-account-menu shadow-sm">
                            <div class="customer-account-summary">
                                <div class="customer-account-summary-avatar">
                                    <img src="{{ auth()->user()->avatar_url }}" alt="Avatar" class="rounded-circle" width="40" height="40">
                                </div>
                                <div class="customer-account-summary-text">
                                    <div class="customer-account-summary-name">{{ auth()->user()->first_name }} {{ auth()->user()->last_name }}</div>
                                    <div class="customer-account-summary-email">{{ auth()->user()->email }}</div>
                                </div>
                            </div>

                            @if(auth()->user()->is_admin || auth()->user()->is_seller)
                                <div class="customer-account-shortcuts">
                                    @if(auth()->user()->is_admin)
                                        <a href="{{ route('admin.dashboard') }}" class="customer-account-link"><i class="fas fa-gauge-high"></i>Admin dashboard</a>
                                    @endif
                                    @if(auth()->user()->is_seller)
                                        <a href="{{ route('seller.dashboard') }}" class="customer-account-link"><i class="fas fa-store"></i>Seller dashboard</a>
                                        <a href="{{ route('seller.products.index') }}" class="customer-account-link"><i class="fas fa-boxes-stacked"></i>My products</a>
                                        <a href="{{ route('seller.products.create') }}" class="customer-account-link"><i class="fas fa-plus"></i>Add product</a>
                                    @endif
                                </div>
                            @endif

                            <div class="customer-account-title">Your Account</div>
                            <div class="customer-account-list">
                                <a href="{{ route('home') }}" class="customer-account-link"><i class="fas fa-user"></i>My Profile</a>
                                <a href="{{ route('home') }}" class="customer-account-link"><i class="fas fa-box"></i>Orders</a>
                                <a href="{{ route('home') }}" class="customer-account-link"><i class="fas fa-ticket-alt"></i>Coupons</a>
                                <a href="{{ route('home') }}" class="customer-account-link"><i class="fas fa-gift"></i>Supercoin</a>
                                <a href="{{ route('home') }}" class="customer-account-link"><i class="fas fa-rocket"></i>Flipkart Plus Zone</a>
                                <a href="{{ route('home') }}" class="customer-account-link"><i class="fas fa-wallet"></i>Saved Cards &amp; Wallet</a>
                                <a href="{{ route('home') }}" class="customer-account-link"><i class="fas fa-map-marker-alt"></i>Saved Addresses</a>
                                <a href="{{ route('home') }}" class="customer-account-link"><i class="fas fa-heart"></i>Wishlist</a>
                                <a href="{{ route('home') }}" class="customer-account-link"><i class="fas fa-gift"></i>Gift Cards</a>
                                <a href="{{ route('home') }}" class="customer-account-link"><i class="fas fa-bell"></i>Notifications</a>
                                <a href="{{ route('logout') }}" class="customer-account-link customer-account-logout" onclick="event.preventDefault(); document.getElementById('logout-form').submit();"><i class="fas fa-right-from-bracket"></i>Logout</a>
                                <form id="logout-form" action="{{ route('logout') }}" method="POST" class="d-none">@csrf</form>
                            </div>
                        </div>
                    </li>
                @else
                    <li class="nav-item"><a class="nav-link" href="{{ route('login') }}">{{ __('messages.login') }}</a></li>
                    <li class="nav-item"><a class="nav-link" href="{{ route('register') }}">{{ __('messages.register') }}</a></li>
                @endauth
            </ul>
        </div>
    </div>
</nav>
<div class="delivery-location-bar" data-location-widget>
    <div class="container delivery-location-inner">
        <label class="delivery-location-label" for="delivery-location-input">
            <i class="fas fa-location-dot" aria-hidden="true"></i>
            <span>Deliver to</span>
        </label>
        <input id="delivery-location-input" class="delivery-location-input" type="text" placeholder="Enter your delivery location" autocomplete="street-address" data-location-input>
        <button type="button" class="location-detect-button" data-detect-location>
            <i class="fas fa-location-crosshairs" aria-hidden="true"></i>
            <span data-location-action-label>Use my current location</span>
        </button>
        <span class="delivery-location-status" data-location-status role="status" aria-live="polite"></span>
    </div>
</div>
