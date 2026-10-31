import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { updateQuantity, removeFromCart, clearCart } from '../store/cartSlice';
import { formatCurrency } from '../lib/utils';

const FREE_SHIPPING_THRESHOLD = 5000;

export default function CartPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items } = useAppSelector((state) => state.cart);

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const compareTotal = items.reduce(
    (acc, item) => acc + (item.product.compareAtPrice || item.product.price) * item.quantity,
    0
  );
  const savings = Math.max(0, compareTotal - subtotal);
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = items.length === 0 ? 0 : isFreeShipping ? 0 : 299;
  const orderTotal = subtotal + shippingCost;
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-50 text-[#7b189f] flex items-center justify-center">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Home Cart is Empty</h1>
        <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
          Discover our curated collection of mid-century sofas, plush rugs, and handcrafted dining sets.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-full bg-[#7b189f] hover:bg-[#581172] text-white text-sm font-bold shadow-md transition-colors"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          Shopping Cart ({items.reduce((s, i) => s + i.quantity, 0)})
        </h1>
        <button
          onClick={() => dispatch(clearCart())}
          className="text-xs text-rose-600 font-bold hover:underline"
        >
          Clear Cart
        </button>
      </div>

      {/* Free Shipping Progress Strip */}
      <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-white text-[#7b189f] rounded-xl shadow-xs">
            <Truck className="w-5 h-5 text-[#c68a0c]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#7b189f]">
              {isFreeShipping
                ? '🎉 You qualify for FREE White-Glove Door Shipping!'
                : `Add ${formatCurrency(remainingForFree)} more to unlock FREE Shipping`}
            </h4>
            <p className="text-[11px] text-gray-500">Everyday free shipping on orders over ₹5,000</p>
          </div>
        </div>
        <div className="w-full sm:w-48">
          <div className="w-full h-2.5 bg-purple-200/60 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isFreeShipping ? 'bg-emerald-600' : 'bg-[#7b189f]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Layout: Items Table (8 cols) + Summary Card (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Line Items List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 p-6 divide-y divide-gray-100 shadow-xs">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4">
              <img
                src={product.primaryImage || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=250&q=80'}
                alt={product.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover bg-gray-50 shrink-0 border border-gray-100"
              />

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        {product.brand}
                      </p>
                      <Link
                        to={`/product/${product.slug}`}
                        className="text-sm sm:text-base font-bold text-gray-900 hover:text-[#7b189f] transition-colors"
                      >
                        {product.name}
                      </Link>
                    </div>
                    <button
                      onClick={() => dispatch(removeFromCart(product.id))}
                      className="text-gray-400 hover:text-rose-600 p-1.5 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                    {product.color && <span>Color: <strong>{product.color}</strong></span>}
                    {product.material && <span>Material: <strong>{product.material}</strong></span>}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                    <button
                      onClick={() => dispatch(updateQuantity({ productId: product.id, quantity: quantity - 1 }))}
                      className="px-2.5 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-gray-800">{quantity}</span>
                    <button
                      onClick={() => dispatch(updateQuantity({ productId: product.id, quantity: quantity + 1 }))}
                      className="px-2.5 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-gray-900">
                      {formatCurrency(product.price * quantity)}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <p className="text-[11px] text-gray-400 line-through">
                        {formatCurrency(product.compareAtPrice * quantity)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 p-6 space-y-6 shadow-xs sticky top-24">
          <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
            Order Summary
          </h3>

          <div className="space-y-2.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
            </div>

            {savings > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Promotional Savings</span>
                <span>-{formatCurrency(savings)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span className={`font-semibold ${isFreeShipping ? 'text-emerald-700' : 'text-gray-900'}`}>
                {isFreeShipping ? 'FREE' : formatCurrency(299)}
              </span>
            </div>

            <div className="flex justify-between text-sm font-bold text-gray-900 pt-3 border-t border-gray-100">
              <span>Estimated Total</span>
              <span className="text-xl text-[#7b189f] font-black">{formatCurrency(orderTotal)}</span>
            </div>
            <p className="text-[10px] text-gray-400">Includes all applicable GST and duties</p>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 px-6 rounded-xl bg-[#7b189f] hover:bg-[#581172] text-white text-sm font-bold flex items-center justify-center space-x-2 transition-transform hover:-translate-y-0.5 shadow-lg"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="space-y-2 pt-4 border-t border-gray-100 text-[11px] text-gray-500">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#7b189f]" />
              <span>Safe & Secure SSL Encrypted Checkout</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-[#7b189f]" />
              <span>30-Day Hassle-Free In-Home Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
