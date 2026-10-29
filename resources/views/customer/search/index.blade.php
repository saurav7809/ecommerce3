@extends('layouts.app')

@section('title', __('messages.search'))

@section('content')
<div class="container py-4">
    <h4 class="mb-3">{{ __('messages.search_results', ['query' => $query]) }}</h4>

    @if($products->isEmpty())
        <div class="alert alert-info">{{ __('messages.no_search_results') }}</div>
    @else
        <div class="row">
            @foreach($products as $product)
            <div class="col-lg-3 col-md-4 col-6 mb-4">
                <div class="card h-100">
                    <a href="{{ route('product.show', $product->slug) }}">
                        <img src="{{ $product->image_url }}" class="card-img-top" alt="{{ $product->name }}" style="height:180px; object-fit:cover;">
                    </a>
                    <div class="card-body">
                        <h6 class="card-title text-truncate">{{ $product->name }}</h6>
                        <div class="fw-bold text-danger">Rs. {{ number_format($product->price, 2) }}</div>
                        <a href="{{ route('product.show', $product->slug) }}" class="btn btn-sm btn-primary w-100 mt-2">{{ __('messages.view_product') }}</a>
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
@endsection