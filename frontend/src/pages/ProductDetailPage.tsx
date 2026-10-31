// ─── Product Detail Page ──────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Minus, Plus, ShoppingBag, Truck } from 'lucide-react';
import { fetchProduct } from '../api/client';
import type { Product } from '../types';
import { money, imageUrl } from '../lib/utils';
import { useCartStore } from '../store/cartStore';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchProduct(Number(id))
      .then(setProduct)
      .catch(() => navigate('/products', { replace: true }))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-2 gap-12 animate-pulse">
          <div className="bg-stone-100 rounded-3xl aspect-square" />
          <div className="space-y-4 py-4">
            <div className="h-4 bg-stone-100 rounded w-1/4" />
            <div className="h-7 bg-stone-100 rounded w-3/4" />
            <div className="h-5 bg-stone-100 rounded w-1/3" />
            <div className="h-24 bg-stone-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const outOfStock = product.inventory === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-sm text-stone-400">
        <Link to="/" className="hover:text-stone-700 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-stone-700 transition-colors">Shop</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category}`} className="hover:text-stone-700 transition-colors">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-stone-700 truncate max-w-xs">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        {/* Image */}
        <div className="relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow hover:bg-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <img
            src={imageUrl(product.imageUrl, 1000)}
            alt={product.name}
            className="w-full rounded-3xl object-cover aspect-square bg-stone-100"
          />
          {/* Badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {product.featured && (
              <span className="bg-white/90 backdrop-blur-sm text-stone-700 text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Bestseller
              </span>
            )}
            {!outOfStock && product.inventory <= 5 && (
              <span className="bg-amber-100 text-amber-700 text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Only {product.inventory} left
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-xs text-stone-400 tracking-widest uppercase">{product.category}</p>
          <h1 className="mt-1 text-3xl font-semibold text-stone-900 leading-snug">{product.name}</h1>
          <p className="mt-1 text-sm text-stone-400">{product.variant}</p>

          <p className="mt-5 text-2xl font-semibold text-stone-900">{money(product.price)}</p>

          <p className="mt-5 text-stone-600 text-sm leading-relaxed">{product.description}</p>

          {/* Quantity */}
          {!outOfStock && (
            <div className="mt-8 flex items-center gap-3">
              <span className="text-sm text-stone-600">Quantity</span>
              <div className="flex items-center gap-1 border border-stone-200 rounded-xl">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 hover:bg-stone-50 rounded-l-xl transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.inventory, q + 1))}
                  className="p-2 hover:bg-stone-50 rounded-r-xl transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="text-xs text-stone-400">{product.inventory} available</span>
            </div>
          )}

          {/* CTA */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className={`flex-1 py-3.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                outOfStock
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : added
                  ? 'bg-green-600 text-white'
                  : 'bg-stone-900 hover:bg-stone-800 text-white'
              }`}
            >
              {outOfStock ? 'Out of stock' : added ? (
                <><span>✓</span> Added to bag</>
              ) : (
                <><ShoppingBag size={16} /> Add to bag</>
              )}
            </button>
            <button
              className="p-3.5 border border-stone-200 rounded-xl hover:border-stone-400 transition-colors"
              aria-label="Save to wishlist"
            >
              <Heart size={18} className="text-stone-500" />
            </button>
          </div>

          {/* Shipping note */}
          <div className="mt-6 flex items-center gap-3 bg-stone-50 rounded-xl px-4 py-3">
            <Truck size={16} className="text-stone-400 flex-shrink-0" />
            <p className="text-xs text-stone-500">Free shipping on orders over ₹5,000. Easy 30-day returns.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

