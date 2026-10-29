@extends('layouts.app')

@section('title', $product->name)

@php
    $highlights = $product->highlights;
    if (is_string($highlights)) {
        $highlights = json_decode($highlights, true) ?: [];
    }
    $highlights = is_array($highlights) ? $highlights : [];
    $specifications = $product->specifications->take(4);
    $deliveryDate = now()->addDays(3)->format('j M, D');
@endphp

@push('styles')
<style>
    .product-detail-page { background: #fff; padding-bottom: 92px; }
    .product-detail-shell { max-width: 1180px; margin: 0 auto; }
    .detail-gallery { position: relative; display: grid; grid-template-columns: 76px minmax(0, 1fr); gap: 12px; align-items: start; padding: 12px; background: #f4f4f2; }
    .detail-gallery-main { grid-column: 2; grid-row: 1; display: block; width: 100%; height: min(54vw, 540px); border-radius: 10px; object-fit: contain; mix-blend-mode: multiply; }
    .detail-gallery-thumbs { grid-column: 1; grid-row: 1; display: flex; flex-direction: column; gap: 10px; max-height: 540px; overflow-y: auto; padding: 2px; scrollbar-width: thin; }
    .detail-gallery-thumb { flex: 0 0 68px; width: 68px; height: 68px; padding: 3px; border: 1px solid #d7d7d7; border-radius: 9px; background: #fff; cursor: pointer; transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
    .detail-gallery-thumb.is-active { border-color: #1264e8; box-shadow: 0 0 0 1px #1264e8; }
    .detail-gallery-thumb:hover { transform: translateY(-1px); border-color: #1264e8; }
    .detail-gallery-thumb img { display: block; width: 100%; height: 100%; object-fit: contain; }
    .gallery-count { position: absolute; right: 24px; bottom: 24px; padding: 6px 10px; border-radius: 6px; color: #fff; background: rgba(0,0,0,.62); font-size: 12px; }
    .detail-copy { padding: 24px 28px 0; }
    .detail-brand { color: #666; font-size: 13px; letter-spacing: .04em; text-transform: uppercase; }
    .detail-title { margin: 5px 0 10px; font-size: clamp(22px, 3vw, 32px); line-height: 1.2; }
    .detail-rating { color: #555; font-size: 14px; }
    .detail-rating i { color: #f1b400; }
    .detail-price { margin: 18px 0 4px; color: #171717; font-size: 28px; font-weight: 700; }
    .detail-mrp { color: #8a8a8a; font-size: 14px; text-decoration: line-through; }
    .detail-discount { margin-left: 8px; color: #0b8d50; font-size: 14px; font-weight: 700; }
    .detail-panel { margin-top: 12px; padding: 14px 16px; border-radius: 0 0 16px 16px; background: #f5f5f5; }
    .detail-panel.delivery { border-radius: 12px 12px 0 0; background: #eef7ff; }
    .detail-panel-row { display: flex; align-items: center; gap: 12px; }
    .detail-panel i { width: 18px; color: #333; text-align: center; }
    .detail-panel strong { font-size: 17px; }
    .detail-panel small { display: block; margin: 4px 0 0 30px; color: #f04e23; font-size: 14px; }
    .seller-panel { margin-top: 8px; padding: 14px 16px; border-radius: 0 0 14px 14px; background: #f5f5f5; }
    .seller-panel p { margin: 3px 0 0 30px; color: #777; }
    .seller-panel a, .location-link { color: #1264e8; font-weight: 700; }
    .detail-benefits { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px; padding: 18px 0; border-bottom: 1px solid #e5e5e5; }
    .benefit { color: #444; font-size: 14px; text-align: center; }
    .benefit-icon { display: grid; place-items: center; width: 40px; height: 40px; margin: 0 auto 8px; border-radius: 11px; color: #075de7; background: #f2f5f7; font-size: 20px; }
    .detail-section { padding: 20px 0; border-bottom: 1px solid #e5e5e5; }
    .detail-section-heading { display: flex; align-items: center; justify-content: space-between; margin: 0 0 16px; font-size: 24px; }
    .section-toggle { display: grid; place-items: center; width: 40px; height: 40px; border: 0; border-radius: 11px; background: #f5f5f5; color: #222; }
    .highlight-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0 30px; }
    .highlight-item { min-height: 72px; padding: 0 0 12px; border-bottom: 1px solid #e5e5e5; color: #444; font-size: 18px; }
    .highlight-item strong { display: block; font-weight: 400; }
    .highlight-item span { display: block; margin-top: 3px; }
    .detail-description { color: #666; line-height: 1.6; }
    .sticky-purchase { position: fixed; z-index: 20; right: 0; bottom: 0; left: 0; padding: 10px max(16px, calc((100vw - 1180px) / 2)); border-top: 1px solid #ddd; background: rgba(255,255,255,.96); box-shadow: 0 -4px 16px rgba(0,0,0,.08); }
    .sticky-purchase-inner { display: flex; gap: 10px; }
    .detail-quantity { display: flex; align-items: center; justify-content: space-between; max-width: 170px; margin: 0 0 12px auto; padding: 4px; border: 1px solid #d5d5d5; border-radius: 10px; }
    .detail-quantity button { width: 34px; height: 34px; border: 0; border-radius: 7px; color: #222; background: #f5f5f5; font-size: 18px; }
    .detail-quantity input { width: 46px; border: 0; outline: 0; color: #222; background: transparent; text-align: center; font-weight: 700; }
    .sticky-purchase button { min-height: 54px; flex: 1; border-radius: 14px; font-size: 18px; font-weight: 700; }
    .add-cart-button { border: 1px solid #d5d5d5; color: #222; background: #fff; }
    .buy-button { border: 1px solid #ffd700; color: #222; background: #ffd916; }
    @media (min-width: 768px) {
        .product-detail-shell { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
        .detail-gallery { min-height: 540px; }
        .detail-gallery-main { position: sticky; top: 12px; height: 540px; }
        .detail-copy { padding-top: 44px; }
    }
    @media (max-width: 575.98px) {
        .detail-gallery { display: block; padding: 8px; }
        .detail-gallery-main { height: 68vw; min-height: 260px; }
        .detail-gallery-thumbs { flex-direction: row; max-height: none; overflow-x: auto; overflow-y: hidden; padding: 8px 2px 2px; }
        .detail-gallery-thumb { flex-basis: 64px; width: 64px; height: 64px; }
        .detail-copy { padding: 18px 16px 0; }
        .detail-title { font-size: 23px; }
        .detail-section-heading { font-size: 23px; }
        .highlight-item { font-size: 17px; }
    }
</style>
@endpush

@section('content')
<div class="product-detail-page">
    <div class="product-detail-shell">
        <div class="detail-gallery">
            @php($galleryImages = $product->images->sortByDesc('is_primary')->values())
            @if($galleryImages->isNotEmpty())
                <img src="{{ asset('storage/' . ltrim($galleryImages->first()->image_path, '/')) }}" alt="{{ $product->name }}" class="detail-gallery-main" data-gallery-main>
                @if($galleryImages->count() > 1)
                    <span class="gallery-count"><i class="fas fa-images me-1"></i>{{ $galleryImages->count() }}</span>
                @endif
                <div class="detail-gallery-thumbs" aria-label="Product images">
                    @foreach($galleryImages as $image)
                        <button type="button" class="detail-gallery-thumb {{ $loop->first ? 'is-active' : '' }}" data-gallery-image="{{ asset('storage/' . ltrim($image->image_path, '/')) }}" aria-label="View product image {{ $loop->iteration }}">
                            <img src="{{ asset('storage/' . ltrim($image->image_path, '/')) }}" alt="{{ $product->name }} image {{ $loop->iteration }}">
                        </button>
                    @endforeach
                </div>
            @else
                <img src="{{ $product->image_url }}" alt="{{ $product->name }}" class="detail-gallery-main">
            @endif
        </div>

        <div class="detail-copy">
            @if($product->brand)<div class="detail-brand">{{ $product->brand->name }}</div>@endif
            <h1 class="detail-title">{{ $product->name }}</h1>
            <div class="detail-rating"><i class="fas fa-star"></i> {{ number_format($product->rating, 1) }} <span class="text-muted">({{ $product->total_reviews }} ratings)</span></div>
            <div class="detail-price">Rs. {{ number_format($product->price, 0) }}</div>
            @if($product->hasDiscount())
                <span class="detail-mrp">Rs. {{ number_format($product->compare_price, 0) }}</span><span class="detail-discount">{{ $product->discount_percentage }}% off</span>
            @endif

            <div class="detail-panel delivery">
                <div class="detail-panel-row"><i class="fas fa-location-dot"></i><strong>Location not set <span class="location-link">Select delivery location ›</span></strong></div>
            </div>
            <div class="detail-panel">
                <div class="detail-panel-row"><i class="fas fa-truck"></i><strong>Delivery by {{ $deliveryDate }}</strong></div>
                <small>Order in 00h 25m 53s</small>
            </div>
            <div class="seller-panel">
                <div class="detail-panel-row"><i class="fas fa-store"></i><strong>Fulfilled by {{ $product->seller->store_name }}</strong></div>
                <p>{{ number_format($product->seller->rating, 1) }} ★ · {{ $product->seller->total_reviews }} reviews</p>
                <a class="d-inline-block ms-4 mt-1" href="#">See other sellers</a>
            </div>

            <div class="detail-benefits">
                <div class="benefit"><div class="benefit-icon"><i class="fas fa-box-open"></i></div>10-Day<br>Return</div>
                <div class="benefit"><div class="benefit-icon"><i class="fas fa-indian-rupee-sign"></i></div>Cash on<br>Delivery</div>
                <div class="benefit"><div class="benefit-icon"><strong>24×7</strong></div>Customer<br>support</div>
            </div>

            <section class="detail-section">
                <h2 class="detail-section-heading">Product highlights <button class="section-toggle" type="button" aria-label="Collapse highlights"><i class="fas fa-chevron-up"></i></button></h2>
                <div class="highlight-grid">
                    @forelse($specifications as $specification)
                        <div class="highlight-item"><strong>{{ $specification->name }}</strong><span>{{ $specification->value }}</span></div>
                    @empty
                        <div class="highlight-item"><strong>Availability</strong><span>{{ $product->isInStock() ? 'In stock' : 'Out of stock' }}</span></div>
                        <div class="highlight-item"><strong>Product type</strong><span>{{ $product->product_type ?: 'Everyday essential' }}</span></div>
                        @foreach(array_slice($highlights, 0, 2) as $highlight)
                            <div class="highlight-item"><span>{{ is_array($highlight) ? implode(': ', $highlight) : $highlight }}</span></div>
                        @endforeach
                    @endforelse
                </div>
            </section>

            <section class="detail-section">
                <h2 class="detail-section-heading mb-1">All details <button class="section-toggle" type="button" aria-label="Expand details"><i class="fas fa-chevron-down"></i></button></h2>
                <p class="mb-0 text-muted">Features, description and more</p>
                <div class="detail-description mt-3">{!! $product->description !!}</div>
            </section>

            @if($product->videos->isNotEmpty())
                <section class="detail-section">
                    <h2 class="detail-section-heading">Product videos</h2>
                    <div class="row g-3">
                        @foreach($product->videos as $video)
                            <div class="col-md-6">
                                @if($video->video_path)
                                    <video src="{{ $video->video_url }}" controls class="w-100 rounded" style="max-height:320px"></video>
                                @elseif($video->embed_url)
                                    <div class="ratio ratio-16x9"><iframe src="{{ $video->embed_url }}" title="Product video" allowfullscreen loading="lazy"></iframe></div>
                                @endif
                            </div>
                        @endforeach
                    </div>
                </section>
            @endif
        </div>
    </div>
</div>

@push('scripts')
<script>
document.querySelectorAll('[data-gallery-image]').forEach(function (thumbnail) {
    thumbnail.addEventListener('click', function () {
        const mainImage = document.querySelector('[data-gallery-main]');
        if (!mainImage) return;

        mainImage.src = this.dataset.galleryImage;
        document.querySelectorAll('[data-gallery-image]').forEach(function (item) {
            item.classList.toggle('is-active', item === thumbnail);
        });
    });
});
</script>
@endpush

<div class="sticky-purchase">
    <div class="sticky-purchase-inner">
        <div class="detail-quantity quantity-control" aria-label="Quantity">
            <button type="button" class="decrease-qty" aria-label="Decrease quantity">−</button>
            <input type="number" id="quantity" value="1" min="1" max="{{ min(10, max(1, $product->stock_quantity)) }}" aria-label="Quantity">
            <button type="button" class="increase-qty" aria-label="Increase quantity">+</button>
        </div>
        <button type="button" class="add-cart-button add-to-cart" data-product-id="{{ $product->id }}" data-cart-add-url="{{ route('customer.cart.add') }}">Add to cart</button>
        <button type="button" class="buy-button add-to-cart" data-product-id="{{ $product->id }}" data-cart-add-url="{{ route('customer.cart.add') }}" data-buy-now="true" data-buy-url="{{ route('customer.checkout.index') }}">Buy at Rs. {{ number_format($product->price, 0) }}</button>
    </div>
</div>
@endsection
