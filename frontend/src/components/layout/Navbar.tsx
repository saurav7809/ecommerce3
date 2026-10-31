// ─── Navbar ──────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

interface NavbarProps {
  onCartOpen: () => void;
  onAuthOpen: () => void;
}

export default function Navbar({ onCartOpen, onAuthOpen }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const totalItems = useCartStore((s) => s.totalItems());
  const { account, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Shop', to: '/products' },
    { label: 'Home', to: '/products?category=Home' },
    { label: 'Accessories', to: '/products?category=Accessories' },
    { label: 'Wellness', to: '/products?category=Wellness' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-semibold tracking-tight text-stone-900">
            Common Goods
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-1">
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products…"
                  className="border border-stone-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-stone-500 w-48"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 hover:bg-stone-100 rounded-lg"
                >
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
            )}

            {/* Account */}
            {account ? (
              <div className="relative group">
                <button className="p-2 hover:bg-stone-100 rounded-lg transition-colors" aria-label="Account">
                  <UserRound size={20} />
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-stone-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-1">
                  <span className="block px-4 py-2 text-xs text-stone-400 truncate">{account.email}</span>
                  <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-stone-50 text-stone-700">
                    My Orders
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-stone-50 text-stone-700"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onAuthOpen}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                aria-label="Sign in"
              >
                <UserRound size={20} />
              </button>
            )}

            {/* Cart */}
            <button
              onClick={onCartOpen}
              className="relative p-2 hover:bg-stone-100 rounded-lg transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-stone-900 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 hover:bg-stone-100 rounded-lg"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden border-t border-stone-100 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="px-2 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

