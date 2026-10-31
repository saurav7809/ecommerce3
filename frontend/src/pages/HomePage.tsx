// ─── Home Page ────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Truck, Check } from 'lucide-react';
import { fetchProducts, fetchRecommendations } from '../api/client';
import type { Product } from '../types';
import ProductCard from '../components/product/ProductCard';
import { imageUrl } from '../lib/utils';

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [all, setAll] = useState<Product[]>([]);
  const [recommendedIds, setRecommendedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then((products) => {
        setAll(products);
        setFeatured(products.filter((p) => p.featured).slice(0, 4));
        // Fetch AI recommendations for homepage (no cart items yet)
        return fetchRecommendations({
          products: products.map((p) => ({ id: p.id, category: p.category, featured: p.featured })),
          cart_ids: [],
          limit: 4,
        });
      })
      .then((rec) => setRecommendedIds(rec.productIds))
      .catch(() => { /* offline – use featured as fallback */ })
      .finally(() => setLoading(false));
  }, []);

  const recommended = recommendedIds.length > 0
    ? all.filter((p) => recommendedIds.includes(p.id))
    : all.slice(0, 4);

  const heroProduct = featured[0];

  return (
    <div className="space-y-24">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-stone-100 rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 min-h-[480px] flex items-end">
        {heroProduct && (
          <img
            src={imageUrl(heroProduct.imageUrl, 1400)}
            alt={heroProduct.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="relative p-8 sm:p-12 max-w-xl">
          <p className="text-xs text-white/70 tracking-widest uppercase mb-3">New arrivals</p>
          <h1 className="text-3xl sm:text-5xl font-semibold text-white leading-tight">
            Things that make life a little more beautiful.
          </h1>
          <div className="mt-6 flex items-center gap-4 flex-wrap">
            <Link
              to="/products"
              className="bg-white hover:bg-stone-100 text-stone-900 rounded-xl px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2"
            >
              Shop the collection <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust badges ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: <Truck size={20} />, title: 'Free shipping', body: 'On orders over ₹5,000.' },
            { icon: <Check size={20} />, title: 'Easy returns', body: 'Return within 30 days, no questions asked.' },
            { icon: <Sparkles size={20} />, title: 'Considered design', body: 'Every item is made to last.' },
          ].map((b) => (
            <div key={b.title} className="flex gap-4 items-start bg-stone-50 rounded-2xl p-5">
              <div className="p-2 bg-white rounded-xl shadow-sm text-stone-700">{b.icon}</div>
              <div>
                <p className="font-medium text-stone-900 text-sm">{b.title}</p>
                <p className="text-xs text-stone-500 mt-0.5">{b.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured products ────────────────────────────────────── */}
      {!loading && featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">The edit</p>
              <h2 className="text-2xl font-semibold text-stone-900">Bestsellers</h2>
            </div>
            <Link to="/products" className="text-sm text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── AI Recommendations ───────────────────────────────────── */}
      {!loading && recommended.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs tracking-widest uppercase text-stone-400 mb-1 flex items-center gap-1.5">
                <Sparkles size={12} /> Recommended for you
              </p>
              <h2 className="text-2xl font-semibold text-stone-900">You might also like</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {recommended.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── Category links ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Home', 'Accessories', 'Wellness', 'Stationery'].map((cat) => (
            <Link
              key={cat}
              to={`/products?category=${cat}`}
              className="group relative overflow-hidden rounded-2xl bg-stone-100 aspect-square flex items-end p-5 hover:shadow-lg transition-shadow"
            >
              <div className="relative z-10">
                <p className="text-white font-semibold">{cat}</p>
                <p className="text-white/70 text-xs mt-0.5 group-hover:underline">Shop now →</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

