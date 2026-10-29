@extends('layouts.app')

@section('title', __('messages.order_failed'))

@section('content')
<div class="container py-5 text-center">
    <i class="fas fa-times-circle text-danger" style="font-size:5rem;"></i>
    <h2 class="mt-3">{{ __('messages.order_not_placed') }}</h2>
    <p class="text-muted">{{ __('messages.order_failure_msg', ['order' => $order->order_number]) }}</p>
    <a href="{{ route('customer.checkout.index') }}" class="btn btn-primary">{{ __('messages.try_again') }}</a>
</div>
@endsection