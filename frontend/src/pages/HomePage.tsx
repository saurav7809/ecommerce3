import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Truck, RotateCcw, Award, Star } from 'lucide-react';
import { useGetProductsQuery } from '../store/apiSlice';
import ProductGrid from '../components/product/ProductGrid';
import { useAppDispatch } from '../store';
import { openAiDrawer } from '../store/uiSlice';

const SHOP_BY_ROOMS = [
  {
    name: 'Living Room',
    slug: 'furniture',
    desc: 'Deep plush sofas, walnut coffee tables, and layered lighting',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    tag: 'Up to 50% Off',
  },
  {
    name: 'Bedroom Sanctuary',
    slug: 'furniture',
    desc: 'Upholstered platform beds, breathable linens, and nightstands',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    tag: 'Best Sellers',
  },
  {
    name: 'Dining & Entertaining',
    slug: 'kitchen-dining',
    desc: 'Solid live-edge dining tables and upholstered dining chairs',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
    tag: 'New Arrivals',
  },
  {
    name: 'Home Office',
    slug: 'furniture',
    desc: 'Ergonomic task chairs, solid writing desks, and shelving',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
    tag: 'Work in Comfort',
  },
  {
    name: 'Outdoor Patio & Deck',
    slug: 'outdoor',
    desc: 'Weather-resistant teak seating, fire tables, and poolside loungers',
    image: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=800&q=80',
    tag: 'Spring Ready',
  },
  {
    name: 'Rugs & Textured Accents',
    slug: 'rugs',
    desc: 'Hand-knotted wool rugs, runner styles, and artisan ceramics',
    image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
    tag: 'Designer Finds',
  },
];

