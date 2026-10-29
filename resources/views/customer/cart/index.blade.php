@extends('layouts.app')

@section('title', __('messages.shopping_cart'))

@section('content')
<div class="container py-4">
    <h4 class="mb-4">{{ __('messages.shopping_cart') }}</h4>

    @if($cartItems->isEmpty())
        <div class="alert alert-info">
            {{ __('messages.cart_empty') }} <a href="{{ route('products.index') }}" class="alert-link">{{ __('messages.browse_products') }}</a>
        </div>
    @else
        <div class="row">
            <div class="col-lg-8 mb-4">
                <div class="table-responsive">
                    <table class="table align-middle">
                        <thead>
                            <tr>
                                <th>{{ __('messages.product') }}</th>
                                <th>{{ __('messages.unit_price') }}</th>
                                <th>{{ __('messages.quantity_head') }}</th>
                                <th>{{ __('messages.total') }}</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($cartItems as $item)
                            <tr>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img src="{{ $item->product->image_url }}" width="60" height="60" class="rounded me-2" alt="{{ $item->product->name }}" style="object-fit:cover;">
                                        <div>
                                            <div class="fw-semibold">{{ $item->product->name }}</div>
                                            <small class="text-muted">{{ $item->seller->store_name ?? '' }}</small>
                                        </div>
                                    </div>
                                </td>
                                <td>Rs. {{ number_format($item->unit_price, 2) }}</td>
                                <td style="min-width:140px;">
                                    <div class="d-flex align-items-center">
                                        <button class="btn btn-outline-secondary btn-sm decrease-qty" data-id="{{ $item->id }}">-</button>
                                        <input type="number" class="form-control mx-2 cart-qty-input text-center" value="{{ $item->quantity }}" min="1" max="10" data-id="{{ $item->id }}" style="width:70px;">
                                        <button class="btn btn-outline-secondary btn-sm increase-qty" data-id="{{ $item->id }}">+</button>
                                    </div>
                                </td>
                                <td class="fw-bold">Rs. {{ number_format($item->total_price, 2) }}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-danger remove-item" data-id="{{ $item->id }}" title="{{ __('messages.remove_str') }}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="card">
                    <div class="card-header fw-bold">{{ __('messages.order_summary') }}</div>
                    <div class="card-body">
                        <div class="d-flex justify-content-between mb-1">
                            <span>{{ __('messages.subtotal') }}</span><span>Rs. {{ number_format($cartSummary['subtotal'], 2) }}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-1">
                            <span>{{ __('messages.discount') }}</span><span>-Rs. {{ number_format($cartSummary['discount'], 2) }}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-1">
                            <span>{{ __('messages.tax_vat') }}</span><span>Rs. {{ number_format($cartSummary['tax'], 2) }}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-1">
                            <span>{{ __('messages.shipping') }}</span><span>{{ $cartSummary['shipping'] > 0 ? 'Rs. ' . number_format($cartSummary['shipping'], 2) : __('messages.free') }}</span>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between fw-bold">
                            <span>{{ __('messages.total_amount') }}</span><span>Rs. {{ number_format($cartSummary['total'], 2) }}</span>
                        </div>
                        <a href="{{ route('customer.checkout.index') }}" class="btn btn-success w-100 mt-3">{{ __('messages.proceed_checkout') }}</a>
                        <a href="{{ route('products.index') }}" class="btn btn-outline-secondary w-100 mt-2">{{ __('messages.continue_shopping') }}</a>
                    </div>
                </div>
            </div>
        </div>
    @endif
</div>
@endsection

@section('scripts')
<script>
document.addEventListener('DOMContentLoaded', function () {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

    function updateQuantity(id, quantity) {
        fetch('/customer/cart/update/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({ quantity: quantity })
        })
        .then(response => response.json())
        .then(data => { if (data.success) window.location.reload(); })
        .catch(() => window.location.reload());
    }

    document.querySelectorAll('.cart-qty-input').forEach(function (input) {
        input.addEventListener('change', function () {
            let value = parseInt(this.value) || 1;
            let max = parseInt(this.max);
            if (value > max) value = max;
            if (value < 1) value = 1;
            this.value = value;
            updateQuantity(this.dataset.id, value);
        });
    });

    document.querySelectorAll('.decrease-qty').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const input = document.querySelector('.cart-qty-input[data-id="' + this.dataset.id + '"]');
            let value = parseInt(input.value) - 1;
            if (value < 1) return;
            input.value = value;
            updateQuantity(this.dataset.id, value);
        });
    });

    document.querySelectorAll('.increase-qty').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const input = document.querySelector('.cart-qty-input[data-id="' + this.dataset.id + '"]');
            let value = parseInt(input.value) + 1;
            if (value > parseInt(input.max)) return;
            input.value = value;
            updateQuantity(this.dataset.id, value);
        });
    });

    document.querySelectorAll('.remove-item').forEach(function (btn) {
        btn.addEventListener('click', function () {
            fetch('/customer/cart/remove/' + this.dataset.id, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                }
            })
            .then(response => response.json())
            .then(data => { if (data.success) window.location.reload(); });
        });
    });
});
</script>
@endsection