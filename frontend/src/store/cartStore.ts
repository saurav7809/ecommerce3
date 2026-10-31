// ─── Cart store (Zustand) ────────────────────────────────────────────────────
// Persists to localStorage automatically via the persist middleware.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartLine, Product } from '../types';

interface CartState {
  lines: CartLine[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, delta: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.lines.find((l) => l.product.id === product.id);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.product.id === product.id
                  ? { ...l, quantity: Math.min(l.quantity + quantity, product.inventory) }
                  : l,
              ),
            };
          }
          return { lines: [...state.lines, { product, quantity }] };
        });
      },

      removeItem: (productId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.product.id !== productId) })),

      updateQuantity: (productId, delta) =>
        set((state) => ({
          lines: state.lines
            .map((l) =>
              l.product.id === productId ? { ...l, quantity: l.quantity + delta } : l,
            )
            .filter((l) => l.quantity > 0),
        })),

      clearCart: () => set({ lines: [] }),

      totalItems: () => get().lines.reduce((acc, l) => acc + l.quantity, 0),

      subtotal: () =>
        get().lines.reduce((acc, l) => acc + l.product.price * l.quantity, 0),
    }),
    { name: 'cg.cart' },
  ),
);

