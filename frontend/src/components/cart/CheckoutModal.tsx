// ─── Checkout Modal ───────────────────────────────────────────────────────────

import { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { createOrder, startPayment, verifyPayment } from '../../api/client';
import { money } from '../../lib/utils';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (reference: string) => void;
}

export default function CheckoutModal({ open, onClose, onSuccess }: CheckoutModalProps) {
  const { lines, subtotal, clearCart } = useCartStore();
  const { account } = useAuthStore();
  const count = lines.reduce((a, l) => a + l.quantity, 0);

  const [fullName, setFullName] = useState(account?.name ?? '');
  const [email, setEmail] = useState(account?.email ?? '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create the order in the backend
      const order = await createOrder({
        email,
        fullName,
        deliveryAddress,
        items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
      });

      // 2. Try Razorpay payment flow
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;
      if (keyId && window.Razorpay) {
        const paymentOrder = await startPayment(order.reference);
        const rz = new window.Razorpay({
          key: paymentOrder.keyId,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          name: 'Common Goods',
          description: `Order ${order.reference}`,
          order_id: paymentOrder.id,
          prefill: { name: fullName, email },
          theme: { color: '#1c1917' },
          handler: async (resp) => {
            await verifyPayment({
              reference: order.reference,
              razorpayOrderId: resp.razorpay_order_id,
              razorpayPaymentId: resp.razorpay_payment_id,
              razorpaySignature: resp.razorpay_signature,
            });
            clearCart();
            onSuccess(order.reference);
          },
        });
        rz.on('payment.failed', (resp) => {
          setError(resp.error?.description ?? 'Payment failed. Please try again.');
          setLoading(false);
        });
        rz.open();
      } else {
        // No Razorpay key — order placed, payment pending
        clearCart();
        onSuccess(order.reference);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      <form
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-5"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs tracking-widest uppercase text-stone-400">Almost yours</p>
            <h2 className="text-xl font-semibold text-stone-900 mt-0.5">Checkout</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 -mr-2 hover:bg-stone-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-stone-500">
          Your things are ready for a new home. Add your delivery details to complete this order.
        </p>

        {/* Fields */}
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-stone-600">Full name</span>
            <input
              required
              maxLength={150}
              placeholder="First and last name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-stone-500 transition-colors"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-stone-600">Email address</span>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-stone-500 transition-colors"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-stone-600">Delivery address</span>
            <input
              required
              maxLength={500}
              placeholder="Street, city, postal code"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-stone-500 transition-colors"
            />
          </label>
        </div>

        {/* Summary */}
        <div className="flex justify-between items-center bg-stone-50 rounded-xl px-4 py-3">
          <span className="text-sm text-stone-600">{count} item{count !== 1 ? 's' : ''}</span>
          <span className="text-sm font-semibold text-stone-900">{money(subtotal())}</span>
        </div>

        {/* Payment note */}
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
          Razorpay test mode — payment will not be charged
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl py-3.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          {loading ? 'Processing…' : <>Place order <ArrowRight size={16} /></>}
        </button>
        <p className="text-xs text-center text-stone-400">
          Payment setup is required before any charge can be taken.
        </p>
      </form>
    </div>
  );
}

