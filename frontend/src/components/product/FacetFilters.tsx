import React from 'react';
import { Star, Check, RotateCcw } from 'lucide-react';
import { ProductFacets } from '../../types';

interface FacetFiltersProps {
  facets?: ProductFacets;
  selectedBrand?: string;
  selectedColor?: string;
  selectedMaterial?: string;
  selectedStyle?: string;
  selectedRoom?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  onFilterChange: (filters: {
    brand?: string;
    color?: string;
    material?: string;
    style?: string;
    room?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStock?: boolean;
  }) => void;
  onClearAll: () => void;
}

const COLOR_MAP: Record<string, string> = {
  White: '#ffffff',
  Beige: '#f5f5dc',
  Cream: '#fffdd0',
  Grey: '#808080',
  Gray: '#808080',
  Brown: '#8b4513',
  Walnut: '#5c4033',
  Black: '#1a1a1a',
  Blue: '#2563eb',
  Navy: '#1e3a8a',
  Green: '#16a34a',
  Olive: '#556b2f',
  Gold: '#d97706',
  Mustard: '#eab308',
  Terracotta: '#e07a5f',
  Rust: '#b45309',
};

export default function FacetFilters({
  facets,
  selectedBrand,
  selectedColor,
  selectedMaterial,
  selectedStyle,
  selectedRoom,
  minPrice,
  maxPrice,
  minRating,
  inStockOnly,
  onFilterChange,
  onClearAll,
}: FacetFiltersProps) {
  const hasActiveFilters = Boolean(
    selectedBrand ||
    selectedColor ||
    selectedMaterial ||
    selectedStyle ||
    selectedRoom ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    minRating !== undefined ||
    inStockOnly
  );

  return (
    <aside className="w-full lg:w-64 bg-white rounded-xl border border-gray-100 p-4 space-y-6 shrink-0">
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-xs text-[#7b189f] font-semibold hover:underline flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* In-Stock Toggle */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2.5 text-xs font-semibold text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(inStockOnly)}
            onChange={(e) => onFilterChange({ inStock: e.target.checked || undefined })}
            className="w-4 h-4 rounded-sm text-[#7b189f] focus:ring-[#7b189f] accent-[#7b189f]"
          />
          <span>In-Stock Ready to Ship</span>
        </label>
      </div>

      {/* Price Buckets */}
      <div className="space-y-2.5 pt-3 border-t border-gray-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Price</h4>
        <div className="space-y-1.5 text-xs text-gray-600">
          {[
            { label: 'Under ₹5,000', min: undefined, max: 5000 },
            { label: '₹5,000 - ₹15,000', min: 5000, max: 15000 },
            { label: '₹15,000 - ₹35,000', min: 15000, max: 35000 },
            { label: '₹35,000 & Above', min: 35000, max: undefined },
          ].map((bucket, idx) => {
            const isSelected = minPrice === bucket.min && maxPrice === bucket.max;
            return (
              <button
                key={idx}
                onClick={() =>
                  onFilterChange({
                    minPrice: isSelected ? undefined : bucket.min,
                    maxPrice: isSelected ? undefined : bucket.max,
                  })
                }
                className={`block w-full text-left py-1 px-2 rounded-sm transition-colors ${
                  isSelected
                    ? 'bg-purple-100 text-[#7b189f] font-bold'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {bucket.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Room Style Pills */}
      {facets?.styles && facets.styles.length > 0 && (
        <div className="space-y-2.5 pt-3 border-t border-gray-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Design Aesthetic</h4>
          <div className="flex flex-wrap gap-1.5">
            {facets.styles.map((item) => {
              const isSelected = selectedStyle === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => onFilterChange({ style: isSelected ? undefined : item.value })}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    isSelected
                      ? 'bg-[#7b189f] text-white border-[#7b189f] font-semibold shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {item.value} ({item.count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Swatches */}
      {facets?.colors && facets.colors.length > 0 && (
        <div className="space-y-2.5 pt-3 border-t border-gray-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Color Palette</h4>
          <div className="grid grid-cols-4 gap-2">
            {facets.colors.map((c) => {
              const isSelected = selectedColor === c.value;
              const bg = COLOR_MAP[c.value] || '#9ca3af';
              return (
                <button
                  key={c.value}
                  onClick={() => onFilterChange({ color: isSelected ? undefined : c.value })}
                  className={`group flex flex-col items-center p-1.5 rounded-lg border text-center transition-all ${
                    isSelected
                      ? 'border-[#7b189f] bg-purple-50 font-bold'
                      : 'border-transparent hover:border-gray-200'
                  }`}
                  title={`${c.value} (${c.count})`}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-gray-300 shadow-2xs flex items-center justify-center mb-1"
                    style={{ backgroundColor: bg }}
                  >
                    {isSelected && (
                      <Check className={`w-3 h-3 ${bg === '#ffffff' ? 'text-black' : 'text-white'}`} />
                    )}
                  </span>
                  <span className="text-[10px] text-gray-700 truncate max-w-full">{c.value}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Material */}
      {facets?.materials && facets.materials.length > 0 && (
        <div className="space-y-2.5 pt-3 border-t border-gray-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Material</h4>
          <div className="space-y-1 max-h-36 overflow-y-auto no-scrollbar">
            {facets.materials.map((m) => {
              const isSelected = selectedMaterial === m.value;
              return (
                <button
                  key={m.value}
                  onClick={() => onFilterChange({ material: isSelected ? undefined : m.value })}
                  className={`w-full flex items-center justify-between text-left text-xs py-1 px-2 rounded-sm transition-colors ${
                    isSelected ? 'bg-purple-50 text-[#7b189f] font-bold' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="truncate">{m.value}</span>
                  <span className="text-[10px] text-gray-400">({m.count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Brand */}
      {facets?.brands && facets.brands.length > 0 && (
        <div className="space-y-2.5 pt-3 border-t border-gray-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Brand</h4>
          <div className="space-y-1 max-h-36 overflow-y-auto no-scrollbar">
            {facets.brands.map((b) => {
              const isSelected = selectedBrand === b.value;
              return (
                <button
                  key={b.value}
                  onClick={() => onFilterChange({ brand: isSelected ? undefined : b.value })}
                  className={`w-full flex items-center justify-between text-left text-xs py-1 px-2 rounded-sm transition-colors ${
                    isSelected ? 'bg-purple-50 text-[#7b189f] font-bold' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="truncate">{b.value}</span>
                  <span className="text-[10px] text-gray-400">({b.count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer Rating Filter */}
      <div className="space-y-2.5 pt-3 border-t border-gray-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Customer Rating</h4>
        <div className="space-y-1 text-xs">
          {[4, 4.5].map((stars) => {
            const isSelected = minRating === stars;
            return (
              <button
                key={stars}
                onClick={() => onFilterChange({ minRating: isSelected ? undefined : stars })}
                className={`w-full flex items-center space-x-1.5 py-1 px-2 rounded-sm transition-colors ${
                  isSelected ? 'bg-purple-50 text-[#7b189f] font-bold' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                </div>
                <span>{stars} Stars & Above</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
