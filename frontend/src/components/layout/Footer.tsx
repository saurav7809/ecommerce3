// ─── Footer ──────────────────────────────────────────────────────────────────

import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-lg font-semibold tracking-tight text-stone-900">
              Common Goods
            </Link>
            <p className="mt-3 text-sm text-stone-500 leading-relaxed">
              Considered things for everyday life.
            </p>
            <a
              href="#"
              className="mt-4 inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors"
            >
              <Instagram size={16} /> @commongoods
            </a>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-4">
              Shop
            </h3>
            <ul className="space-y-2">
              {['Home', 'Accessories', 'Wellness', 'Stationery'].map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/products?category=${cat}`}
                    className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-4">
              Info
            </h3>
            <ul className="space-y-2">
              {['About', 'Shipping', 'Returns', 'Contact'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-4">
              Account
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/orders"
                  className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
                >
                  My Orders
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-400">
            © {new Date().getFullYear()} Common Goods. All rights reserved.
          </p>
          <p className="text-xs text-stone-400">
            Payments secured by <span className="font-medium text-stone-600">Razorpay</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

