// ─── ProductCard ──────────────────────────────────────────────────────────────

import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { money, imageUrl } from '../../lib/utils';
import { useCartStore } from '../../store/cartStore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="group relative flex flex-col">
      {/* Image */}
      <Link to={`/products/${product.id}`} className="block relative overflow-hidden rounded-2xl bg-stone-100 aspect-square">
        <img
          src={imageUrl(product.imageUrl, 600)}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.featured && (
            <span className="bg-white/90 backdrop-blur-sm text-stone-700 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Bestseller
            </span>
          )}
          {product.inventory > 0 && product.inventory <= 5 && (
            <span className="bg-amber-100 text-amber-700 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Low stock
            </span>
          )}
          {product.inventory === 0 && (
            <span className="bg-red-100 text-red-700 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Sold out
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
          aria-label="Add to wishlist"
        >
          <Heart size={16} className="text-stone-600" />
        </button>

        {/* Quick add on hover */}
        {product.inventory > 0 && (
          <button
            onClick={(e) => { e.preventDefault(); addItem(product); }}
            className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-white text-stone-900 text-sm font-medium py-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <ShoppingBag size={15} /> Quick add
          </button>
        )}
      </Link>

      {/* Info */}
      <div className="mt-3 flex-1 flex flex-col">
        <p className="text-xs text-stone-400 uppercase tracking-wider">{product.category}</p>
        <Link
          to={`/products/${product.id}`}
          className="mt-0.5 font-medium text-stone-900 text-sm hover:underline underline-offset-2"
        >
          {product.name}
        </Link>
        <p className="text-xs text-stone-400 mt-0.5 truncate">{product.variant}</p>
        <p className="mt-2 text-sm font-semibold text-stone-900">{money(product.price)}</p>
      </div>
    </div>
  );
}

