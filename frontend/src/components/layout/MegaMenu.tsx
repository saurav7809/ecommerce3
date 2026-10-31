import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useGetDepartmentsQuery } from '../../store/apiSlice';
import { DepartmentSummary } from '../../types';

// Fallback departments if backend has not finished seeding yet
const FALLBACK_DEPARTMENTS: Partial<DepartmentSummary>[] = [
  {
    name: 'Furniture',
    slug: 'furniture',
    subcategories: [
      { id: 1, name: 'Sofas & Sectionals', slug: 'sofas', displayOrder: 1, productCount: 4 },
      { id: 2, name: 'Accent Chairs', slug: 'accent-chairs', displayOrder: 2, productCount: 4 },
      { id: 3, name: 'Coffee & Side Tables', slug: 'coffee-tables', displayOrder: 3, productCount: 3 },
      { id: 4, name: 'Beds & Headboards', slug: 'beds', displayOrder: 4, productCount: 4 },
      { id: 5, name: 'Dining Tables & Sets', slug: 'dining-sets', displayOrder: 5, productCount: 3 },
      { id: 6, name: 'Desks & Office Chairs', slug: 'desks', displayOrder: 6, productCount: 3 },
      { id: 7, name: 'Bookcases & Shelving', slug: 'bookcases', displayOrder: 7, productCount: 2 },
    ],
  },
  {
    name: 'Outdoor',
    slug: 'outdoor',
    subcategories: [
      { id: 8, name: 'Patio Furniture Sets', slug: 'patio-furniture', displayOrder: 1, productCount: 2 },
      { id: 9, name: 'Outdoor Seating & Lounges', slug: 'outdoor-seating', displayOrder: 2, productCount: 2 },
    ],
  },
  {
    name: 'Bedding & Bath',
    slug: 'bedding-bath',
    subcategories: [
      { id: 10, name: 'Sheets & Duvet Sets', slug: 'bedding-sets', displayOrder: 1, productCount: 2 },
      { id: 11, name: 'Bath Towels & Rugs', slug: 'bath-towels', displayOrder: 2, productCount: 2 },
    ],
  },
  {
    name: 'Rugs',
    slug: 'rugs',
    subcategories: [
      { id: 12, name: 'Area Rugs', slug: 'area-rugs', displayOrder: 1, productCount: 3 },
      { id: 13, name: 'Runner Rugs', slug: 'runner-rugs', displayOrder: 2, productCount: 2 },
    ],
  },
  {
    name: 'Décor & Pillows',
    slug: 'decor-pillows',
    subcategories: [
      { id: 14, name: 'Wall Art & Frames', slug: 'wall-art', displayOrder: 1, productCount: 3 },
      { id: 15, name: 'Throw Pillows & Blankets', slug: 'throw-pillows', displayOrder: 2, productCount: 2 },
      { id: 16, name: 'Vases & Decorative Objects', slug: 'vases-objects', displayOrder: 3, productCount: 2 },
    ],
  },
  {
    name: 'Lighting',
    slug: 'lighting',
    subcategories: [
      { id: 17, name: 'Floor Lamps', slug: 'floor-lamps', displayOrder: 1, productCount: 2 },
      { id: 18, name: 'Table Lamps', slug: 'table-lamps', displayOrder: 2, productCount: 2 },
      { id: 19, name: 'Pendant Lights & Chandeliers', slug: 'pendants', displayOrder: 3, productCount: 2 },
    ],
  },
  {
    name: 'Kitchen & Dining',
    slug: 'kitchen-dining',
    subcategories: [
      { id: 20, name: 'Cookware & Bakeware', slug: 'cookware', displayOrder: 1, productCount: 2 },
      { id: 21, name: 'Dinnerware & Serving', slug: 'dinnerware', displayOrder: 2, productCount: 2 },
      { id: 22, name: 'Bar Stools', slug: 'bar-stools', displayOrder: 3, productCount: 2 },
    ],
  },
  {
    name: 'Storage & Organization',
    slug: 'storage-org',
    subcategories: [
      { id: 23, name: 'Storage Baskets & Bins', slug: 'baskets', displayOrder: 1, productCount: 2 },
      { id: 24, name: 'Wardrobes & Armoires', slug: 'wardrobes', displayOrder: 2, productCount: 2 },
    ],
  },
  {
    name: 'Baby & Kids',
    slug: 'baby-kids',
    subcategories: [
      { id: 25, name: 'Kids Furniture', slug: 'kids-furniture', displayOrder: 1, productCount: 2 },
      { id: 26, name: 'Nursery Decor', slug: 'nursery', displayOrder: 2, productCount: 2 },
    ],
  },
];

