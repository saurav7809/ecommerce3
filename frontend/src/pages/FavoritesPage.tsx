import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { removeFromWishlist } from '../store/wishlistSlice';
import { addToCart } from '../store/cartSlice';
import { addToast } from '../store/uiSlice';
import { formatCurrency } from '../lib/utils';

export default function FavoritesPage() {
  const dispatch = useAppDispatch();
  const wishlist = useAppSelector((state) => state.wishlist.items);

  const handleMoveToCart = (product: any) => {
    dispatch(addToCart({ product, quantity: 1, openDrawer: true }));
    dispatch(removeFromWishlist(product.id));
    dispatch(addToast({ message: `Moved "${product.name}" to cart`, type: 'success' }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          Saved Favorites ({wishlist.length})
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Pieces you've saved to furnish your living room, bedroom, or dining space
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">No Favorites Saved Yet</h2>
          <p className="text-xs text-gray-500 mt-1 mb-6 max-w-sm mx-auto">
            Click the heart icon on any product to save it here for later inspiration and price tracking.
          </p>
          <Link
            to="/products"
            className="px-6 py-2.5 rounded-full bg-[#7b189f] text-white text-xs font-bold hover:bg-[#581172] transition-colors"
          >
            Explore Furniture
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                <img
                  src={product.primaryImage || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => dispatch(removeFromWishlist(product.id))}
                  className="absolute top-2.5 right-2.5 p-2 bg-white/90 hover:bg-white text-gray-500 hover:text-rose-600 rounded-full shadow-xs transition-colors"
                  title="Remove from favorites"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{product.brand}</p>
                  <Link
                    to={`/product/${product.slug}`}
                    className="text-xs font-bold text-gray-900 hover:text-[#7b189f] line-clamp-2 mt-0.5"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm font-black text-gray-900 mt-2">
                    {formatCurrency(product.price)}
                  </p>
                </div>

                <button
                  onClick={() => handleMoveToCart(product)}
                  className="w-full py-2 px-3 rounded-lg bg-purple-50 hover:bg-[#7b189f] text-[#7b189f] hover:text-white border border-purple-200 hover:border-[#7b189f] text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
