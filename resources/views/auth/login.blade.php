@extends('layouts.app')

@section('title', __('messages.login'))

@section('content')
<div class="auth-page" style="--auth-background: url('{{ asset('images/mountan.jpg') }}');">
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-5">
            <div class="card auth-card shadow">
                <div class="card-header fw-bold text-center h4">{{ __('messages.welcome_back') }} <span class="text-white">SUMIT</span></div>
                <div class="card-body">
                    <form method="POST" action="{{ route('login') }}">
                        @csrf
                        <div class="mb-3">
                            <label for="email" class="form-label">{{ __('messages.email_address') }}</label>
                            <input type="email" class="form-control @error('email') is-invalid @enderror" id="email" name="email" value="{{ old('email') }}" required autofocus>
                            @error('email')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">{{ __('messages.password') }}</label>
                            <input type="password" class="form-control @error('password') is-invalid @enderror" id="password" name="password" required>
                            @error('password')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" id="remember" name="remember">
                            <label class="form-check-label" for="remember">{{ __('messages.remember_me') }}</label>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">{{ __('messages.login_btn') }}</button>
                    </form>
                </div>
                <div class="card-footer text-center bg-white">
                    {{ __('messages.no_account') }} <a href="{{ route('register') }}">{{ __('messages.register_link') }}</a>
                </div>
            </div>
        </div>
    </div>
</div>
</div>
@endsection