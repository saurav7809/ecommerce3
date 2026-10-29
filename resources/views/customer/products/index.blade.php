@extends('layouts.app')

@section('title', __('messages.products'))

@section('content')
<div class="container py-4">
    <div class="row">
        <!-- Filters sidebar -->
        <div class="col-lg-3 mb-4">
            <div class="card shadow-sm">
                <div class="card-header fw-bold">{{ __('messages.filters') }}</div>
                <div class="card-body">
                    <form method="GET" action="{{ route('products.index') }}">
                        <div class="mb-3">
                            <label class="form-label">{{ __('messages.category') }}</label>
                            <select name="category" class="form-select">
                                <option value="">{{ __('messages.all_categories') }}</option>
                                @foreach($categories as $category)
                                    <option value="{{ $category->id }}" @selected(request('category') == $category->id)>{{ $category->name }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">{{ __('messages.brand') }}</label>
                            <select name="brand" class="form-select">
                                <option value="">{{ __('messages.all_brands') }}</option>
                                @foreach($brands as $brand)
                                    <option value="{{ $brand->id }}" @selected(request('brand') == $brand->id)>{{ $brand->name }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="row g-2 mb-3">
                            <div class="col-6">
                                <label class="form-label">{{ __('messages.min_price') }}</label>
                                <input type="number" name="min_price" class="form-control" placeholder="0" value="{{ request('min_price') }}">
                            </div>
                            <div class="col-6">
                                <label class="form-label">{{ __('messages.max_price') }}</label>
                                <input type="number" name="max_price" class="form-control" placeholder="1000" value="{{ request('max_price') }}">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">{{ __('messages.sort_by') }}</label>
                            <select name="sort" class="form-select">
                                <option value="">{{ __('messages.default') }}</option>
                                <option value="popular" @selected(request('sort') === 'popular')>{{ __('messages.most_popular') }}</option>
                                <option value="price_low" @selected(request('sort') === 'price_low')>{{ __('messages.price_low_to_high') }}</option>
                                <option value="price_high" @selected(request('sort') === 'price_high')>{{ __('messages.price_high_to_low') }}</option>
                                <option value="newest" @selected(request('sort') === 'newest')>{{ __('messages.newest_first') }}</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">{{ __('messages.apply_filters') }}</button>
                    </form>
                </div>
            </div>
        </div>

        <!-- Product grid -->
        <div class="col-lg-9">
            <h4 class="section-heading">{{ __('messages.products') }}</h4>
            @if($products->isEmpty())
                <div class="alert alert-info">{{ __('messages.no_products_found') }}</div>
            @else
                <div class="row row-cols-lg-3 row-cols-md-2 row-cols-2 g-3">
                    @foreach($products as $product)
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
                                <div class="small text-muted mb-2">
                                    <i class="fas fa-star star-rating"></i> {{ number_format($product->rating, 1) }} ({{ $product->total_reviews }})
                                </div>
                                @if($product->hasDiscount())
                                    <div class="fw-bold text-brand fs-5">Rs. {{ number_format($product->price, 2) }} <span class="text-muted text-decoration-line-through fs-6">Rs. {{ number_format($product->compare_price, 2) }}</span></div>
                                @else
                                    <div class="fw-bold text-brand fs-5">Rs. {{ number_format($product->price, 2) }}</div>
                                @endif
                                <a href="{{ route('product.show', $product->slug) }}" class="btn btn-sm bg-brand text-white w-100 mt-2">{{ __('messages.view_product') }}</a>
                            </div>
                        </div>
                    </div>
                    @endforeach
                </div>
                <div class="d-flex justify-content-center mt-3">
                    {{ $products->links() }}
                </div>
            @endif
        </div>
    </div>
</div>
@endsection