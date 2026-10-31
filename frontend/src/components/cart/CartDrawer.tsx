// ─── Cart Drawer ─────────────────────────────────────────────────────────────

import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { money, imageUrl } from '../../lib/utils';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartDrawer({ open, onClose, onCheckout }: CartDrawerProps) {
  const { lines, updateQuantity, removeItem, subtotal } = useCartStore();
  const count = lines.reduce((a, l) => a + l.quantity, 0);
  const FREE_SHIPPING_THRESHOLD = 5000;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={onClose}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      <aside
        className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-stone-100">
          <div>
            <p className="text-xs tracking-widest uppercase text-stone-400">A few good things</p>
            <h2 className="text-xl font-semibold text-stone-900 mt-0.5">
              Your bag <span className="text-stone-400 font-normal">({count})</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 hover:bg-stone-100 rounded-lg transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lines */}
        {lines.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {lines.map((line) => (
                <div key={line.product.id} className="flex gap-4">
                  <img
                    src={imageUrl(line.product.imageUrl, 200)}
                    alt={line.product.name}
                    className="w-20 h-20 object-cover rounded-xl bg-stone-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-900 text-sm leading-snug">
                      {line.product.name}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5 truncate">{line.product.variant}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 border border-stone-200 rounded-lg px-1">
                        <button
                          aria-label="Remove one"
                          onClick={() => updateQuantity(line.product.id, -1)}
                          className="p-1 hover:bg-stone-50 rounded"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-medium w-5 text-center">
                          {line.quantity}
                        </span>
                        <button
                          aria-label="Add one"
                          onClick={() => updateQuantity(line.product.id, 1)}
                          className="p-1 hover:bg-stone-50 rounded"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-stone-900">
                        {money(line.product.price * line.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(line.product.id)}
                    className="p-1 h-fit hover:bg-stone-100 rounded text-stone-400 hover:text-stone-700 transition-colors"
                    aria-label="Remove item"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-stone-100 p-6 space-y-4">
              {/* Free shipping meter */}
              <div className="space-y-1.5">
                <p className="text-xs text-stone-500">
                  {subtotal() >= FREE_SHIPPING_THRESHOLD
                    ? '🎉 You\'ve unlocked free shipping!'
                    : `${money(FREE_SHIPPING_THRESHOLD - subtotal())} away from free shipping`}
                </p>
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-stone-900 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (subtotal() / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-600">Subtotal</span>
                <span className="text-base font-semibold text-stone-900">{money(subtotal())}</span>
              </div>
              <p className="text-xs text-stone-400">Shipping and taxes calculated at checkout.</p>

              <button
                onClick={onCheckout}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-xl py-3.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                Continue to checkout <ArrowRight size={16} />
              </button>
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors"
              >
                <ArrowLeft size={14} /> Keep looking
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center">
              <ShoppingBag size={24} className="text-stone-400" />
            </div>
            <h3 className="font-medium text-stone-900">Your bag feels a little light.</h3>
            <p className="text-sm text-stone-400">Let's find something that feels like you.</p>
            <button
              onClick={onClose}
              className="mt-2 border border-stone-300 hover:border-stone-500 text-stone-700 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors flex items-center gap-2"
            >
              Explore the collection <ArrowRight size={15} />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

