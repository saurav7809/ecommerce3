@extends('layouts.app')

@section('title', __('messages.order_placed'))

@section('content')
<div class="container py-5 text-center">
    <i class="fas fa-check-circle text-success" style="font-size:5rem;"></i>
    <h2 class="mt-3">{{ __('messages.thank_you') }}</h2>
    <p class="text-muted">{{ __('messages.order_success_msg', ['order' => $order->order_number]) }}</p>

    @if($order->payment_method)
        <div class="d-inline-flex align-items-center gap-2 border rounded-pill px-3 py-2 bg-white shadow-sm mt-1 mb-3">
            @if($order->payment_method_logo)
                <img src="{{ $order->payment_method_logo }}" alt="{{ $order->payment_method_text }}" style="height:26px;width:auto;">
            @else
                <i class="fas fa-credit-card text-brand"></i>
            @endif
            <span class="fw-semibold">{{ $order->payment_method_text }}</span>
        </div>
    @endif

    <p class="text-muted">{{ __('messages.we_will_contact') }}</p>
    <a href="{{ route('products.index') }}" class="btn btn-primary">{{ __('messages.continue_shopping') }}</a>
</div>
@endsection