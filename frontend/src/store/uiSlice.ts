import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UiState {
  toasts: ToastMessage[];
  isAiDrawerOpen: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  isMobileMenuOpen: boolean;
}

const initialState: UiState = {
  toasts: [],
  isAiDrawerOpen: false,
  isAuthModalOpen: false,
  authModalMode: 'login',
  isMobileMenuOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<{ type?: 'success' | 'error' | 'info'; message: string }>) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
      state.toasts.push({
        id,
        type: action.payload.type || 'info',
        message: action.payload.message,
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    openAiDrawer: (state) => {
      state.isAiDrawerOpen = true;
    },
    closeAiDrawer: (state) => {
      state.isAiDrawerOpen = false;
    },
    toggleAiDrawer: (state) => {
      state.isAiDrawerOpen = !state.isAiDrawerOpen;
    },
    openAuthModal: (state, action: PayloadAction<'login' | 'register' | undefined>) => {
      state.authModalMode = action.payload || 'login';
      state.isAuthModalOpen = true;
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },
  },
});

export const {
  addToast,
  removeToast,
  openAiDrawer,
  closeAiDrawer,
  toggleAiDrawer,
  openAuthModal,
  closeAuthModal,
  setMobileMenuOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
