// ─── Products Listing Page ────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { fetchProducts } from '../api/client';
import type { Product } from '../types';
import ProductCard from '../components/product/ProductCard';
import CategoryFilter from '../components/product/CategoryFilter';

const CATEGORIES = ['All', 'Home', 'Accessories', 'Wellness', 'Stationery'];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const activeCategory = searchParams.get('category') ?? 'All';
  const searchQuery = searchParams.get('q') ?? '';
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchProducts(activeCategory === 'All' ? undefined : activeCategory, searchQuery || undefined)
      .then(setProducts)
      .catch(() => setError('Could not load products. Is the backend running?'))
      .finally(() => setLoading(false));
  }, [activeCategory, searchQuery]);

  const handleCategoryChange = (cat: string) => {
    const next = new URLSearchParams(searchParams);
    if (cat === 'All') next.delete('category');
    else next.set('category', cat);
    setSearchParams(next);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (localSearch.trim()) next.set('q', localSearch.trim());
    else next.delete('q');
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-stone-900">
          {activeCategory === 'All' ? 'All products' : activeCategory}
        </h1>
        {searchQuery && (
          <p className="text-stone-500 mt-1 text-sm">
            Showing results for <span className="font-medium text-stone-800">"{searchQuery}"</span>
          </p>
        )}
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <CategoryFilter
          categories={CATEGORIES}
          active={activeCategory}
          onChange={handleCategoryChange}
        />
        <div className="sm:ml-auto">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search products…"
                className="border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-stone-500 transition-colors w-52"
              />
            </div>
            <button
              type="submit"
              className="bg-stone-900 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-stone-800 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Grid / States */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-stone-100 rounded-2xl aspect-square" />
              <div className="mt-3 space-y-2">
                <div className="h-3 bg-stone-100 rounded w-1/3" />
                <div className="h-4 bg-stone-100 rounded w-3/4" />
                <div className="h-3 bg-stone-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <p className="text-stone-400 text-sm">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <SlidersHorizontal size={32} className="text-stone-300" />
          <p className="text-stone-500 font-medium">No products found</p>
          <p className="text-stone-400 text-sm">Try a different category or search term.</p>
          <button
            onClick={() => setSearchParams({})}
            className="mt-2 text-sm text-stone-600 underline underline-offset-2 hover:text-stone-900"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <p className="text-xs text-stone-400 text-center mt-10">
          Showing {products.length} item{products.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

