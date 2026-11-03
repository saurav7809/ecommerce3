import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, RotateCcw, ShieldCheck, Headphones, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-8 border-t border-gray-800">
      {/* Wayfair Value Pillars */}
      <div className="max-w-7xl mx-auto px-4 pb-12 border-b border-gray-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-purple-950/60 text-purple-400 rounded-lg border border-purple-800/50">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Fast & Free Shipping</h4>
              <p className="text-xs text-gray-400 mt-0.5">Complimentary door delivery on all orders over ₹5,000.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-purple-950/60 text-purple-400 rounded-lg border border-purple-800/50">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">30-Day Easy Returns</h4>
              <p className="text-xs text-gray-400 mt-0.5">Shop with total peace of mind. Hassle-free pickups.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-purple-950/60 text-purple-400 rounded-lg border border-purple-800/50">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Certified Craftsmanship</h4>
              <p className="text-xs text-gray-400 mt-0.5">Every piece tested for durability, safety, and finish.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-purple-950/60 text-purple-400 rounded-lg border border-purple-800/50">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Expert Home Support</h4>
              <p className="text-xs text-gray-400 mt-0.5">Interior design guidance & 24/7 post-purchase care.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Links */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#7b189f] flex items-center justify-center text-white font-bold text-lg">
                H
              </div>
              <span className="text-2xl font-black text-white">
                Home<span className="text-[#c68a0c]">Nest</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-3 max-w-sm leading-relaxed">
              HomeNest is an enterprise-grade, Wayfair-style home furnishings destination. We curate gorgeous sofas, solid oak dining sets, plush Moroccan rugs, and designer lighting built for real living.
            </p>
            <div className="mt-4 flex items-center space-x-3 text-xs text-gray-400">
              <span>Razorpay Test Mode Enabled</span>
              <span>•</span>
              <span>PostgreSQL + Spring Boot 3</span>
            </div>
          </div>

          {/* About & Customer Service */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Customer Care</h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link to="/orders" className="hover:text-white">Track Your Order</Link></li>
              <li><Link to="/favorites" className="hover:text-white">Saved Favorites</Link></li>
              <li><a href="#returns" className="hover:text-white">Return Policies</a></li>
              <li><a href="#shipping" className="hover:text-white">Shipping Information</a></li>
              <li><a href="#help" className="hover:text-white">Help & Contact FAQ</a></li>
            </ul>
          </div>

          {/* Shop Departments */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Departments</h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link to="/category/furniture" className="hover:text-white">Living & Bedroom Furniture</Link></li>
              <li><Link to="/category/rugs" className="hover:text-white">Rugs & Runners</Link></li>
              <li><Link to="/category/lighting" className="hover:text-white">Pendants & Lamps</Link></li>
              <li><Link to="/category/outdoor" className="hover:text-white">Patio & Garden</Link></li>
              <li><Link to="/products?discount=true" className="hover:text-rose-400 font-semibold">Sale & Clearance</Link></li>
            </ul>
          </div>

          {/* Architectural Tech Stack info */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Technology Stack</h5>
            <ul className="space-y-1.5 text-[11px] text-gray-400">
              <li>React 19 + TypeScript</li>
              <li>Tailwind CSS + Redux Toolkit</li>
              <li>Spring Boot 3 + Java 21</li>
              <li>Spring Data JPA + PostgreSQL</li>
              <li>Spring Security + JWT</li>
              <li>Python + FastAPI AI Services</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-gray-800 text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>© 2026 HomeNest Inc. Wayfair-style E-Commerce Architecture. Built for local development.</p>
        <p className="flex items-center space-x-1">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>for premium home living</span>
        </p>
      </div>
    </footer>
  );
}
