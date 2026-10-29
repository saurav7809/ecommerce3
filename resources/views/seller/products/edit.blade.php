@extends('layouts.app')

@section('title', 'Edit Product')

@section('content')
<div class="container py-4">
    <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4"><div><p class="text-uppercase small text-primary fw-bold mb-1">Seller catalog / edit</p><h1 class="h3 mb-1">{{ $product->name }}</h1><p class="text-muted mb-0">Status: <strong>{{ ucfirst($product->status) }}</strong></p></div><form method="POST" action="{{ route('seller.products.destroy', $product) }}" onsubmit="return confirm('Move this product to the recycle bin?')">@csrf @method('DELETE')<button class="btn btn-outline-danger"><i class="fas fa-trash me-2"></i>Delete</button></form></div>
    <form method="POST" action="{{ route('seller.products.update', $product) }}" enctype="multipart/form-data">
        @csrf @method('PUT')
        @include('seller.products._form')
    </form>
</div>
@endsection
