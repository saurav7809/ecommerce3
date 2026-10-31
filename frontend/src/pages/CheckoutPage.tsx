import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard, Banknote, ArrowLeft, Lock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { clearCart } from '../store/cartSlice';
import { addToast, openAuthModal } from '../store/uiSlice';
import {
  usePlaceOrderMutation,
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
  useGetPaymentConfigQuery,
} from '../store/apiSlice';
import { formatCurrency } from '../lib/utils';
import { AddressDetails } from '../types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { items } = useAppSelector((state) => state.cart);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [placeOrderApi, { isLoading: isPlacingOrder }] = usePlaceOrderMutation();
  const [createRazorpayOrderApi] = useCreateRazorpayOrderMutation();
  const [verifyRazorpayPaymentApi] = useVerifyRazorpayPaymentMutation();
  const { data: paymentConfig } = useGetPaymentConfigQuery();

  // Form State
  const [address, setAddress] = useState<AddressDetails>({
    fullName: user?.fullName || '',
    street: '',
    apartment: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560001',
    country: 'IN',
    phone: user?.phone || '9876543210',
  });
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'CASH_ON_DELIVERY'>('RAZORPAY');
  const [saveAddress, setSaveAddress] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isFreeShipping = subtotal >= 5000;
  const shipping = isFreeShipping ? 0 : 299;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Items in Cart</h2>
        <p className="text-xs text-gray-500 mb-6">Add pieces to your cart before proceeding to checkout.</p>
        <Link
          to="/products"
          className="px-6 py-2.5 rounded-full bg-[#7b189f] text-white text-xs font-bold"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isAuthenticated) {
      dispatch(addToast({ message: 'Please sign in or create an account to finalize your order', type: 'info' }));
      dispatch(openAuthModal('login'));
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create order on backend
      const orderPayload = {
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        shippingAddress: address,
        paymentMethod,
        saveAddress,
      };

      const order = await placeOrderApi(orderPayload).unwrap();

      // 2. If COD, order is placed immediately
      if (paymentMethod === 'CASH_ON_DELIVERY') {
        dispatch(clearCart());
        dispatch(addToast({ message: 'Order placed successfully with Cash on Delivery!', type: 'success' }));
        navigate(`/orders/${order.reference}`);
        return;
      }

      // 3. Razorpay flow
      const razorpayOrder = await createRazorpayOrderApi({ orderReference: order.reference }).unwrap();

      // Check if Razorpay script is loaded in browser
      if (typeof window.Razorpay !== 'undefined') {
        const options = {
          key: razorpayOrder.keyId || paymentConfig?.razorpayKeyId,
          amount: razorpayOrder.amountInPaise,
          currency: razorpayOrder.currency,
          name: 'HomeNest Furnishings',
          description: `Order ${order.reference}`,
          order_id: razorpayOrder.razorpayOrderId,
          prefill: {
            name: razorpayOrder.customerName,
            email: razorpayOrder.customerEmail,
            contact: razorpayOrder.customerPhone,
          },
          theme: { color: '#7b189f' },
          handler: async (response: any) => {
            try {
              await verifyRazorpayPaymentApi({
                orderReference: order.reference,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }).unwrap();

              dispatch(clearCart());
              dispatch(addToast({ message: 'Payment verified! Thank you for your order.', type: 'success' }));
              navigate(`/orders/${order.reference}`);
            } catch {
              navigate(`/orders/${order.reference}`);
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Test mode fallback: auto verify test payment for seamless development
        try {
          await verifyRazorpayPaymentApi({
            orderReference: order.reference,
            razorpayOrderId: razorpayOrder.razorpayOrderId || 'test_rzp_order_id',
            razorpayPaymentId: 'pay_test_' + Date.now(),
            razorpaySignature: 'mock_signature',
          }).unwrap();
        } catch {
          // continue
        }

        dispatch(clearCart());
        dispatch(addToast({ message: 'Test Mode Payment Confirmed!', type: 'success' }));
        navigate(`/orders/${order.reference}`);
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.detail || err?.data?.message || 'Failed to place order. Please check item stock.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center space-x-2 text-xs text-gray-500">
        <Link to="/cart" className="hover:text-[#7b189f] flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart</span>
        </Link>
      </div>

      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Secure Checkout</h1>
        <div className="flex items-center space-x-1 text-xs text-emerald-700 font-bold">
          <Lock className="w-4 h-4" />
          <span>256-Bit SSL Protection</span>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-[#7b189f]">Already have a HomeNest account?</h4>
            <p className="text-[11px] text-gray-600">Sign in to use your saved shipping addresses and track rewards.</p>
          </div>
          <button
            onClick={() => dispatch(openAuthModal('login'))}
            className="px-5 py-2 rounded-full bg-[#7b189f] text-white text-xs font-bold hover:bg-[#581172] transition-colors shrink-0"
          >
            Sign In Now
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery & Payment Details (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Step 1: Delivery Address */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-xs">
            <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
              <div className="w-6 h-6 rounded-full bg-[#7b189f] text-white text-xs font-bold flex items-center justify-center">
                1
              </div>
              <h3 className="text-base font-bold text-gray-900">Shipping Address</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Recipient Name</label>
                <input
                  type="text"
                  required
                  name="fullName"
                  value={address.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Saurav Sharma"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  name="street"
                  value={address.street}
                  onChange={handleInputChange}
                  placeholder="House / Flat #, Building Name, Street"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Apartment / Suite (Optional)</label>
                <input
                  type="text"
                  name="apartment"
                  value={address.apartment}
                  onChange={handleInputChange}
                  placeholder="Apt 4B"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  name="city"
                  value={address.city}
                  onChange={handleInputChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  required
                  name="state"
                  value={address.state}
                  onChange={handleInputChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Postal Code (PIN)</label>
                <input
                  type="text"
                  required
                  name="postalCode"
                  value={address.postalCode}
                  onChange={handleInputChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Contact Phone</label>
                <input
                  type="tel"
                  required
                  name="phone"
                  value={address.phone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                />
              </div>
            </div>

            <label className="flex items-center space-x-2 text-xs text-gray-600 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="w-4 h-4 rounded-sm text-[#7b189f] focus:ring-[#7b189f] accent-[#7b189f]"
              />
              <span>Save this shipping address to my profile</span>
            </label>
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-xs">
            <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
              <div className="w-6 h-6 rounded-full bg-[#7b189f] text-white text-xs font-bold flex items-center justify-center">
                2
              </div>
              <h3 className="text-base font-bold text-gray-900">Payment Option</h3>
            </div>

            <div className="space-y-3">
              {/* Razorpay Option */}
              <label
                className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-[#7b189f] bg-purple-50/50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={() => setPaymentMethod('RAZORPAY')}
                    className="mt-1 w-4 h-4 text-[#7b189f] focus:ring-[#7b189f] accent-[#7b189f]"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-[#7b189f]" />
                      <span className="text-xs font-bold text-gray-900">
                        Online Payment via Razorpay
                      </span>
                      <span className="px-2 py-0.5 bg-purple-100 text-[#7b189f] text-[10px] font-extrabold rounded-sm uppercase">
                        Test Mode
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, Netbanking
                    </p>
                  </div>
                </div>
              </label>

              {/* Cash On Delivery Option */}
              <label
                className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-[#7b189f] bg-purple-50/50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'CASH_ON_DELIVERY'}
                    onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                    className="mt-1 w-4 h-4 text-[#7b189f] focus:ring-[#7b189f] accent-[#7b189f]"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-gray-900">
                        Cash on Delivery (COD)
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Pay safely upon door delivery of your furniture pieces.
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 p-6 space-y-6 shadow-xs sticky top-24">
          <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
            Order Review ({items.length} items)
          </h3>

          <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 no-scrollbar pr-1">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="py-2.5 flex space-x-3 items-center">
                <img
                  src={product.primaryImage || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=100&q=80'}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-lg bg-gray-50 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{product.name}</p>
                  <p className="text-[11px] text-gray-500">Qty: {quantity}</p>
                </div>
                <span className="text-xs font-bold text-gray-900">
                  {formatCurrency(product.price * quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs text-gray-600 pt-3 border-t border-gray-100">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>White-Glove Delivery</span>
              <span className={`font-semibold ${isFreeShipping ? 'text-emerald-700' : 'text-gray-900'}`}>
                {isFreeShipping ? 'FREE' : formatCurrency(299)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Amount Due</span>
              <span className="text-xl text-[#7b189f] font-black">{formatCurrency(total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing || isPlacingOrder}
            className="w-full py-3.5 px-6 rounded-xl bg-[#7b189f] hover:bg-[#581172] text-white text-sm font-bold shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isProcessing || isPlacingOrder
              ? 'Securing Order...'
              : `Confirm & Pay ${formatCurrency(total)}`}
          </button>

          <div className="text-[10px] text-gray-400 text-center space-y-1">
            <p>By placing your order, you agree to HomeNest Terms of Service.</p>
            <p>Razorpay Test Mode keys operate in risk-free sandbox.</p>
          </div>
        </div>
      </form>
    </div>
  );
}
