import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { closeCartDrawer, updateQuantity, removeFromCart } from '../../store/cartSlice';
import { formatCurrency } from '../../lib/utils';

const FREE_SHIPPING_THRESHOLD = 5000;

export default function CartDrawer() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, isDrawerOpen } = useAppSelector((state) => state.cart);

  if (!isDrawerOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleCheckout = () => {
    dispatch(closeCartDrawer());
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => dispatch(closeCartDrawer())}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#7b189f]" />
              <h2 className="text-base font-bold text-gray-900">Your Home Cart</h2>
              <span className="text-xs text-gray-500">
                ({items.reduce((sum, i) => sum + i.quantity, 0)} items)
              </span>
            </div>
            <button
              onClick={() => dispatch(closeCartDrawer())}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-purple-50 p-3 border-b border-purple-100">
            <div className="flex items-center justify-between text-xs font-semibold text-[#7b189f] mb-1.5">
              <span className="flex items-center space-x-1">
                <Truck className="w-4 h-4 text-[#c68a0c]" />
                {isFreeShipping ? (
                  <span className="font-bold text-emerald-700">🎉 Congratulations! You unlocked Free Shipping!</span>
                ) : (
                  <span>Add {formatCurrency(remainingForFree)} more for <strong>FREE Door Delivery</strong></span>
                )}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-purple-200/60 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isFreeShipping ? 'bg-emerald-600' : 'bg-[#7b189f]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Line Items List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-50 text-[#7b189f] flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-1">Your cart is empty</h3>
                <p className="text-xs text-gray-500 mb-6">Explore our curated sofas, rugs, and decor to fill your space.</p>
                <button
                  onClick={() => dispatch(closeCartDrawer())}
                  className="px-6 py-2.5 rounded-full bg-[#7b189f] text-white text-xs font-bold hover:bg-[#581172] transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div key={product.id} className="py-4 flex space-x-3.5 first:pt-0">
                  <img
                    src={product.primaryImage || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=200&q=80'}
                    alt={product.name}
                    className="w-20 h-20 rounded-lg object-cover bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          to={`/product/${product.slug}`}
                          onClick={() => dispatch(closeCartDrawer())}
                          className="text-xs font-bold text-gray-900 hover:text-[#7b189f] line-clamp-2"
                        >
                          {product.name}
                        </Link>
                        <button
                          onClick={() => dispatch(removeFromCart(product.id))}
                          className="text-gray-400 hover:text-rose-600 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">{product.brand}</p>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded-md">
                        <button
                          onClick={() => dispatch(updateQuantity({ productId: product.id, quantity: quantity - 1 }))}
                          className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-2.5 text-xs font-bold text-gray-800">{quantity}</span>
                        <button
                          onClick={() => dispatch(updateQuantity({ productId: product.id, quantity: quantity + 1 }))}
                          className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>

                      {/* Total */}
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-gray-900">
                          {formatCurrency(product.price * quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50/70 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Shipping</span>
                  <span className={`font-semibold ${isFreeShipping ? 'text-emerald-700' : 'text-gray-900'}`}>
                    {isFreeShipping ? 'FREE' : formatCurrency(299)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-base text-[#7b189f]">
                    {formatCurrency(subtotal + (isFreeShipping ? 0 : 299))}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 px-4 rounded-xl bg-[#7b189f] hover:bg-[#581172] text-white text-sm font-bold flex items-center justify-center space-x-2 transition-colors shadow-md"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-center text-gray-400">
                🔒 Secure 256-Bit SSL Checkout • Razorpay Test Mode & COD
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
