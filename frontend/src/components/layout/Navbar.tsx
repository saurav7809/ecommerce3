import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  Sparkles,
  Menu,
  X,
  LogOut,
  Package,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { openCartDrawer } from '../../store/cartSlice';
import { openAuthModal } from '../../store/uiSlice';
import { logout } from '../../store/authSlice';
import { openAiDrawer } from '../../store/uiSlice';
import { formatCurrency } from '../../lib/utils';
import MegaMenu from './MegaMenu';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsAccountOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs">
      {/* Top Banner - Free Shipping & Value Prop */}
      <div className="bg-[#581172] text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center space-x-4">
        <span>🚚 <strong>FAST & FREE SHIPPING</strong> on orders over ₹5,000</span>
        <span className="hidden md:inline text-purple-200">|</span>
        <span className="hidden md:inline">✨ Up to 60% Off Spring Home Refresh</span>
        <span className="hidden md:inline text-purple-200">|</span>
        <span className="hidden md:inline">🛡️ 30-Day Easy Returns</span>
      </div>

      {/* Utility Top Bar */}
      <div className="border-b border-gray-100 bg-gray-50 text-xs text-gray-600 px-4 py-1">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline">Expert Home Design & Furniture</span>
            <button
              onClick={() => dispatch(openAiDrawer())}
              className="flex items-center space-x-1 text-[#7b189f] font-semibold hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c68a0c]" />
              <span>Ask AI Interior Designer</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/orders" className="hover:text-[#7b189f]">Track Orders</Link>
            <span className="text-gray-300">|</span>
            <Link to="/products?discount=true" className="text-rose-600 font-semibold hover:underline">Deals & Clearance</Link>
            {user?.role === 'ADMIN' && (
              <>
                <span className="text-gray-300">|</span>
                <Link to="/admin" className="text-[#7b189f] font-semibold hover:underline flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="md:hidden p-1.5 text-gray-700 hover:text-[#7b189f]"
            aria-label="Toggle menu"
          >
            {isMobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Wayfair-style Brand Logo */}
          <Link to="/" className="flex items-center space-x-2 shrink-0 group">
            <div className="w-9 h-9 rounded-lg bg-[#7b189f] flex items-center justify-center text-white font-bold text-xl shadow-xs group-hover:bg-[#581172] transition-colors">
              H
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-black tracking-tight text-[#7b189f]">
                Home<span className="text-[#c68a0c]">Nest</span>
              </span>
              <span className="text-[9px] font-semibold tracking-wider text-gray-500 uppercase">
                A Wayfair-Style Store
              </span>
            </div>
          </Link>

          {/* Search Bar with Instant Submit */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Find anything home... sofas, rugs, lighting, dining tables"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-2.5 rounded-full border-2 border-gray-200 focus:border-[#7b189f] focus:outline-hidden text-sm bg-gray-50/50 hover:bg-white transition-all shadow-xs"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 bg-[#7b189f] hover:bg-[#581172] text-white rounded-full flex items-center justify-center transition-colors shadow-xs"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-4">
            {/* AI Designer Assistant Icon */}
            <button
              onClick={() => dispatch(openAiDrawer())}
              className="hidden lg:flex items-center space-x-1 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-[#7b189f] border border-purple-200 transition-colors text-xs font-semibold shadow-xs"
              title="AI Design Assistant"
            >
              <Sparkles className="w-4 h-4 text-[#c68a0c] animate-pulse" />
              <span>AI Decor</span>
            </button>

            {/* Favorites / Wishlist */}
            <Link
              to="/favorites"
              className="relative p-2 text-gray-700 hover:text-[#7b189f] transition-colors"
              title="Favorites"
            >
              <Heart className="w-6 h-6" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#c68a0c] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Account Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setIsAccountOpen(!isAccountOpen)}
                    className="flex items-center space-x-1.5 p-1.5 text-gray-700 hover:text-[#7b189f] rounded-md transition-colors"
                  >
                    <UserIcon className="w-6 h-6" />
                    <span className="hidden md:inline text-xs font-medium max-w-[90px] truncate">
                      {user?.fullName.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {isAccountOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{user?.fullName}</p>
                        <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 bg-purple-100 text-[#7b189f] rounded-full uppercase">
                          {user?.role}
                        </span>
                      </div>
                      <Link
                        to="/orders"
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#7b189f]"
                      >
                        <Package className="w-4 h-4" />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        to="/favorites"
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#7b189f]"
                      >
                        <Heart className="w-4 h-4" />
                        <span>My Favorites</span>
                      </Link>
                      {(user?.role === 'ADMIN' || user?.role === 'SELLER') && (
                        <Link
                          to="/admin"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-[#7b189f] font-semibold hover:bg-purple-50"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Management Portal</span>
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => dispatch(openAuthModal('login'))}
                  className="flex items-center space-x-1.5 p-1.5 text-gray-700 hover:text-[#7b189f] text-sm font-semibold transition-colors"
                >
                  <UserIcon className="w-6 h-6" />
                  <span className="hidden md:inline">Sign In</span>
                </button>
              )}
            </div>

            {/* Cart Button with Drawer Trigger */}
            <button
              onClick={() => dispatch(openCartDrawer())}
              className="flex items-center space-x-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[#7b189f] px-3 py-2 rounded-full transition-colors relative shadow-xs"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[10px] uppercase font-bold text-gray-500">Cart</span>
                <span className="text-xs font-bold text-[#7b189f]">{formatCurrency(cartSubtotal)}</span>
              </div>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#7b189f] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MegaMenu for Categories */}
      <MegaMenu />
    </header>
  );
}