export default function MegaMenu() {
  const { data: serverDepartments } = useGetDepartmentsQuery();
  const [activeDept, setActiveDept] = useState<string | null>(null);

  const departments = (serverDepartments && serverDepartments.length > 0)
    ? serverDepartments
    : (FALLBACK_DEPARTMENTS as DepartmentSummary[]);

  return (
    <nav className="relative border-b border-gray-200 bg-white" onMouseLeave={() => setActiveDept(null)}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Horizontal Navigation List */}
        <div className="flex items-center space-x-1 lg:space-x-3 overflow-x-auto no-scrollbar py-2 text-xs font-semibold text-gray-700">
          {departments.map((dept) => {
            const isActive = activeDept === dept.slug;
            return (
              <div
                key={dept.slug}
                className="relative shrink-0"
                onMouseEnter={() => setActiveDept(dept.slug)}
              >
                <Link
                  to={`/category/${dept.slug}`}
                  className={`px-2.5 py-1.5 rounded-sm hover:text-[#7b189f] hover:bg-purple-50 transition-colors whitespace-nowrap block ${
                    isActive ? 'text-[#7b189f] bg-purple-50 font-bold' : ''
                  }`}
                >
                  {dept.name}
                </Link>
              </div>
            );
          })}

          {/* Deals & Clearance Tab in Bright Red/Gold */}
          <Link
            to="/products?discount=true"
            className="px-2.5 py-1.5 text-rose-600 font-bold hover:bg-rose-50 rounded-sm whitespace-nowrap flex items-center space-x-1 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Sale & Clearance</span>
          </Link>
        </div>
      </div>

      {/* Popover Mega-Dropdown */}
      {activeDept && (
        <div className="absolute left-0 right-0 top-full bg-white border-b border-gray-200 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="max-w-7xl mx-auto p-6">
            {(() => {
              const current = departments.find((d) => d.slug === activeDept);
              if (!current) return null;

              return (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Department Overview */}
                  <div className="md:col-span-1 border-r border-gray-100 pr-6">
                    <h3 className="text-base font-bold text-gray-900 mb-1">{current.name}</h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Explore top-rated styles, trending designer collections, and everyday values.
                    </p>
                    <Link
                      to={`/category/${current.slug}`}
                      className="inline-flex items-center text-xs font-bold text-[#7b189f] hover:underline"
                    >
                      <span>Shop All {current.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </Link>
                  </div>

                  {/* Subcategories Grid */}
                  <div className="md:col-span-2 grid grid-cols-2 gap-x-6 gap-y-2">
                    <div className="text-xs font-bold uppercase text-gray-400 mb-2 col-span-2">
                      Popular Categories
                    </div>
                    {current.subcategories?.map((sub) => (
                      <Link
                        key={sub.slug}
                        to={`/category/${sub.slug}`}
                        className="text-xs text-gray-600 hover:text-[#7b189f] py-1 flex items-center justify-between group"
                      >
                        <span className="group-hover:translate-x-0.5 transition-transform">{sub.name}</span>
                        {sub.productCount > 0 && (
                          <span className="text-[10px] text-gray-400">({sub.productCount})</span>
                        )}
                      </Link>
                    ))}
                  </div>

                  {/* Featured Banner / Promo */}
                  <div className="md:col-span-1 bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100 flex flex-col justify-between">
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-[#7b189f] text-white text-[10px] font-bold rounded-sm uppercase tracking-wider mb-2">
                        Wayfair Style Picks
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 mb-1">
                        Up to 50% Off {current.name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        Handcrafted woods, rich performance velvet, and fast free shipping to your door.
                      </p>
                    </div>
                    <Link
                      to={`/category/${current.slug}?sort=discount`}
                      className="mt-3 text-xs font-bold text-[#7b189f] hover:underline flex items-center"
                    >
                      <span>Explore Deals</span>
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </nav>
  );
}
