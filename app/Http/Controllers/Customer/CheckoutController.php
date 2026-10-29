<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Services\CheckoutService;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    protected $checkoutService;

    public function __construct(CheckoutService $checkoutService)
    {
        $this->checkoutService = $checkoutService;
        $this->middleware('auth')->except(['index', 'process']);
    }

    public function index()
    {
        if (!auth()->check()) {
            request()->session()->put('url.intended', route('customer.checkout.index'));

            return redirect()->route('register')
                ->with('error', 'Please register to continue to checkout.');
        }

        $cart = auth()->user()->cart;
        if (!$cart || $cart->items()->count() === 0) {
            return redirect()->route('customer.cart.index')
                ->with('error', 'Your cart is empty.');
        }

        $addresses = auth()->user()->addresses;
        $defaultAddress = $addresses->where('is_default', true)->first();

        return view('customer.checkout.index', compact('addresses', 'defaultAddress'));
    }

    public function process(Request $request)
    {
        if (!auth()->check()) {
            $request->session()->put('url.intended', route('customer.checkout.index'));

            return redirect()->route('register')
                ->with('error', 'Please register to continue to checkout.');
        }

        $request->validate([
            'address_id' => 'required|exists:addresses,id',
            'payment_method' => 'required|in:cod,esewa,khalti,visa,mastercard',
        ]);

        try {
            $result = $this->checkoutService->processCheckout(
                auth()->id(),
                $request->address_id,
                $request->payment_method,
                $request->all()
            );

            // Non-COD payments are processed (simulated) by the PaymentService
            // during checkout, so we route every successful order to the
            // success page.
            return redirect()->route('customer.checkout.success', ['id' => $result['order']->id])
                ->with('success', 'Order placed successfully!');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    public function success($id)
    {
        $order = auth()->user()->orders()->findOrFail($id);
        return view('customer.checkout.success', compact('order'));
    }

    public function failure($id)
    {
        $order = auth()->user()->orders()->findOrFail($id);
        return view('customer.checkout.failure', compact('order'));
    }
}