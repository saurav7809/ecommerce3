@extends('layouts.app')

@section('title', __('messages.register'))

@section('content')
<div class="auth-page" style="--auth-background: url('{{ asset('images/mountan.jpg') }}');">
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card auth-card shadow">
                <div class="card-header fw-bold text-center">{{ __('messages.join') }} <span class="text-white">SUMIT</span></div>
                <div class="card-body">
                    <form method="POST" action="{{ route('register') }}">
                        @csrf
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="first_name" class="form-label">{{ __('messages.first_name') }}</label>
                                <input type="text" class="form-control @error('first_name') is-invalid @enderror" id="first_name" name="first_name" value="{{ old('first_name') }}" required autofocus>
                                @error('first_name')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="last_name" class="form-label">{{ __('messages.last_name') }}</label>
                                <input type="text" class="form-control @error('last_name') is-invalid @enderror" id="last_name" name="last_name" value="{{ old('last_name') }}" required>
                                @error('last_name')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="email" class="form-label">{{ __('messages.email_address') }}</label>
                            <input type="email" class="form-control @error('email') is-invalid @enderror" id="email" name="email" value="{{ old('email') }}" required>
                            @error('email')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        <div class="mb-3">
                            <label for="phone" class="form-label">{{ __('messages.phone_optional') }}</label>
                            <input type="text" class="form-control @error('phone') is-invalid @enderror" id="phone" name="phone" value="{{ old('phone') }}">
                            @error('phone')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="password" class="form-label">{{ __('messages.password') }}</label>
                                <input type="password" class="form-control @error('password') is-invalid @enderror" id="password" name="password" required>
                                @error('password')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="password_confirmation" class="form-label">{{ __('messages.confirm_password') }}</label>
                                <input type="password" class="form-control" id="password_confirmation" name="password_confirmation" required>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">{{ __('messages.register_btn') }}</button>
                    </form>
                </div>
                <div class="card-footer text-center bg-white">
                    {{ __('messages.have_account') }} <a href="{{ route('login') }}">{{ __('messages.login_link') }}</a>
                </div>
            </div>
        </div>
    </div>
</div>
</div>
@endsection