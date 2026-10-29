<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Services\CartService;
use Illuminate\Http\Request;

class CartController extends Controller
{
    protected $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
        $this->middleware('auth')->except(['add']);
    }

    public function index()
    {
        $cart = $this->cartService->getUserCart(auth()->id());
        $cartItems = $cart ? $cart->items()->with(['product', 'productVariant', 'seller'])->get() : collect();
        $cartSummary = $this->cartService->calculateCartSummary($cart);

        return view('customer.cart.index', compact('cartItems', 'cartSummary'));
    }

    public function add(Request $request)
    {
        if (!auth()->check()) {
            $redirectAfterRegistration = $request->input('redirect_after_auth', url()->previous());
            $redirectHost = is_string($redirectAfterRegistration)
                ? parse_url($redirectAfterRegistration, PHP_URL_HOST)
                : null;

            if (is_string($redirectAfterRegistration)
                && ($redirectHost === null || $redirectHost === $request->getHost())) {
                $request->session()->put('url.intended', $redirectAfterRegistration);
            }

            return response()->json([
                'success' => false,
                'message' => 'Please register to add items to your cart.',
                'redirect_to' => route('register'),
            ], 401);
        }

        $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1|max:10',
        ]);

        $product = Product::findOrFail($request->product_id);
        
        if (!$product->is_active || !$product->is_approved) {
            return response()->json([
                'success' => false,
                'message' => 'Product is not available.'
            ], 400);
        }

        if ($product->stock_quantity < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Not enough stock available.'
            ], 400);
        }

        $cart = $this->cartService->getOrCreateCart(auth()->id());

        $this->cartService->addItem($cart, [
            'product_id' => $request->product_id,
            'variant_id' => $request->variant_id,
            'quantity' => $request->quantity,
            'seller_id' => $product->seller_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product added to cart successfully.',
            'cart_count' => $this->cartService->getCartCount(auth()->id()),
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1|max:10',
        ]);

        $cartItem = CartItem::findOrFail($id);
        
        if ($cartItem->cart->customer_id != auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.'
            ], 403);
        }

        $this->cartService->updateItemQuantity($cartItem, $request->quantity);

        $cart = $this->cartService->getUserCart(auth()->id());
        $summary = $this->cartService->calculateCartSummary($cart);

        return response()->json([
            'success' => true,
            'message' => 'Cart updated successfully.',
            'summary' => $summary,
        ]);
    }

    public function remove($id)
    {
        $cartItem = CartItem::findOrFail($id);
        
        if ($cartItem->cart->customer_id != auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.'
            ], 403);
        }

        $cartItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart.',
            'cart_count' => $this->cartService->getCartCount(auth()->id()),
        ]);
    }

    public function getCartCount()
    {
        return response()->json([
            'count' => $this->cartService->getCartCount(auth()->id()),
        ]);
    }
}