// ─── My Orders Page ───────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import { fetchMyOrders } from '../api/client';
import { useAuthStore } from '../store/authStore';
import type { Order } from '../types';
import { money } from '../lib/utils';

const STATUS_COLOR: Record<string, string> = {
  PLACED:     'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-amber-100 text-amber-700',
  SHIPPED:    'bg-purple-100 text-purple-700',
  DELIVERED:  'bg-green-100 text-green-700',
  CANCELLED:  'bg-red-100 text-red-700',
};

const PAYMENT_COLOR: Record<string, string> = {
  PENDING:   'text-stone-400',
  CAPTURED:  'text-green-600',
  FAILED:    'text-red-500',
};

export default function OrdersPage() {
  const { account, isLoggedIn } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) { setLoading(false); return; }
    fetchMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [account]);

  if (!isLoggedIn()) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <Package size={40} className="text-stone-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-stone-900 mb-2">Sign in to see your orders</h2>
        <p className="text-stone-500 text-sm mb-6">
          Your order history will appear here once you're signed in.
        </p>
        <Link
          to="/"
          className="bg-stone-900 text-white rounded-xl px-6 py-3 text-sm font-medium hover:bg-stone-800 transition-colors inline-flex items-center gap-2"
        >
          Back to shopping <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-stone-900">My Orders</h1>
        <p className="text-stone-500 text-sm mt-1">Signed in as {account?.email}</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-stone-50 rounded-2xl p-6 h-24" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={36} className="text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500 font-medium">No orders yet</p>
          <p className="text-stone-400 text-sm mt-1">Start shopping to see your orders here.</p>
          <Link
            to="/products"
            className="mt-5 inline-flex items-center gap-2 bg-stone-900 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-stone-800 transition-colors"
          >
            Browse products <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.reference}
              className="bg-white border border-stone-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-sm font-semibold text-stone-900">
                    {order.reference}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${STATUS_COLOR[order.status] ?? 'bg-stone-100 text-stone-600'}`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className={`text-xs mt-1 font-medium ${PAYMENT_COLOR[order.paymentStatus] ?? 'text-stone-400'}`}>
                  Payment: {order.paymentStatus}
                </p>
              </div>
              <div className="text-right sm:text-right">
                <p className="text-lg font-semibold text-stone-900">{money(order.subtotal)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

