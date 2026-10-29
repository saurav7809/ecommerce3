@extends('layouts.app')

@section('title', __('messages.home'))

@section('content')
<div class="container py-4">

    <!-- Hero Banner -->
    <div class="row mb-4">
        <div class="col-12">
            <div id="heroCarousel" class="carousel slide" data-bs-ride="carousel">
                <div class="carousel-inner">
                    <div class="carousel-item active">
                        <div class="hero-section bg-primary text-white p-5 rounded shadow" style="background: linear-gradient(135deg, #2f4cd3, #1c2f8b);">
                            <h1>{{ __('messages.welcome') }}</h1>
                            <p class="lead mb-3">{{ __('messages.hero_tagline') }}</p>
                            <a href="{{ route('products.index') }}" class="btn btn-light btn-lg">{{ __('messages.shop_now') }} <i class="fas fa-arrow-right ms-1"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Categories -->
    @if($categories->isNotEmpty())
    <div class="row mb-4 storefront-categories">
        <div class="col-12">
            <div class="category-grid">
                @php
                    $categoryIcons = [
                        'for-you' => 'fa-bag-shopping', 'fashion' => 'fa-shirt', 'mobiles' => 'fa-mobile-screen-button',
                        'electronics' => 'fa-laptop', 'beauty' => 'fa-wand-magic-sparkles', 'home' => 'fa-house',
                        'appliances' => 'fa-tv', 'toys-baby-kids' => 'fa-baby', 'food-beverages' => 'fa-bowl-food',
                        'auto-accessories' => 'fa-car', 'sports-fitness' => 'fa-dumbbell', 'furniture' => 'fa-couch',
                        'books-more' => 'fa-book', '2-wheelers' => 'fa-motorcycle'
                    ];
                    $categoryColors = [
                        'for-you' => 'blue', 'fashion' => 'yellow', 'mobiles' => 'slate', 'electronics' => 'cyan',
                        'beauty' => 'rose', 'home' => 'indigo', 'appliances' => 'lavender', 'toys-baby-kids' => 'amber',
                        'food-beverages' => 'green', 'auto-accessories' => 'red', 'sports-fitness' => 'violet',
                        'furniture' => 'orange', 'books-more' => 'sky', '2-wheelers' => 'teal'
                    ];
                @endphp
                @foreach($categories as $category)
                    @php
                        $categoryUrls = [
                            'mobiles' => route('home', ['show_mobile_brands' => 1]) . '#mobile-brands',
                            'fashion' => route('home', ['show_fashion_categories' => 1]) . '#clothing',
                            'electronics' => route('home', ['show_electronics_categories' => 1]) . '#electronics',
                            'beauty' => route('home', ['show_beauty_categories' => 1]) . '#beauty',
                            'home' => route('home', ['show_home_categories' => 1]) . '#home-categories',
                            'appliances' => route('home', ['show_appliance_categories' => 1]) . '#appliances',
                            'toys-baby-kids' => route('home', ['show_kids_categories' => 1]) . '#kids-categories',
                            'food-beverages' => route('home', ['show_grocery_categories' => 1]) . '#grocery-categories',
                            'auto-accessories' => route('home', ['show_auto_accessories_categories' => 1]) . '#auto-accessories',
                            'sports-fitness' => route('home', ['show_sports_categories' => 1]) . '#sports-fitness',
                            'furniture' => route('home', ['show_furniture_categories' => 1]) . '#furniture-categories',
                            'books-more' => route('home', ['show_books_categories' => 1]) . '#books-categories',
                            '2-wheelers' => route('home', ['show_two_wheeler_categories' => 1]) . '#two-wheeler-brands',
                        ];
                        $categoryUrl = $categoryUrls[$category->slug] ?? route('products.index', ['category' => $category->id]);
                    @endphp
                    <a href="{{ $categoryUrl }}" class="category-tile category-{{ $categoryColors[$category->slug] ?? 'blue' }} {{ $category->slug === 'mobiles' ? 'mobile-category-tile' : '' }} {{ $category->slug === 'fashion' ? 'fashion-category-tile' : '' }} {{ $category->slug === 'electronics' ? 'electronics-category-tile' : '' }} {{ $category->slug === 'beauty' ? 'beauty-category-tile' : '' }} {{ $category->slug === 'home' ? 'home-category-tile' : '' }} {{ $category->slug === 'appliances' ? 'appliances-category-tile' : '' }} {{ $category->slug === 'toys-baby-kids' ? 'kids-category-tile' : '' }} {{ $category->slug === 'food-beverages' ? 'grocery-category-tile' : '' }} {{ $category->slug === 'auto-accessories' ? 'auto-accessories-category-tile' : '' }} {{ $category->slug === 'sports-fitness' ? 'sports-category-tile' : '' }} {{ $category->slug === 'furniture' ? 'furniture-category-tile' : '' }} {{ $category->slug === 'books-more' ? 'books-category-tile' : '' }} {{ $category->slug === '2-wheelers' ? 'two-wheeler-category-tile' : '' }} {{ request('category') == $category->id ? 'is-active' : '' }}">
                        <span class="category-image">
                            @if($category->image)
                                <img src="{{ asset('storage/categories/' . $category->image) }}" alt="{{ $category->name }}">
                            @else
                                <i class="fas {{ $categoryIcons[$category->slug] ?? 'fa-tag' }}" aria-hidden="true"></i>
                            @endif
                        </span>
                        <span class="category-name">{{ $category->name }}</span>
                    </a>
                @endforeach
                <a href="{{ route('products.index', ['on_sale' => 1]) }}" class="category-tile category-tile-sale category-red {{ request()->boolean('on_sale') ? 'is-active' : '' }}">
                    <span class="category-image"><i class="fas fa-percent" aria-hidden="true"></i></span>
                    <span class="category-name">On Sale</span>
                </a>
            </div>
        </div>
    </div>
    @endif

    <!-- Mobile brands -->
    @if($mobileBrands->isNotEmpty())
    <section id="mobile-brands" class="mobile-brand-section mb-4" aria-labelledby="mobile-brand-heading">
        <div class="mobile-brand-heading">
            <div>
                <span class="mobile-brand-kicker">Explore mobile</span>
                <h4 id="mobile-brand-heading" class="section-heading mb-0">Shop by mobile brand</h4>
            </div>
            <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'mobiles')->id ?? null]) }}" class="mobile-brand-view-all">
                View all <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </a>
        </div>
        <div class="mobile-brand-dots" aria-hidden="true">
            <span class="mobile-brand-dot is-active"></span>
            @foreach($mobileBrands->skip(1) as $brand)
                <span class="mobile-brand-dot"></span>
            @endforeach
        </div>
        <div class="mobile-brand-grid">
            @foreach($mobileBrands as $brand)
                <a href="{{ route('products.index', ['brand' => $brand['name']]) }}" class="mobile-brand-card" style="--brand-color: {{ $brand['color'] }}" aria-label="Shop {{ $brand['name'] }} mobile products">
                    <span class="mobile-brand-visual mobile-brand-photo-wrap">
                        <img src="{{ $brand['image_url'] }}" class="mobile-brand-photo" alt="{{ $brand['name'] }} smartphone" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.removeAttribute('hidden')">
                        <span class="mobile-brand-fallback" hidden><img src="{{ $brand['logo_url'] }}" alt="{{ $brand['name'] }} logo" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.removeAttribute('hidden')"><strong>{{ $brand['initials'] }}</strong></span>
                    </span>
                    <span class="mobile-brand-name">{{ $brand['name'] }}</span>
                </a>
            @endforeach
        </div>
    </section>
    @endif

    <!-- Fashion categories -->
    @if($fashionCategories->isNotEmpty())
    <section id="clothing" class="clothing-section mb-4" aria-labelledby="clothing-heading">
        <div class="clothing-heading">
            <div>
                <span class="clothing-kicker">Fashion edit</span>
                <h2 id="clothing-heading">Fashion</h2>
            </div>
            <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'fashion')->id ?? null]) }}" class="clothing-view-all">
                View all <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </a>
        </div>
        <div class="clothing-dots" aria-hidden="true">
            <span class="clothing-dot is-active"></span>
            @foreach($fashionCategories->skip(1) as $category)
                <span class="clothing-dot"></span>
            @endforeach
        </div>
        <div class="clothing-grid">
            @foreach($fashionCategories as $category)
                <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'fashion')->id ?? null, 'fashion_category' => $category['name']]) }}" class="clothing-card" aria-label="Shop {{ $category['name'] }}">
                    <span class="clothing-photo-wrap">
                        <img src="{{ $category['image'] }}" class="clothing-image" alt="{{ $category['name'] }} fashion" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.removeAttribute('hidden')">
                        <span class="clothing-image-fallback" hidden><i class="fas {{ $category['icon'] }}" aria-hidden="true"></i></span>
                    </span>
                    <span class="clothing-name">{{ $category['name'] }}</span>
                </a>
            @endforeach
        </div>
    </section>
    @endif

    <!-- Electronics categories -->
    @if($electronicsCategories->isNotEmpty())
    <section id="electronics" class="electronics-section mb-4" aria-labelledby="electronics-heading">
        <div class="electronics-heading">
            <div>
                <span class="electronics-kicker">Tech essentials</span>
                <h2 id="electronics-heading">ELECTRONICS</h2>
            </div>
            <span class="launches-badge"><i class="fas fa-sparkles" aria-hidden="true"></i> NEW LAUNCHES</span>
        </div>
        <div class="electronics-dots" aria-hidden="true">
            <span class="electronics-dot is-active"></span>
            @foreach($electronicsCategories->skip(1) as $category)
                <span class="electronics-dot"></span>
            @endforeach
        </div>
        <div class="electronics-grid">
            @foreach($electronicsCategories as $category)
                <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'electronics')->id ?? null, 'electronics_category' => $category['name']]) }}" class="electronics-card {{ !empty($category['highlight']) ? 'electronics-card-launch' : '' }}" style="--electronics-color: {{ $category['color'] }}" aria-label="Shop {{ $category['name'] }}">
                    <span class="electronics-photo-wrap">
                        <img src="{{ $category['image'] }}" class="electronics-photo" alt="{{ $category['name'] }} product" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.removeAttribute('hidden')">
                        <span class="electronics-icon electronics-image-fallback" hidden><i class="fas {{ $category['icon'] }}" aria-hidden="true"></i></span>
                    </span>
                    <span class="electronics-name">{{ $category['name'] }}</span>
                    @if(!empty($category['highlight']))
                        <span class="electronics-new-label">NEW</span>
                    @endif
                </a>
            @endforeach
        </div>
    </section>
    @endif

    <!-- Beauty categories -->
    @if($beautyCategories->isNotEmpty())
    <section id="beauty" class="beauty-section mb-4" aria-labelledby="beauty-heading">
        <div class="beauty-heading">
            <div>
                <span class="beauty-kicker">Beauty edit</span>
                <h2 id="beauty-heading">Beauty</h2>
            </div>
            <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'beauty')->id ?? null]) }}" class="beauty-view-all">
                View all <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </a>
        </div>
        <div class="beauty-dots" aria-hidden="true">
            <span class="beauty-dot is-active"></span>
            @foreach($beautyCategories->skip(1) as $category)
                <span class="beauty-dot"></span>
            @endforeach
        </div>
        <div class="beauty-grid">
            @foreach($beautyCategories as $category)
                <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'beauty')->id ?? null, 'beauty_category' => $category['name']]) }}" class="beauty-card {{ !empty($category['badge']) ? 'beauty-card-badge' : '' }}" style="--beauty-color: {{ $category['color'] }}" aria-label="Shop {{ $category['name'] }}">
                    @if(!empty($category['badge']))
                        <span class="beauty-visual"><span class="beauty-badge"><i class="fas {{ $category['icon'] }}" aria-hidden="true"></i><strong>{{ $category['badge'] }}</strong></span></span>
                    @else
                        <span class="beauty-visual beauty-photo-wrap">
                            <img src="{{ $category['image'] }}" class="beauty-photo" alt="{{ $category['name'] }} beauty product" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.removeAttribute('hidden')">
                            <span class="beauty-image-fallback" hidden><i class="fas {{ $category['icon'] }}" aria-hidden="true"></i></span>
                        </span>
                    @endif
                    <span class="beauty-name">{{ $category['name'] }}</span>
                </a>
            @endforeach
        </div>
    </section>
    @endif

    <!-- Home categories -->
    @if($homeCategories->isNotEmpty())
    <section id="home-categories" class="home-section mb-4" aria-labelledby="home-heading">
        <div class="home-heading">
            <div>
                <span class="home-kicker">Home collection</span>
                <h2 id="home-heading">Home</h2>
            </div>
            <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'home')->id ?? null]) }}" class="home-view-all">View all <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
        </div>
        <div class="home-dots" aria-hidden="true">
            <span class="home-dot is-active"></span>
            @foreach($homeCategories->skip(1) as $category)
                <span class="home-dot"></span>
            @endforeach
        </div>
        <div class="home-grid">
            @foreach($homeCategories as $category)
                <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'home')->id ?? null, 'home_category' => $category['name']]) }}" class="home-card {{ !empty($category['badge']) ? 'home-card-badge' : '' }}" style="--home-color: {{ $category['color'] }}" aria-label="Shop {{ $category['name'] }}">
                    @if(!empty($category['badge']))
                        <span class="home-visual"><span class="home-badge"><i class="fas {{ $category['icon'] }}" aria-hidden="true"></i><strong>{{ $category['badge'] }}</strong></span></span>
                    @else
                        <span class="home-visual home-photo-wrap">
                            <img src="{{ $category['image'] }}" class="home-photo" alt="{{ $category['name'] }} home product" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.removeAttribute('hidden')">
                            <span class="home-image-fallback" hidden><i class="fas {{ $category['icon'] }}" aria-hidden="true"></i></span>
                        </span>
                    @endif
                    <span class="home-name">{{ $category['name'] }}</span>
                </a>
            @endforeach
        </div>
    </section>
    @endif

    <!-- Appliance categories -->
    @if($applianceCategories->isNotEmpty())
    <section id="appliances" class="appliances-section mb-4" aria-labelledby="appliances-heading">
        <div class="appliances-heading">
            <div>
                <span class="appliances-kicker">Appliance collection</span>
                <h2 id="appliances-heading">Appliances</h2>
            </div>
            <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'appliances')->id ?? null]) }}" class="appliances-view-all">View all <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
        </div>
        <div class="appliances-photo-dots" aria-hidden="true">
            <span class="appliances-photo-dot is-active"></span>
            @foreach($applianceCategories->skip(1) as $category)<span class="appliances-photo-dot"></span>@endforeach
        </div>
        <div class="appliances-progress" aria-hidden="true">
            <div class="appliances-progress-track"><span class="appliances-progress-pill"></span></div>
            <div class="appliances-progress-dots">
                @foreach($applianceCategories as $category)
                    <span class="appliances-progress-dot {{ $loop->first ? 'is-active' : '' }}"></span>
                @endforeach
            </div>
        </div>
        <div class="appliances-scroll" data-appliances-scroll>
            @foreach($applianceCategories as $category)
                <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'appliances')->id ?? null, 'appliance_category' => $category['name']]) }}" class="appliance-card" style="--appliance-color: {{ $category['color'] }}" aria-label="Shop {{ $category['name'] }}">
                    <span class="appliance-tile appliance-photo-wrap">
                        <img src="{{ $category['image'] }}" class="appliance-photo" alt="{{ $category['name'] }} appliance" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.removeAttribute('hidden')">
                        <i class="fas {{ $category['icon'] }} appliance-product appliance-image-fallback" aria-hidden="true" hidden></i>
                    </span>
                    <span class="appliance-name">{{ $category['name'] }}</span>
                </a>
            @endforeach
        </div>
    </section>
    @endif

    <!-- Toys, Baby & Kids categories -->
    @if($kidsCategories->isNotEmpty())
    <section id="kids-categories" class="kids-section mb-4" aria-labelledby="kids-heading">
        <div class="kids-heading">
            <div>
                <span class="kids-kicker">Little ones collection</span>
                <h2 id="kids-heading">Toys, Baby &amp; Kids</h2>
            </div>
            <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'toys-baby-kids')->id ?? null]) }}" class="kids-view-all">View all <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
        </div>
        <div class="kids-dots" aria-hidden="true">
            <span class="kids-dot is-active"></span>
            @foreach($kidsCategories->skip(1) as $category)<span class="kids-dot"></span>@endforeach
        </div>
        <div class="kids-grid">
            @foreach($kidsCategories as $category)
                <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'toys-baby-kids')->id ?? null, 'kids_category' => $category['name']]) }}" class="kids-card" style="--kids-color: {{ $category['color'] }}" aria-label="Shop {{ $category['name'] }}">
                    <span class="kids-tile kids-photo-wrap">
                        <img src="{{ $category['image'] }}" class="kids-photo" alt="{{ $category['name'] }} product" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.removeAttribute('hidden')">
                        <i class="fas {{ $category['icon'] }} kids-product-icon kids-image-fallback" aria-hidden="true" hidden></i>
                    </span>
                    <span class="kids-name">{{ $category['name'] }}</span>
                </a>
            @endforeach
        </div>
    </section>
    @endif

    <!-- Grocery & wellness categories -->
    @if($groceryCategories->isNotEmpty())
    <section id="grocery-categories" class="grocery-section mb-4" aria-labelledby="grocery-heading">
        <div class="grocery-heading">
            <div>
                <span class="grocery-kicker">Food &amp; wellness collection</span>
                <h2 id="grocery-heading">Food &amp; Beverages</h2>
            </div>
            <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'food-beverages')->id ?? null]) }}" class="grocery-view-all">View all <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
        </div>
        <div class="grocery-grid">
            @foreach($groceryCategories as $category)
                <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'food-beverages')->id ?? null, 'grocery_category' => $category['name']]) }}" class="grocery-card" style="--grocery-color: {{ $category['color'] }}" aria-label="Shop {{ $category['name'] }}">
                    <span class="grocery-tile">
                        <img src="{{ $category['image'] }}" class="grocery-image" alt="{{ $category['name'] }} product" loading="lazy">
                    </span>
                    <span class="grocery-name">{{ $category['name'] }}</span>
                </a>
            @endforeach
        </div>
    </section>
    @endif

    <!-- Auto accessories categories -->
    @if($autoAccessoriesCategories->isNotEmpty())
    <section id="auto-accessories" class="auto-accessories-section mb-4" aria-labelledby="auto-accessories-heading">
        <div class="auto-accessories-heading">
            <div>
                <span class="auto-accessories-kicker">Drive-ready collection</span>
                <h2 id="auto-accessories-heading">Auto Accessories</h2>
            </div>
            <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'auto-accessories')->id ?? null]) }}" class="auto-accessories-view-all">View all <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
        </div>
        <div class="auto-accessories-grid">
            @foreach($autoAccessoriesCategories as $category)
                <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'auto-accessories')->id ?? null, 'auto_category' => $category['name']]) }}" class="auto-accessories-card" style="--auto-color: {{ $category['color'] }}" aria-label="Shop {{ $category['name'] }}">
                    <span class="auto-accessories-tile">
                        <img src="{{ $category['image'] }}" class="auto-accessories-image" alt="{{ $category['name'] }} product" loading="lazy">
                    </span>
                    <span class="auto-accessories-name">{{ $category['name'] }}</span>
                </a>
            @endforeach
        </div>
    </section>
    @endif

    <!-- Sports & Fitness categories -->
    @if($sportsCategories->isNotEmpty())
    <section id="sports-fitness" class="sports-section mb-4" aria-labelledby="sports-heading">
        <div class="sports-heading">
            <div>
                <span class="sports-kicker">Move better collection</span>
                <h2 id="sports-heading">Sports &amp; Fitness</h2>
            </div>
            <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'sports-fitness')->id ?? null]) }}" class="sports-view-all">View all <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
        </div>
        <div class="sports-dots" aria-hidden="true">
            <span class="sports-dot is-active"></span>
            @foreach($sportsCategories->skip(1) as $category)
                <span class="sports-dot"></span>
            @endforeach
        </div>
        <div class="sports-grid">
            @foreach($sportsCategories as $category)
                <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'sports-fitness')->id ?? null, 'sports_category' => $category['name']]) }}" class="sports-card sports-card-{{ $category['shape'] }}" style="--sports-color: {{ $category['color'] }}" aria-label="Shop {{ $category['name'] }}">
                    <span class="sports-tile">
                        <img src="{{ $category['image'] }}" class="sports-image" alt="{{ $category['name'] }} equipment" loading="lazy">
                    </span>
                    <span class="sports-name">{{ $category['name'] }}</span>
                </a>
            @endforeach
        </div>
    </section>
    @endif

    <!-- Furniture categories -->
    @if($furnitureCategories->isNotEmpty())
    <section id="furniture-categories" class="furniture-section mb-4" aria-labelledby="furniture-heading">
        <div class="furniture-heading">
            <div>
                <span class="furniture-kicker">Furniture collection</span>
                <h2 id="furniture-heading">Furniture</h2>
            </div>
            <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'furniture')->id ?? null]) }}" class="furniture-view-all">View all <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
        </div>
        <div class="furniture-dots" aria-hidden="true">
            @foreach($furnitureCategories as $category)
                <span class="furniture-dot {{ $loop->first ? 'is-active' : '' }}"></span>
            @endforeach
        </div>
        <div class="furniture-grid" data-furniture-scroll>
            @foreach($furnitureCategories as $category)
                @if(!empty($category['cta']))
                    <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'furniture')->id ?? null]) }}" class="furniture-card furniture-cta" aria-label="View all furniture categories">
                        <span class="furniture-cta-art"><i class="fas fa-caret-up" aria-hidden="true"></i><i class="fas fa-square" aria-hidden="true"></i><i class="fas fa-circle" aria-hidden="true"></i></span>
                        <span class="furniture-name">{{ $category['name'] }}</span>
                    </a>
                @else
                    <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'furniture')->id ?? null, 'furniture_category' => $category['name']]) }}" class="furniture-card" aria-label="Shop {{ $category['name'] }}">
                        <img src="{{ $category['image'] }}" class="furniture-image" alt="{{ $category['name'] }} furniture" loading="lazy">
                        <span class="furniture-name">{{ $category['name'] }}</span>
                    </a>
                @endif
            @endforeach
        </div>
    </section>
    @endif

    <!-- Books & musical instruments categories -->
    @if($booksCategories->isNotEmpty())
    <section id="books-categories" class="books-section mb-4" aria-labelledby="books-heading">
        <div class="books-heading">
            <div>
                <span class="books-kicker">Books &amp; music collection</span>
                <h2 id="books-heading">Books &amp; Musical Instruments</h2>
            </div>
            <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'books-more')->id ?? null]) }}" class="books-view-all">View all <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
        </div>
        <div class="books-dots" aria-hidden="true">
            <span class="books-dot is-active"></span>
            @foreach($booksCategories->skip(1) as $category)
                <span class="books-dot"></span>
            @endforeach
        </div>
        <div class="books-grid">
            @foreach($booksCategories as $category)
                <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', 'books-more')->id ?? null, 'books_category' => $category['name']]) }}" class="books-card books-card-{{ $category['shape'] }}" style="--books-color: {{ $category['color'] }}" aria-label="Shop {{ $category['name'] }}">
                    <span class="books-tile"><img src="{{ $category['image'] }}" class="books-image" alt="{{ $category['name'] }} product" loading="lazy"></span>
                    <span class="books-name">{{ $category['name'] }}</span>
                </a>
            @endforeach
        </div>
    </section>
    @endif

    <!-- Two-wheeler brands and EV comparison -->
    @if($twoWheelerBrands->isNotEmpty())
    <section id="two-wheeler-brands" class="two-wheeler-section mb-4" aria-labelledby="two-wheeler-heading">
        <div class="two-wheeler-heading">
            <div>
                <span class="two-wheeler-kicker">Nepal two-wheeler marketplace</span>
                <h2 id="two-wheeler-heading">Shop by Brand</h2>
            </div>
            <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', '2-wheelers')->id ?? null]) }}" class="two-wheeler-view-all">View all <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
        </div>
        <div class="two-wheeler-dots" aria-hidden="true">
            <span class="two-wheeler-dot is-active"></span>
            @foreach($twoWheelerBrands->skip(1) as $brand)
                <span class="two-wheeler-dot"></span>
            @endforeach
        </div>
        <div class="two-wheeler-brand-grid">
            @foreach($twoWheelerBrands as $brand)
                <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', '2-wheelers')->id ?? null, 'brand' => $brand['name']]) }}" class="two-wheeler-brand-card" style="--two-wheeler-color: {{ $brand['color'] }}" aria-label="Shop {{ $brand['name'] }} bikes">
                    <span class="two-wheeler-logo-wrap">
                        <img src="{{ $brand['image'] }}" class="two-wheeler-image" alt="{{ $brand['name'] }} motorcycle" loading="lazy">
                    </span>
                    <span class="two-wheeler-brand-name">{{ $brand['name'] }}</span>
                </a>
            @endforeach
        </div>

        <div class="bike-compare-heading">
            <span class="two-wheeler-kicker">Choose your ride</span>
            <h3>Electric vs Petrol Bikes - Which One Fits You?</h3>
        </div>
        <div class="bike-compare-grid">
            <article class="bike-compare-card bike-compare-ev">
                <div class="bike-compare-icon"><i class="fas fa-charging-station" aria-hidden="true"></i></div>
                <h3>Electric (EV)</h3>
                <ul>
                    <li>Zero fuel cost and lower running cost per km</li>
                    <li>No emissions and a quieter ride</li>
                    <li>Lower maintenance with fewer moving parts</li>
                    <li>Potential government benefits in Nepal</li>
                    <li>Range and charging time suited to city trips</li>
                    <li>Ideal for daily commuting</li>
                </ul>
                <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', '2-wheelers')->id ?? null, 'type' => 'ev']) }}" class="bike-compare-cta">Shop EV bikes</a>
            </article>
            <article class="bike-compare-card bike-compare-petrol">
                <div class="bike-compare-icon"><i class="fas fa-gas-pump" aria-hidden="true"></i></div>
                <h3>Petrol (Non-EV)</h3>
                <ul>
                    <li>Longer range and refueling in minutes</li>
                    <li>Wide service network across Nepal</li>
                    <li>Built for highways and hilly terrain</li>
                    <li>More engine power and torque options</li>
                    <li>Established resale value</li>
                    <li>Models across 100cc to 650cc and beyond</li>
                </ul>
                <a href="{{ route('products.index', ['category' => $categories->firstWhere('slug', '2-wheelers')->id ?? null, 'type' => 'petrol']) }}" class="bike-compare-cta">Shop Petrol bikes</a>
            </article>
        </div>
    </section>
    @endif

    <!-- Featured Products -->
    @if($featuredProducts->isNotEmpty())
    <div class="row mb-4">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="section-heading">{{ __('messages.featured_products') }}</h4>
                <a href="{{ route('products.index') }}" class="btn btn-link">{{ __('messages.view_all') }} <i class="fas fa-arrow-right"></i></a>
            </div>
            <div class="row row-cols-lg-4 row-cols-md-3 row-cols-2 g-3">
                @foreach($featuredProducts as $product)
                <div class="product-card">
                    <div class="card h-100">
                        @if($product->hasDiscount())
                            <span class="position-absolute badge bg-danger discount-badge mt-2 ms-2">-{{ $product->discount_percentage }}%</span>
                        @endif
                        <a href="{{ route('product.show', $product->slug) }}">
                            <img src="{{ $product->image_url }}" class="card-img-top" alt="{{ $product->name }}">
                        </a>
                        <div class="card-body">
                            <h6 class="card-title text-truncate mt-2">{{ $product->name }}</h6>
                            <div class="d-flex align-items-center gap-1 small text-muted mb-2">
                                <i class="fas fa-star star-rating"></i>
                                <span class="fw-semibold">{{ number_format($product->rating, 1) }}</span>
                                <span>· ({{ $product->total_reviews }})</span>
                            </div>
                            @if($product->hasDiscount())
                                <div class="h5 fw-bold text-brand">{{ number_format($product->price, 2) }} <span class="text-muted text-decoration-line-through fs-6">Rs. {{ number_format($product->compare_price, 2) }}</span></div>
                            @else
                                <div class="h5 fw-bold text-brand">Rs. {{ number_format($product->price, 2) }}</div>
                            @endif
                            <a href="{{ route('product.show', $product->slug) }}" class="btn btn-sm bg-brand text-white w-100 mt-2">{{ __('messages.view_product') }}</a>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
    </div>
    @endif

    <!-- New Arrivals -->
    @if($newArrivals->isNotEmpty())
    <div class="row mb-4">
        <div class="col-12">
            <h4 class="section-heading">{{ __('messages.new_arrivals') }}</h4>
            <div class="row row-cols-lg-4 row-cols-md-3 row-cols-2 g-3">
                @foreach($newArrivals as $product)
                <div class="product-card">
                    <div class="card h-100">
                        <a href="{{ route('product.show', $product->slug) }}">
                            <img src="{{ $product->image_url }}" class="card-img-top" alt="{{ $product->name }}">
                        </a>
                        <div class="card-body">
                            <h6 class="card-title text-truncate">{{ $product->name }}</h6>
                            <div class="fw-bold text-brand">Rs. {{ number_format($product->price, 2) }}</div>
                            <a href="{{ route('product.show', $product->slug) }}" class="btn btn-sm bg-brand text-white w-100 mt-2">{{ __('messages.view_product') }}</a>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
    </div>
    @endif

</div>
@endsection