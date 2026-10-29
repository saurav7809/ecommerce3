import './bootstrap';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function setupScrollExperience() {
    const progressBar = document.querySelector('.scroll-progress span');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) return;

    document.documentElement.classList.add('scroll-motion-ready');

    const lenis = new Lenis({
        duration: 1.15,
        easing: (value) => 1 - Math.pow(1 - value, 4),
        smoothWheel: true,
        syncTouch: false,
    });

    lenis.on('scroll', ({ progress }) => {
        if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
        ScrollTrigger.update();
    });

    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    const revealTargets = document.querySelectorAll([
        '.reveal-on-scroll',
        '.hero-section',
        '.category-tile',
        '.mobile-brand-card',
        '.clothing-card',
        '.electronics-card',
        '.beauty-card',
        '.home-card',
        '.appliance-card',
        '.kids-card',
        '.grocery-card',
        '.auto-accessories-card',
        '.sports-card',
        '.furniture-card',
        '.books-card',
        '.two-wheeler-brand-card',
        '.product-card',
        '.detail-section',
        '.auth-card'
    ].join(', '));

    revealTargets.forEach((element, index) => {
        gsap.to(element, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.75,
            delay: element.matches('.category-tile, .product-card, [class$="-card"]') ? (index % 6) * 0.045 : 0,
            ease: 'power3.out',
            overwrite: 'auto',
            scrollTrigger: {
                trigger: element,
                start: 'top 88%',
                once: true,
            },
        });
    });

    document.querySelectorAll('[data-scroll-parallax]').forEach((element) => {
        const speed = Number(element.dataset.scrollParallax) || 0.12;
        gsap.to(element, {
            yPercent: speed * -100,
            ease: 'none',
            scrollTrigger: {
                trigger: element,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            },
        });
    });

    ScrollTrigger.refresh();
}

