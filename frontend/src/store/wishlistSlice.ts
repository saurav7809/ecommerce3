import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductSummary } from '../types';

interface WishlistState {
  items: ProductSummary[];
}

const STORAGE_KEY = 'homenest_wishlist';

const loadWishlist = (): ProductSummary[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
};

const saveWishlist = (items: ProductSummary[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
};

const initialState: WishlistState = {
  items: loadWishlist(),
};

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<ProductSummary>) => {
      const exists = state.items.some((i) => i.id === action.payload.id);
      if (exists) {
        state.items = state.items.filter((i) => i.id !== action.payload.id);
      } else {
        state.items.push(action.payload);
      }
      saveWishlist(state.items);
    },
    removeFromWishlist: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      saveWishlist(state.items);
    },
  },
});

export const { toggleWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
