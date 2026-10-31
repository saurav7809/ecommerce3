import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Truck, Clock, MapPin, ArrowRight, Printer } from 'lucide-react';
import { useGetOrderByReferenceQuery } from '../store/apiSlice';
import { formatCurrency, formatEstimatedDelivery } from '../lib/utils';

export default function OrderConfirmationPage() {
  const { reference } = useParams<{ reference: string }>();
  const { data: order, isLoading, isError } = useGetOrderByReferenceQuery(reference || '');

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-pulse space-y-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto" />
        <div className="h-6 bg-gray-200 rounded-sm w-1/2 mx-auto" />
        <div className="h-4 bg-gray-200 rounded-sm w-1/3 mx-auto" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-800">Order Reference Not Found</h2>
        <p className="text-xs text-gray-500 mt-2">Could not retrieve order details for #{reference}.</p>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-2 rounded-full bg-[#7b189f] text-white text-xs font-bold"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const isConfirmed = order.status !== 'CANCELLED';
  const steps = [
    { label: 'Placed', done: true },
    { label: 'Confirmed', done: order.status !== 'PENDING_PAYMENT' },
    { label: 'Shipped', done: order.status === 'SHIPPED' || order.status === 'DELIVERED' },
    { label: 'Delivered', done: order.status === 'DELIVERED' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Success Hero */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-purple-50 rounded-3xl p-8 border border-emerald-100 text-center space-y-3 shadow-xs">
        <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          Thank you for your order!
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
          We've reserved your pieces and dispatched your order confirmation to{' '}
          <strong className="text-gray-900">{order.email}</strong>.
        </p>

        <div className="inline-block px-4 py-1.5 bg-white rounded-full border border-gray-200 text-xs font-mono font-bold text-[#7b189f] shadow-2xs">
          Order Reference: #{order.reference}
        </div>
      </div>

      {/* Tracking Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-[#7b189f]" />
            <h3 className="text-sm font-bold text-gray-900">Order & Delivery Progress</h3>
          </div>
          <span className="text-xs text-gray-500">
            Est. Arrival: <strong>{formatEstimatedDelivery(2, 5)}</strong>
          </span>
        </div>

        {/* Stepper bar */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-colors ${
                  step.done ? 'bg-[#7b189f] text-white shadow-xs' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step.done ? '✓' : idx + 1}
              </div>
              <span className={`text-[11px] font-bold ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Delivery Info + Order Items */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Shipping Address & Payment Card (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 shadow-xs">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
              <MapPin className="w-4 h-4 text-[#7b189f]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Delivery Address</h4>
            </div>
            <div className="text-xs text-gray-600 leading-relaxed">
              <p className="font-bold text-gray-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              {order.shippingAddress.apartment && <p>{order.shippingAddress.apartment}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
              </p>
              <p className="mt-1 text-gray-500">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 pb-2 border-b border-gray-100">
              Payment Details
            </h4>
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-semibold text-gray-900">{order.paymentMethod.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="font-bold text-emerald-700 uppercase">{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total Paid:</span>
                <span className="text-base text-[#7b189f] font-black">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Summary (7 cols) */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Ordered Pieces ({order.items.length})
            </h4>
            <button
              onClick={() => window.print()}
              className="text-xs text-[#7b189f] font-semibold hover:underline flex items-center space-x-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between space-x-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={item.primaryImage || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=100&q=80'}
                    alt={item.productName}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{item.productName}</p>
                    <p className="text-[11px] text-gray-500">
                      Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-900 whitespace-nowrap">
                  {formatCurrency(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 text-xs text-gray-600 space-y-1.5">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-gray-900">
                {order.shipping === 0 ? 'FREE' : formatCurrency(order.shipping)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Home CTA */}
      <div className="text-center pt-4">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-8 py-3 rounded-full bg-[#7b189f] hover:bg-[#581172] text-white text-xs font-bold shadow-md transition-colors"
        >
          <span>Continue Shopping HomeNest</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
