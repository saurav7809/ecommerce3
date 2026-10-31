import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Truck } from 'lucide-react';
import { ProductSummary } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { useAppDispatch, useAppSelector } from '../../store';
import { addToCart } from '../../store/cartSlice';
import { toggleWishlist } from '../../store/wishlistSlice';
import { addToast } from '../../store/uiSlice';

interface ProductCardProps {
  product: ProductSummary;
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const wishlist = useAppSelector((state) => state.wishlist.items);
  const isFavorite = wishlist.some((item) => item.id === product.id);

  const discountPercent = product.discountPercent || (
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ product, quantity: 1, openDrawer: true }));
    dispatch(addToast({ message: `Added "${product.name}" to cart`, type: 'success' }));
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product));
    dispatch(
      addToast({
        message: isFavorite ? 'Removed from favorites' : 'Saved to favorites',
        type: 'info',
      })
    );
  };

  // Fallback image if primary is not available
  const primaryImg = product.primaryImage || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80';
  const secondaryImg = product.secondaryImage || primaryImg;

  return (
    <div className="group relative flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image Container with Hover Swap */}
      <Link to={`/product/${product.slug}`} className="relative aspect-4/3 sm:aspect-square overflow-hidden bg-gray-50">
        <img
          src={primaryImg}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        {secondaryImg !== primaryImg && (
          <img
            src={secondaryImg}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        )}

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-sm shadow-xs uppercase tracking-wide">
            {discountPercent}% Off
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-colors backdrop-blur-xs ${
            isFavorite
              ? 'bg-rose-50 text-rose-600 fill-rose-600 shadow-sm'
              : 'bg-white/80 text-gray-600 hover:text-rose-600 hover:bg-white shadow-xs'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Stock warning pill if low */}
        {product.inStock && product.stock <= 5 && (
          <div className="absolute bottom-2.5 left-2.5 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm backdrop-blur-xs">
            Only {product.stock} left!
          </div>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Brand */}
          <p className="text-[11px] font-bold tracking-wider uppercase text-gray-500 truncate mb-1">
            {product.brand || 'HomeNest'}
          </p>

          {/* Title */}
          <Link
            to={`/product/${product.slug}`}
            className="text-sm font-semibold text-gray-900 group-hover:text-[#7b189f] transition-colors line-clamp-2 leading-snug mb-1.5"
          >
            {product.name}
          </Link>

          {/* Rating Stars */}
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
              <span className="text-xs font-bold ml-1 text-gray-900">
                {(product.rating || 4.8).toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              ({product.reviewCount || 42})
            </span>
          </div>
        </div>

        {/* Pricing & Free Shipping info */}
        <div>
          <div className="flex items-baseline space-x-2 mb-1.5">
            <span className="text-base font-extrabold text-gray-900">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 text-[11px] font-medium text-emerald-700 mb-3">
            <Truck className="w-3.5 h-3.5" />
            <span>Fast Free Shipping</span>
          </div>

          {/* Quick Add To Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-xs ${
              product.inStock
                ? 'bg-purple-50 hover:bg-[#7b189f] text-[#7b189f] hover:text-white border border-purple-200 hover:border-[#7b189f]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
