import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductSummary, CartLineItem } from '../types';

interface CartState {
  items: CartLineItem[];
  isDrawerOpen: boolean;
}

const STORAGE_KEY = 'homenest_cart';

const loadInitialCart = (): CartLineItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [];
};

const saveCart = (items: CartLineItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
};

const initialState: CartState = {
  items: loadInitialCart(),
  isDrawerOpen: false,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{ product: ProductSummary; quantity?: number; openDrawer?: boolean }>
    ) => {
      const { product, quantity = 1, openDrawer = true } = action.payload;
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        existing.quantity = Math.min(20, existing.quantity + quantity);
      } else {
        state.items.push({ product, quantity: Math.min(20, quantity) });
      }
      if (openDrawer) {
        state.isDrawerOpen = true;
      }
      saveCart(state.items);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: number; quantity: number }>
    ) => {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.product.id !== productId);
      } else {
        const item = state.items.find((i) => i.product.id === productId);
        if (item) {
          item.quantity = Math.min(20, quantity);
        }
      }
      saveCart(state.items);
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.product.id !== action.payload);
      saveCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCart(state.items);
    },
    openCartDrawer: (state) => {
      state.isDrawerOpen = true;
    },
    closeCartDrawer: (state) => {
      state.isDrawerOpen = false;
    },
    toggleCartDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  openCartDrawer,
  closeCartDrawer,
  toggleCartDrawer,
} = cartSlice.actions;

export default cartSlice.reducer;