// Cart functionality
document.addEventListener('DOMContentLoaded', function() {
    setupScrollExperience();
    const locationStorageKey = 'sumit_delivery_location';
    const locationWidgets = document.querySelectorAll('[data-location-widget]');

    function showLocationNotification(type, message) {
        showNotification(type, message);
    }

    function setLocationLoading(isLoading) {
        document.querySelectorAll('[data-detect-location]').forEach(function(button) {
            button.disabled = isLoading;
            button.classList.toggle('is-loading', isLoading);
            const label = button.querySelector('[data-location-action-label]');
            if (label) label.textContent = isLoading ? 'Detecting location...' : 'Use my current location';
        });
        document.querySelectorAll('[data-location-status]').forEach(function(status) {
            status.textContent = isLoading ? 'Detecting location...' : '';
        });
    }

    function renderStoredLocation(location) {
        document.querySelectorAll('[data-location-input]').forEach(function(input) {
            input.value = location.label || '';
        });
        document.querySelectorAll('[data-location-checkout-value]').forEach(function(value) {
            value.textContent = location.label || 'Location detected';
        });
        document.querySelectorAll('[data-location-action-label]').forEach(function(label) {
            label.textContent = location.city ? `${location.city}, change location` : 'Change location';
        });
    }

    function saveAndRenderLocation(address) {
        const location = {
            label: address.label,
            city: address.city || address.town || address.village || '',
            region: address.region || address.state || '',
            postcode: address.postcode || ''
        };
        localStorage.setItem(locationStorageKey, JSON.stringify(location));
        renderStoredLocation(location);
        const shortLocation = (location.city || location.label).replace(/[<>]/g, '');
        showLocationNotification('success', `Location detected: ${shortLocation}`);
    }

    async function detectLocation() {
        if (!navigator.geolocation) {
            showLocationNotification('warning', 'Location is not supported. Please enter it manually.');
            return;
        }
        if (!window.isSecureContext && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
            showLocationNotification('warning', 'Location detection requires HTTPS. Please enter it manually.');
            return;
        }

        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(async function(position) {
            try {
                const { latitude, longitude } = position.coords;
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=18&addressdetails=1`, {
                    headers: { Accept: 'application/json' }
                });
                if (!response.ok) throw new Error('Reverse geocoding failed');
                const data = await response.json();
                const address = data.address || {};
                const city = address.city || address.town || address.village || address.municipality || '';
                const region = address.state || address.region || '';
                const parts = [address.road, address.neighbourhood || address.suburb, city, region, address.postcode].filter(Boolean);
                if (!parts.length) throw new Error('No readable address');
                saveAndRenderLocation({ label: parts.join(', '), city, region, postcode: address.postcode || '' });
            } catch (error) {
                showLocationNotification('danger', "Couldn't resolve your address - please enter manually.");
            } finally {
                setLocationLoading(false);
            }
        }, function(error) {
            setLocationLoading(false);
            const message = error.code === error.PERMISSION_DENIED
                ? 'Location access denied. Please enter your address manually.'
                : "Couldn't detect location - please enter manually.";
            showLocationNotification('warning', message);
        }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
    }

    if (locationWidgets.length) {
        try {
            const storedLocation = JSON.parse(localStorage.getItem(locationStorageKey));
            if (storedLocation && storedLocation.label) renderStoredLocation(storedLocation);
        } catch (error) {
            localStorage.removeItem(locationStorageKey);
        }

        document.querySelectorAll('[data-detect-location]').forEach(function(button) {
            button.addEventListener('click', detectLocation);
        });
        document.querySelectorAll('[data-location-input]').forEach(function(input) {
            input.addEventListener('change', function() {
                const value = input.value.trim();
                if (!value) return;
                saveAndRenderLocation({ label: value, city: '', region: '', postcode: '' });
            });
        });
    }

    // Keep the appliance rail indicator aligned with horizontal scrolling.
    document.querySelectorAll('[data-appliances-scroll]').forEach(function(scroll) {
        const section = scroll.closest('.appliances-section');
        const pill = section.querySelector('.appliances-progress-pill');
        const dots = section.querySelectorAll('.appliances-progress-dot');

        function updateApplianceProgress() {
            const maximum = scroll.scrollWidth - scroll.clientWidth;
            const progress = maximum > 0 ? scroll.scrollLeft / maximum : 0;
            const track = pill.parentElement;
            const travel = track.clientWidth - pill.clientWidth;
            const activeDot = Math.round(progress * (dots.length - 1));

            pill.style.transform = `translateX(${travel * progress}px)`;
            dots.forEach((dot, index) => dot.classList.toggle('is-active', index === activeDot));
        }

        scroll.addEventListener('scroll', updateApplianceProgress, { passive: true });
        window.addEventListener('resize', updateApplianceProgress);
        updateApplianceProgress();
    });

    // Update cart count
    function updateCartCount() {
        fetch('/customer/cart/count', { headers: { 'Accept': 'application/json' } })
            .then(response => {
                // The cart endpoint requires login; visitors just get count 0.
                if (!response.ok) return { count: 0 };
                return response.json();
            })
            .then(data => {
                if (data && typeof data.count !== 'undefined') {
                    document.querySelectorAll('.cart-count').forEach(el => {
                        el.textContent = data.count;
                        el.parentElement.querySelector('i').style.display = 'inline-block';
                    });
                }
            })
            .catch(error => console.error('Error updating cart count:', error));
    }

    // Add to cart functionality
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.dataset.productId;
            const quantityInput = this.closest('.product-detail-page')?.querySelector('#quantity')
                || document.querySelector('#quantity');
            const quantity = quantityInput?.value || this.dataset.quantity || 1;
            const addUrl = this.dataset.cartAddUrl || '/customer/cart/add';
            const redirectAfterAuth = this.dataset.buyNow === 'true'
                ? (this.dataset.buyUrl || '/customer/checkout')
                : window.location.href;

            this.disabled = true;

            fetch(addUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: quantity,
                    redirect_after_auth: redirectAfterAuth
                })
            })
            .then(async response => {
                const data = await response.json().catch(() => ({}));

                if (response.status === 401 && data.redirect_to) {
                    window.location.assign(data.redirect_to);
                    throw Object.assign(new Error(data.message || 'Please register to continue.'), { redirect_to: data.redirect_to });
                }

                if (!response.ok) throw new Error(data.message || 'Unable to add this product to your cart.');
                return data;
            })
            .then(data => {
                if (data.success) {
                    updateCartCount();
                    if (this.dataset.buyNow === 'true') {
                        window.location.assign(this.dataset.buyUrl || '/customer/checkout');
                        return;
                    }
                    showNotification('success', data.message);
                } else {
                    throw new Error(data.message || 'Unable to add this product to your cart.');
                }
            })
            .catch(error => {
                if (error.redirect_to) return;
                showNotification('danger', error.message || 'An error occurred. Please try again.');
            })
            .finally(() => {
                this.disabled = false;
            });
        });
    });

    // Quantity controls
    document.querySelectorAll('.quantity-control').forEach(control => {
        const input = control.querySelector('input');
        const decreaseBtn = control.querySelector('.decrease-qty');
        const increaseBtn = control.querySelector('.increase-qty');

        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', function() {
                let value = parseInt(input.value);
                if (value > parseInt(input.min)) {
                    input.value = value - 1;
                    input.dispatchEvent(new Event('change'));
                }
            });
        }

        if (increaseBtn) {
            increaseBtn.addEventListener('click', function() {
                let value = parseInt(input.value);
                if (value < parseInt(input.max)) {
                    input.value = value + 1;
                    input.dispatchEvent(new Event('change'));
                }
            });
        }
    });

    // Notification function
    function showNotification(type, message) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        alert.style.zIndex = '1050';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 5000);
    }
});