const CATEGORY_TILES = [
  { name: 'Sofas & Sectionals', slug: 'sofas', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80' },
  { name: 'Accent Chairs', slug: 'accent-chairs', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80' },
  { name: 'Dining Sets', slug: 'dining-sets', img: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=400&q=80' },
  { name: 'Beds & Frames', slug: 'beds', img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80' },
  { name: 'Area Rugs', slug: 'area-rugs', img: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=400&q=80' },
  { name: 'Designer Lighting', slug: 'lighting', img: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=400&q=80' },
  { name: 'Storage & Baskets', slug: 'storage-org', img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=400&q=80' },
  { name: 'Outdoor Seating', slug: 'outdoor', img: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=400&q=80' },
];

export default function HomePage() {
  const dispatch = useAppDispatch();

  // Fetch featured products
  const { data: featuredData, isLoading: isFeaturedLoading } = useGetProductsQuery({
    featured: true,
    size: 8,
  });

  // Fetch clearance / high-discount deals
  const { data: dealsData, isLoading: isDealsLoading } = useGetProductsQuery({
    sort: 'discount',
    size: 4,
  });

  return (
    <div className="space-y-12 pb-16">
      {/* Wayfair Hero Banner */}
      <section className="relative bg-gradient-to-r from-[#3e0b52] via-[#581172] to-[#7b189f] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-amber-300 uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Wayfair-Style Spring Mega Refresh</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Furniture & Decor That Makes A House <span className="text-amber-300">Home.</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-purple-100 leading-relaxed">
              Explore thousands of considered pieces — from plush velvet sectionals to handcrafted dining sets, all backed by free white-glove door shipping.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 justify-center md:justify-start">
              <Link
                to="/category/furniture"
                className="px-6 py-3 rounded-full bg-white text-[#7b189f] hover:bg-purple-50 text-sm font-extrabold shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Shop Furniture
              </Link>
              <Link
                to="/products?discount=true"
                className="px-6 py-3 rounded-full bg-amber-400 text-gray-950 hover:bg-amber-300 text-sm font-extrabold shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Up to 60% Off Deals
              </Link>
              <button
                onClick={() => dispatch(openAiDrawer())}
                className="px-6 py-3 rounded-full bg-purple-900/60 hover:bg-purple-900 text-white border border-purple-400/40 text-sm font-bold backdrop-blur-md transition-colors flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Ask AI Designer</span>
              </button>
            </div>
          </div>

          {/* Featured Hero Visual */}
          <div className="w-full md:w-1/2 max-w-lg">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 aspect-4/3">
              <img
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80"
                alt="Living room interior"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md rounded-xl p-3 text-gray-900 flex items-center justify-between shadow-md">
                <div>
                  <p className="text-[10px] font-bold uppercase text-[#7b189f]">Featured Living Room</p>
                  <p className="text-xs font-bold">Haven Velvet 3-Piece Sectional</p>
                </div>
                <Link
                  to="/products?query=sofa"
                  className="text-xs font-bold text-[#7b189f] hover:underline flex items-center"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Circles Row */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Explore Home Departments</h2>
          <p className="text-xs text-gray-500 mt-1">Curated collections for every room and style</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {CATEGORY_TILES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="group flex flex-col items-center text-center p-2 rounded-xl hover:bg-purple-50/50 transition-colors"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#7b189f] group-hover:shadow-md transition-all mb-2 bg-gray-100">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs font-bold text-gray-800 group-hover:text-[#7b189f] line-clamp-2">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Wayfair 4 Pillars Banner */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-purple-50 via-white to-pink-50 rounded-2xl border border-purple-100 p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-[#7b189f] text-white rounded-xl shadow-xs">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Free Shipping Over ₹5,000</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Direct to your door, fast and secure</p>
              </div>
            </div>
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-[#7b189f] text-white rounded-xl shadow-xs">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">30-Day Easy Returns</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Try it in your space with peace of mind</p>
              </div>
            </div>
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-[#7b189f] text-white rounded-xl shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Certified Quality Materials</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Kiln-dried solid woods & durable weaves</p>
              </div>
            </div>
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-[#7b189f] text-white rounded-xl shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Trusted By 100,000+ Homes</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Rated 4.8/5 across verified buyers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deals of the Day Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-extrabold uppercase rounded-sm">
                Today's Flash Deals
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Deep Discounts on Best Sellers</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">Special limited-stock pricing on handcrafted furniture</p>
          </div>
          <Link
            to="/products?discount=true"
            className="text-xs font-bold text-[#7b189f] hover:underline flex items-center"
          >
            <span>View All Deals</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <ProductGrid products={dealsData?.content || []} isLoading={isDealsLoading} />
      </section>

      {/* Shop By Room Showcase */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Shop by Room</h2>
          <p className="text-xs text-gray-500 mt-1">
            Complete design blueprints curated by our interior experts
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SHOP_BY_ROOMS.map((room, idx) => (
            <Link
              key={idx}
              to={`/category/${room.slug}`}
              className="group relative rounded-2xl overflow-hidden shadow-md aspect-4/3 flex flex-col justify-end p-6 text-white"
            >
              <img
                src={room.image}
                alt={room.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              <div className="relative z-10">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider mb-2">
                  {room.tag}
                </span>
                <h3 className="text-xl font-bold group-hover:text-amber-300 transition-colors">
                  {room.name}
                </h3>
                <p className="text-xs text-gray-300 mt-1 line-clamp-1">{room.desc}</p>
                <div className="mt-3 inline-flex items-center text-xs font-bold text-amber-300 group-hover:translate-x-1 transition-transform">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Finds Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Featured Designer Picks</h2>
            <p className="text-xs text-gray-500 mt-1">Our most loved everyday essentials</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-[#7b189f] hover:underline flex items-center"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <ProductGrid products={featuredData?.content || []} isLoading={isFeaturedLoading} />
      </section>

      {/* Inspiration & Reviews Banner */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-[#581172] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <div className="flex items-center space-x-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400" />
              ))}
              <span className="text-xs font-bold ml-2 text-white">4.9 / 5 Overall Satisfaction</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black leading-tight">
              "HomeNest made furnishing our entire living room and dining area seamless. Premium solid wood, perfect delivery, and fair pricing."
            </h3>
            <p className="mt-4 text-xs text-purple-200">
              — Priya & Rohan S., Verified HomeNest Buyers (Bengaluru)
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
