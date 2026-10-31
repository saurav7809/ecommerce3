import React from 'react';
import ProductCard from './ProductCard';
import { ProductSummary } from '../../types';

interface ProductGridProps {
  products: ProductSummary[];
  isLoading?: boolean;
}

export default function ProductGrid({ products, isLoading = false }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-3 bg-gray-200 rounded-sm w-1/3" />
              <div className="h-4 bg-gray-200 rounded-sm w-4/5" />
              <div className="h-3 bg-gray-200 rounded-sm w-1/4" />
              <div className="h-5 bg-gray-200 rounded-sm w-1/2" />
              <div className="h-9 bg-gray-200 rounded-lg w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-purple-50 text-[#7b189f] rounded-full flex items-center justify-center text-2xl font-bold">
          🔍
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">No home products match your criteria</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Try clearing some filters, widening your price range, or searching for other styles and rooms.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
