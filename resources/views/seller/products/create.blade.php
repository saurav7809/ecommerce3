@extends('layouts.app')

@section('title', 'Add Product')

@section('content')
<div class="container py-4">
    <div class="mb-4"><p class="text-uppercase small text-primary fw-bold mb-1">Seller catalog</p><h1 class="h3 mb-1">Add a product</h1><p class="text-muted mb-0">Build a complete listing. Save a draft at any point or submit it for review.</p></div>
    @php($product = (object) ['images' => collect(), 'variants' => collect(), 'specifications' => collect(), 'videos' => collect(), 'tags' => collect(), 'shipping' => (object) [], 'warranty' => (object) [], 'returnPolicy' => (object) [], 'tax' => (object) []])
    <form method="POST" action="{{ route('seller.products.store') }}" enctype="multipart/form-data">
        @csrf
        @include('seller.products._form')
    </form>
</div>
@endsection
