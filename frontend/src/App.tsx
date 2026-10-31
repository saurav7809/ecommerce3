// ─── App root — layout + routing ─────────────────────────────────────────────

import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import CheckoutModal from './components/cart/CheckoutModal';
import AuthModal from './components/auth/AuthModal';
import AiAssistantDrawer from './components/ui/AiAssistantDrawer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import OrdersPage from './pages/OrdersPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

// Inner component so it can use useNavigate inside BrowserRouter
function Shell() {
  const [cartOpen, setCartOpen]       = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authOpen, setAuthOpen]       = useState(false);
  const navigate = useNavigate();

  const handleCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const handleOrderSuccess = (reference: string) => {
    setCheckoutOpen(false);
    navigate(`/order-success?ref=${reference}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900">
      <Navbar onCartOpen={() => setCartOpen(true)} onAuthOpen={() => setAuthOpen(true)} />

      <main className="flex-1">
        <Routes>
          <Route path="/"                element={<HomePage />} />
          <Route path="/products"        element={<ProductsPage />} />
          <Route path="/products/:id"    element={<ProductDetailPage />} />
          <Route path="/orders"          element={<OrdersPage />} />
          <Route path="/order-success"   element={<OrderSuccessPage />} />
          <Route path="*"                element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Overlays */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={handleOrderSuccess}
      />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
      />
      <AiAssistantDrawer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
