import React, { useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { useGetProductsQuery, useGetProductFacetsQuery } from '../store/apiSlice';
import ProductGrid from '../components/product/ProductGrid';
import FacetFilters from '../components/product/FacetFilters';

export default function BrowsePage() {
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract query params
  const query = searchParams.get('query') || '';
  const brand = searchParams.get('brand') || undefined;
  const color = searchParams.get('color') || undefined;
  const material = searchParams.get('material') || undefined;
  const style = searchParams.get('style') || undefined;
  const room = searchParams.get('room') || undefined;
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const minRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined;
  const inStock = searchParams.get('inStock') === 'true';
  const sort = searchParams.get('sort') || 'recommended';
  const page = Number(searchParams.get('page')) || 0;
  const categoryParam = slug || searchParams.get('category') || undefined;

  // Build product API query params
  const productQueryParams = useMemo(
    () => ({
      query: query || undefined,
      category: categoryParam,
      brand,
      color,
      material,
      style,
      room,
      minPrice,
      maxPrice,
      minRating,
      inStock: inStock ? true : undefined,
      sort,
      page,
      size: 16,
    }),
    [query, categoryParam, brand, color, material, style, room, minPrice, maxPrice, minRating, inStock, sort, page]
  );

  const { data: productsData, isLoading: isProductsLoading } = useGetProductsQuery(productQueryParams);

  // Build facet API query params
  const facetQueryParams = useMemo(
    () => ({
      query: query || undefined,
      category: categoryParam,
    }),
    [query, categoryParam]
  );

  const { data: facetsData } = useGetProductFacetsQuery(facetQueryParams);

  // Update query params helper
  const updateFilters = (newFilters: Record<string, any>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val === undefined || val === null || val === '') {
        next.delete(key);
      } else {
        next.set(key, val.toString());
      }
    });
    next.set('page', '0'); // reset page on filter change
    setSearchParams(next);
  };

  const handleClearAll = () => {
    const next = new URLSearchParams();
    if (slug) {
      // keep route slug
    } else if (searchParams.get('query')) {
      next.set('query', searchParams.get('query')!);
    }
    setSearchParams(next);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ sort: e.target.value });
  };

  // Derive human title
  const pageTitle = query
    ? `Search Results for "${query}"`
    : slug
    ? slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'All Home Products';

  const totalElements = productsData?.totalElements || 0;
  const totalPages = productsData?.totalPages || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-1.5 text-xs text-gray-500">
        <Link to="/" className="hover:text-[#7b189f]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link to="/products" className="hover:text-[#7b189f]">Catalog</Link>
        {slug && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-800 capitalize">
              {slug.replace('-', ' ')}
            </span>
          </>
        )}
      </nav>

      {/* Title & Sorting Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{pageTitle}</h1>
          <p className="text-xs text-gray-500 mt-1">
            {totalElements} {totalElements === 1 ? 'piece' : 'pieces'} ready for your home
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-3">
          <label htmlFor="sort" className="text-xs font-bold text-gray-700 whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="sort"
            value={sort}
            onChange={handleSortChange}
            className="text-xs font-semibold py-2 pl-3 pr-8 rounded-lg border border-gray-200 bg-white focus:border-[#7b189f] focus:outline-hidden"
          >
            <option value="recommended">Featured / Recommended</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Customer Rated</option>
            <option value="newest">New Arrivals</option>
            <option value="discount">Biggest Discount (%)</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(brand || color || material || style || room || minPrice || maxPrice || minRating || inStock) && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active:</span>
          {brand && (
            <span className="inline-flex items-center text-xs bg-purple-50 text-[#7b189f] px-2.5 py-1 rounded-full font-medium">
              Brand: {brand}
              <button onClick={() => updateFilters({ brand: undefined })} className="ml-1.5 hover:text-purple-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {color && (
            <span className="inline-flex items-center text-xs bg-purple-50 text-[#7b189f] px-2.5 py-1 rounded-full font-medium">
              Color: {color}
              <button onClick={() => updateFilters({ color: undefined })} className="ml-1.5 hover:text-purple-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {material && (
            <span className="inline-flex items-center text-xs bg-purple-50 text-[#7b189f] px-2.5 py-1 rounded-full font-medium">
              Material: {material}
              <button onClick={() => updateFilters({ material: undefined })} className="ml-1.5 hover:text-purple-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {style && (
            <span className="inline-flex items-center text-xs bg-purple-50 text-[#7b189f] px-2.5 py-1 rounded-full font-medium">
              Style: {style}
              <button onClick={() => updateFilters({ style: undefined })} className="ml-1.5 hover:text-purple-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {minPrice && (
            <span className="inline-flex items-center text-xs bg-purple-50 text-[#7b189f] px-2.5 py-1 rounded-full font-medium">
              Min ₹{minPrice}
              <button onClick={() => updateFilters({ minPrice: undefined })} className="ml-1.5 hover:text-purple-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {maxPrice && (
            <span className="inline-flex items-center text-xs bg-purple-50 text-[#7b189f] px-2.5 py-1 rounded-full font-medium">
              Max ₹{maxPrice}
              <button onClick={() => updateFilters({ maxPrice: undefined })} className="ml-1.5 hover:text-purple-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {inStock && (
            <span className="inline-flex items-center text-xs bg-purple-50 text-[#7b189f] px-2.5 py-1 rounded-full font-medium">
              In Stock Only
              <button onClick={() => updateFilters({ inStock: undefined })} className="ml-1.5 hover:text-purple-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={handleClearAll}
            className="text-xs font-bold text-[#7b189f] hover:underline ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Layout: Sidebar Facets + Product Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Facets Rail */}
        <FacetFilters
          facets={facetsData}
          selectedBrand={brand}
          selectedColor={color}
          selectedMaterial={material}
          selectedStyle={style}
          selectedRoom={room}
          minPrice={minPrice}
          maxPrice={maxPrice}
          minRating={minRating}
          inStockOnly={inStock}
          onFilterChange={updateFilters}
          onClearAll={handleClearAll}
        />

        {/* Right Main Grid & Pagination */}
        <div className="flex-1 w-full space-y-8">
          <ProductGrid
            products={productsData?.content || []}
            isLoading={isProductsLoading}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-8 border-t border-gray-100">
              <button
                disabled={page === 0}
                onClick={() => updateFilters({ page: page - 1 })}
                className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }).map((_, p) => (
                <button
                  key={p}
                  onClick={() => updateFilters({ page: p })}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                    p === page
                      ? 'bg-[#7b189f] text-white shadow-xs'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {p + 1}
                </button>
              ))}

              <button
                disabled={page >= totalPages - 1}
                onClick={() => updateFilters({ page: page + 1 })}
                className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
