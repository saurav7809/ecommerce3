<footer class="footer text-white mt-5 py-4">
    <div class="container">
        <div class="row gy-3">
            <div class="col-md-4">
                <h5 class="text-uppercase">{{ __('messages.about') }}</h5>
                <p class="small text-muted-light mb-0" style="color:#cbd5e1;">{{ __('messages.about_text') }}</p>
            </div>
            <div class="col-md-4">
                <h5 class="text-uppercase">{{ __('messages.quick_links') }}</h5>
                <ul class="list-unstyled small mb-0">
                    <li><a href="{{ route('home') }}" class="text-decoration-none">{{ __('messages.home') }}</a></li>
                    <li><a href="{{ route('products.index') }}" class="text-decoration-none">{{ __('messages.products') }}</a></li>
                    <li><a href="{{ route('login') }}" class="text-decoration-none">{{ __('messages.login') }}</a></li>
                    <li><a href="{{ route('register') }}" class="text-decoration-none">{{ __('messages.register') }}</a></li>
                </ul>
            </div>
            <div class="col-md-4">
                <h5 class="text-uppercase">{{ __('messages.contact') }}</h5>
                <p class="small text-muted-light mb-0" style="color:#cbd5e1;">support@sumit.example</p>
                <p class="small text-muted-light mb-0" style="color:#cbd5e1;">+977-9800000000</p>
                <div class="social d-flex gap-2 mt-2">
                    <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                    <a href="#" aria-label="X"><i class="fab fa-x-twitter"></i></a>
                    <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
                </div>
            </div>
        </div>
        <hr class="border-secondary my-3">
        <div class="payment-methods pb-2">
            <div class="text-center mb-3">
                <h5 class="text-uppercase mb-1">{{ __('messages.we_accept') }}</h5>
                <p class="small mb-0" style="color:#94a3b8;">{{ __('messages.secure_payment') }}</p>
            </div>
            <div class="d-flex flex-wrap justify-content-center gap-2">
                <img src="{{ asset('images/payments/cod.svg') }}" alt="{{ __('messages.cash_on_delivery') }}" class="payment-badge" loading="lazy">
                <img src="{{ asset('images/payments/visa.svg') }}" alt="Visa" class="payment-badge" loading="lazy">
                <img src="{{ asset('images/payments/mastercard.svg') }}" alt="Mastercard" class="payment-badge" loading="lazy">
                <img src="{{ asset('images/payments/esewa.png') }}" alt="eSewa" class="payment-badge" loading="lazy">
                <img src="{{ asset('images/payments/khalti.svg') }}" alt="Khalti" class="payment-badge" loading="lazy">
            </div>
        </div>
        <hr class="border-secondary my-3">
        <p class="text-center small text-uppercase" style="color:#94a3b8;">{{ __('messages.all_rights_reserved', ['year' => date('Y')]) }}</p>
    </div>
</footer>