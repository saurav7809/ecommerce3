import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Clock, Ban } from 'lucide-react';
import { useGetMyOrdersQuery, useCancelOrderMutation } from '../store/apiSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { openAuthModal, addToast } from '../store/uiSlice';
import { formatCurrency } from '../lib/utils';
import { OrderStatus } from '../types';

const STATUS_BADGE: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  PENDING_PAYMENT: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Payment Pending' },
  CONFIRMED: { bg: 'bg-purple-100', text: 'text-[#7b189f]', label: 'Confirmed' },
  PROCESSING: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Production' },
  SHIPPED: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Out for Delivery' },
  DELIVERED: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Delivered' },
  CANCELLED: { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Cancelled' },
};

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: ordersData, isLoading, isError } = useGetMyOrdersQuery({ size: 20 }, { skip: !isAuthenticated });
  const [cancelOrderApi] = useCancelOrderMutation();

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-purple-50 text-[#7b189f] rounded-full flex items-center justify-center mx-auto">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Sign in to View Your Orders</h2>
        <p className="text-xs text-gray-500">Track shipments, view receipts, and review your home purchases.</p>
        <button
          onClick={() => dispatch(openAuthModal('login'))}
          className="px-6 py-2.5 rounded-full bg-[#7b189f] text-white text-xs font-bold hover:bg-[#581172] transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded-sm w-1/4" />
        <div className="h-32 bg-gray-200 rounded-2xl" />
        <div className="h-32 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  const orders = ordersData?.content || [];

  const handleCancelOrder = async (reference: string) => {
    if (!window.confirm(`Are you sure you want to cancel order #${reference}?`)) return;
    try {
      await cancelOrderApi(reference).unwrap();
      dispatch(addToast({ message: `Order #${reference} cancelled.`, type: 'info' }));
    } catch (err: any) {
      dispatch(addToast({ message: err?.data?.detail || 'Could not cancel order.', type: 'error' }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">My Orders</h1>
        <p className="text-xs text-gray-500 mt-1">Review past shipments, receipts, and order statuses</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">You haven't placed any orders yet</h3>
          <p className="text-xs text-gray-500 mt-1 mb-6">Explore our curated collections to furnish your home.</p>
          <Link
            to="/products"
            className="px-6 py-2.5 rounded-full bg-[#7b189f] text-white text-xs font-bold hover:bg-[#581172]"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const badge = STATUS_BADGE[order.status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: order.status };
            const canCancel = order.status === 'CONFIRMED' || order.status === 'PENDING_PAYMENT';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4"
              >
                {/* Header bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-bold text-[#7b189f]">
                      #{order.reference}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{order.createdAt?.split('T')[0]}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${badge.bg} ${badge.text}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="divide-y divide-gray-50">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3 min-w-0">
                        <img
                          src={item.primaryImage || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=80&q=80'}
                          alt={item.productName}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{item.productName}</p>
                          <p className="text-[11px] text-gray-400">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900 ml-4">{formatCurrency(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                {/* Footer bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-gray-100 gap-3">
                  <div className="text-xs text-gray-500">
                    <span>Total Amount: </span>
                    <strong className="text-sm font-bold text-gray-900">{formatCurrency(order.total)}</strong>
                    <span className="ml-2 text-[11px] text-gray-400">({order.paymentMethod.replace('_', ' ')})</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(order.reference)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Cancel Order</span>
                      </button>
                    )}
                    <Link
                      to={`/orders/${order.reference}`}
                      className="px-4 py-1.5 text-xs font-bold text-[#7b189f] bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <span>Track Shipment</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
