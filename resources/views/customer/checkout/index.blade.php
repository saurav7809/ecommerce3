@extends('layouts.app')

@section('title', __('messages.checkout'))

@section('content')
<div class="container py-4">
    <h4 class="mb-4">{{ __('messages.checkout') }}</h4>

    <form method="POST" action="{{ route('customer.checkout.process') }}">
        @csrf

        <div class="row">
            <div class="col-12 mb-4">
                <div class="card">
                    <div class="card-header fw-bold">
                        <i class="fas fa-credit-card me-2"></i>{{ __('messages.payment_method') }}
                    </div>
                    <div class="card-body">
                        @php
                            $paymentMethods = [
                                'cod'        => ['name' => __('messages.payment_cod'),   'desc' => __('messages.payment_desc_cod'),   'logo' => 'cod.svg'],
                                'esewa'      => ['name' => __('messages.payment_esewa'), 'desc' => __('messages.payment_desc_wallet', ['wallet' => __('messages.payment_esewa')]), 'logo' => 'esewa.png'],
                                'khalti'     => ['name' => __('messages.payment_khalti'),'desc' => __('messages.payment_desc_wallet', ['wallet' => __('messages.payment_khalti')]), 'logo' => 'khalti.svg'],
                                'visa'       => ['name' => __('messages.payment_visa'),  'desc' => __('messages.payment_desc_card'), 'logo' => 'visa.svg'],
                                'mastercard' => ['name' => __('messages.payment_mastercard'), 'desc' => __('messages.payment_desc_card'), 'logo' => 'mastercard.svg'],
                            ];
                        @endphp
                        <div class="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-3">
                            @foreach($paymentMethods as $value => $method)
                                <div class="col">
                                    <label class="payment-option" for="pm-{{ $value }}">
                                        <input type="radio" name="payment_method" id="pm-{{ $value }}"
                                               value="{{ $value }}" @if($loop->first) checked required @endif>
                                        <span class="payment-check"><i class="fas fa-check"></i></span>
                                        <img src="{{ asset('images/payments/' . $method['logo']) }}"
                                             alt="{{ $method['name'] }}" class="payment-logo">
                                        <span class="payment-name">{{ $method['name'] }}</span>
                                        <span class="payment-desc">{{ $method['desc'] }}</span>
                                    </label>
                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-8 mb-4">
                <div class="card h-100">
                    <div class="card-header fw-bold">
                        <i class="fas fa-map-marker-alt me-2"></i>{{ __('messages.delivery_address') }}
                    </div>
                    <div class="card-body">
                        <div class="checkout-detected-location" data-location-widget>
                            <div class="checkout-detected-location-heading">
                                <i class="fas fa-location-dot" aria-hidden="true"></i>
                                <div>
                                    <strong>Delivery location</strong>
                                    <p data-location-checkout-value>Use your current location to check nearby delivery availability.</p>
                                </div>
                            </div>
                            <button type="button" class="location-detect-button" data-detect-location>
                                <i class="fas fa-location-crosshairs" aria-hidden="true"></i>
                                <span data-location-action-label>Use my current location</span>
                            </button>
                            <span class="delivery-location-status" data-location-status role="status" aria-live="polite"></span>
                        </div>
                        @if($addresses->isEmpty())
                            <div class="alert alert-warning mb-0">
                                {{ __('messages.no_addresses') }}
                            </div>
                        @else
                            @foreach($addresses as $address)
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="radio" name="address_id" id="address{{ $address->id }}" value="{{ $address->id }}"
                                           @if($defaultAddress && $defaultAddress->id === $address->id) checked @endif required>
                                    <label class="form-check-label" for="address{{ $address->id }}">
                                        <strong>{{ $address->label ? $address->label . ' - ' : '' }}{{ $address->full_name }}</strong><br>
                                        {{ $address->full_address }}
                                        @if($address->is_default)
                                            <span class="badge bg-primary ms-1">{{ __('messages.default_badge') }}</span>
                                        @endif
                                    </label>
                                </div>
                            @endforeach
                        @endif
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="card mb-4">
                    <div class="card-header fw-bold">
                        <i class="fas fa-cash-register me-2"></i>{{ __('messages.summary_str') }}
                    </div>
                    <div class="card-body">
                        <p class="small text-muted mb-0">
                            {{ __('messages.review_items') }}
                            <a href="{{ route('customer.cart.index') }}">{{ __('messages.cart_link') }}</a>
                            .
                        </p>
                    </div>
                </div>
                <button type="submit" class="btn btn-success w-100 btn-lg">
                    <i class="fas fa-check-circle me-2"></i>{{ __('messages.place_order') }}
                </button>
            </div>
        </div>
    </form>
</div>
@endsection