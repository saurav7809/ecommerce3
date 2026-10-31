// ─── Auth store (Zustand) ────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Account } from '../types';

interface AuthState {
  account: Account | null;
  setAccount: (account: Account | null) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      account: null,
      setAccount: (account) => set({ account }),
      logout: () => set({ account: null }),
      isLoggedIn: () => !!get().account,
    }),
    { name: 'cg.account' },
  ),
);

