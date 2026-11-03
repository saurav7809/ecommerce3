import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import AiAssistantDrawer from './components/ui/AiAssistantDrawer';
import AuthModal from './components/auth/AuthModal';
import ToastContainer from './components/ui/ToastContainer';

import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrdersPage from './pages/OrdersPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminPage from './pages/AdminPage';
import AccountPage from './pages/AccountPage';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top Wayfair-style Navigation */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<BrowsePage />} />
          <Route path="/category/:slug" element={<BrowsePage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:reference" element={<OrderConfirmationPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Wayfair Footer */}
      <Footer />

      {/* Global Interactive Drawers & Overlays */}
      <CartDrawer />
      <AiAssistantDrawer />
      <AuthModal />
      <ToastContainer />
    </div>
  );
}
