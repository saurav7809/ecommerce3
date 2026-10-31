import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  Heart,
  ShoppingBag,
  Check,
  ChevronRight,
  MessageSquare,
  Wrench,
  Sparkles,
} from 'lucide-react';
import {
  useGetProductBySlugQuery,
  useGetSimilarProductsQuery,
  useGetProductReviewsQuery,
  useGetReviewStatsQuery,
  useCreateReviewMutation,
} from '../store/apiSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { addToCart } from '../store/cartSlice';
import { toggleWishlist } from '../store/wishlistSlice';
import { addToast, openAuthModal, openAiDrawer } from '../store/uiSlice';
import { formatCurrency, formatEstimatedDelivery, calculateSavings } from '../lib/utils';
import ProductGrid from '../components/product/ProductGrid';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const wishlist = useAppSelector((state) => state.wishlist.items);

  const { data: product, isLoading, isError } = useGetProductBySlugQuery(slug || '');
  const { data: similarProducts } = useGetSimilarProductsQuery(product?.id || 0, {
    skip: !product?.id,
  });
  const { data: reviewsData } = useGetProductReviewsQuery(
    { productId: product?.id || 0, size: 10 },
    { skip: !product?.id }
  );
  const { data: reviewStats } = useGetReviewStatsQuery(product?.id || 0, {
    skip: !product?.id,
  });
  const [createReviewApi, { isLoading: isReviewSubmitting }] = useCreateReviewMutation();

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'dimensions' | 'assembly' | 'shipping'>('overview');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-8">
        <div className="h-4 bg-gray-200 rounded-sm w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded-sm w-1/4" />
            <div className="h-8 bg-gray-200 rounded-sm w-3/4" />
            <div className="h-6 bg-gray-200 rounded-sm w-1/3" />
            <div className="h-24 bg-gray-200 rounded-xl w-full" />
            <div className="h-12 bg-gray-200 rounded-xl w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
        <p className="text-sm text-gray-500 mt-2">The requested home piece might have moved or been updated.</p>
        <Link
          to="/products"
          className="mt-6 inline-block px-6 py-2.5 rounded-full bg-[#7b189f] text-white text-xs font-bold hover:bg-[#581172]"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  const isFavorite = wishlist.some((item) => item.id === product.id);
  const savings = calculateSavings(product.compareAtPrice, product.price);
  const images = product.images && product.images.length > 0 ? product.images : [product.primaryImage || ''];

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity, openDrawer: true }));
    dispatch(addToast({ message: `Added ${quantity} × "${product.name}" to cart`, type: 'success' }));
  };

  const handleToggleWishlist = () => {
    dispatch(toggleWishlist(product));
    dispatch(
      addToast({
        message: isFavorite ? 'Removed from favorites' : 'Saved to favorites',
        type: 'info',
      })
    );
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      dispatch(openAuthModal('login'));
      return;
    }

    try {
      await createReviewApi({
        productId: product.id,
        rating: newRating,
        title: newTitle.trim(),
        comment: newComment.trim(),
      }).unwrap();
      dispatch(addToast({ message: 'Review submitted successfully!', type: 'success' }));
      setIsReviewModalOpen(false);
      setNewTitle('');
      setNewComment('');
    } catch (err: any) {
      dispatch(
        addToast({
          message: err?.data?.detail || 'You may only submit one review per purchased product.',
          type: 'error',
        })
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-1.5 text-xs text-gray-500 flex-wrap">
        <Link to="/" className="hover:text-[#7b189f]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link to="/category/furniture" className="hover:text-[#7b189f]">
          {product.departmentName || 'Furniture'}
        </Link>
        {product.categorySlug && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link to={`/category/${product.categorySlug}`} className="hover:text-[#7b189f]">
              {product.categoryName}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-semibold text-gray-800 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Interactive Image Gallery (7 cols) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails rail */}
          <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto sm:max-h-[550px] no-scrollbar shrink-0">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIdx(idx)}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-gray-50 ${
                  selectedImageIdx === idx
                    ? 'border-[#7b189f] shadow-md scale-95'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Selected Image */}
          <div className="flex-1 relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
            <img
              src={images[selectedImageIdx] || images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {savings.percentage > 0 && (
              <div className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-sm shadow-md uppercase tracking-wider">
                Save {savings.percentage}%
              </div>
            )}
            <button
              onClick={handleToggleWishlist}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-rose-600 shadow-md backdrop-blur-xs transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'text-rose-600 fill-rose-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right: Product Buy Box (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-1">
              {product.brand || 'HomeNest Signature'}
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Ratings and Reviews */}
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 4.8)
                        ? 'fill-amber-400 stroke-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-900">
                {(product.rating || 4.8).toFixed(1)}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <a href="#reviews" className="text-xs font-semibold text-[#7b189f] hover:underline">
                {product.reviewCount || 42} Customer Reviews
              </a>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-2">
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-black text-gray-900">
                {formatCurrency(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-base text-gray-400 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
            </div>

            {savings.amount > 0 && (
              <p className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
                <span>You save {formatCurrency(savings.amount)} ({savings.percentage}% off)</span>
              </p>
            )}
            <p className="text-[11px] text-gray-500">
              Price includes all local taxes & GST. Flexible EMI available on checkout.
            </p>
          </div>

          {/* Material & Color Attributes */}
          <div className="space-y-3">
            {product.color && (
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700">Color Finish:</span>
                <span className="font-semibold text-gray-900">{product.color}</span>
              </div>
            )}
            {product.material && (
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700">Material:</span>
                <span className="font-semibold text-gray-900">{product.material}</span>
              </div>
            )}
            {product.style && (
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700">Style Aesthetic:</span>
                <span className="font-semibold text-gray-900">{product.style}</span>
              </div>
            )}
            {product.dimensions && (
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700">Dimensions:</span>
                <span className="font-semibold text-gray-900">{product.dimensions}</span>
              </div>
            )}
          </div>

          {/* Stock & Delivery Promise */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>In Stock — Ready for Fast Dispatch</span>
            </div>

            <div className="flex items-start space-x-2.5 text-xs text-gray-600">
              <Truck className="w-4 h-4 text-[#7b189f] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">
                  Estimated Delivery: {formatEstimatedDelivery(2, 5)}
                </p>
                <p className="text-[11px] text-gray-500">Free door delivery on this order.</p>
              </div>
            </div>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-3">
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 font-bold"
                >
                  -
                </button>
                <span className="px-4 py-2 font-bold text-sm text-gray-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(20, quantity + 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 py-3 px-6 rounded-xl bg-[#7b189f] hover:bg-[#581172] text-white text-sm font-bold flex items-center justify-center space-x-2 transition-transform hover:-translate-y-0.5 shadow-lg disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
              </button>
            </div>

            <button
              onClick={() => dispatch(openAiDrawer())}
              className="w-full py-2.5 px-4 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-[#7b189f] text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-[#c68a0c]" />
              <span>Ask AI Designer: "How would this look in my room?"</span>
            </button>
          </div>

          {/* Value Props Strip */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-[11px] text-gray-600">
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-[#7b189f]" />
              <span>30-Day Easy Returns</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#7b189f]" />
              <span>1-Year Craft Warranty</span>
            </div>
            <div className="flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-[#7b189f]" />
              <span>Expert Assembly Included</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-[#7b189f]" />
              <span>100% Genuine Materials</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Tabs for Specifications */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
        <div className="flex border-b border-gray-100 text-xs font-bold">
          {[
            { id: 'overview', label: 'Overview & Details' },
            { id: 'dimensions', label: 'Dimensions & Weights' },
            { id: 'assembly', label: 'Assembly & Care' },
            { id: 'shipping', label: 'Shipping & Returns' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3.5 text-center transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#7b189f] text-[#7b189f] bg-purple-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 text-sm text-gray-700 leading-relaxed">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Designer Summary</h3>
              <p>{product.description || 'Crafted with premium materials and thoughtful proportions.'}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div><strong>Room Destination:</strong> {product.room || 'Living Room'}</div>
                <div><strong>Color Palette:</strong> {product.color || 'Natural'}</div>
                <div><strong>Primary Material:</strong> {product.material || 'Solid Hardwood'}</div>
                <div><strong>Design Aesthetic:</strong> {product.style || 'Contemporary'}</div>
              </div>
            </div>
          )}

          {activeTab === 'dimensions' && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900">Product Measurements</h3>
              <p><strong>Overall Dimensions:</strong> {product.dimensions || 'Standard home dimensions'}</p>
              <p><strong>Total Item Weight:</strong> {product.weight || 'Solid sturdy build'}</p>
              <p className="text-xs text-gray-500 mt-2">
                Tip: Measure your doorways and entry hallways prior to delivery to ensure smooth placement.
              </p>
            </div>
          )}

          {activeTab === 'assembly' && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900">Assembly Instructions</h3>
              <p>
                {product.assemblyRequired
                  ? 'Partial assembly required. All hardware, tools, and visual step-by-step instructions included in package.'
                  : 'No assembly required. Arrives fully assembled and ready for immediate placement.'}
              </p>
              <p className="text-xs text-gray-500">
                Care: Spot clean with a damp lint-free cloth. Avoid abrasive detergents. Keep away from direct excessive sunlight.
              </p>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900">Delivery & Return Terms</h3>
              <p>Complimentary doorstep freight delivery. Track your package live from order placement to room delivery.</p>
              <p>Returns accepted within {product.returnPolicyDays || 30} days of delivery in original packaging.</p>
            </div>
          )}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section id="reviews" className="space-y-6 pt-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <p className="text-xs text-gray-500 mt-1">Real feedback from verified home owners</p>
          </div>
          <button
            onClick={() => {
              if (!isAuthenticated) {
                dispatch(openAuthModal('login'));
              } else {
                setIsReviewModalOpen(true);
              }
            }}
            className="px-5 py-2.5 rounded-full bg-[#7b189f] text-white text-xs font-bold hover:bg-[#581172] transition-colors self-start sm:self-auto"
          >
            Write a Review
          </button>
        </div>

        {/* Rating Breakdown Card */}
        {reviewStats && (
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col md:flex-row items-center gap-8">
            <div className="text-center md:border-r md:border-gray-200 md:pr-8 shrink-0">
              <span className="text-4xl font-black text-gray-900">
                {(reviewStats.averageRating || 4.8).toFixed(1)}
              </span>
              <div className="flex items-center justify-center text-amber-500 my-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                ))}
              </div>
              <p className="text-xs text-gray-500">Based on {reviewStats.totalReviews} reviews</p>
            </div>

            {/* Histogram bars */}
            <div className="flex-1 w-full space-y-1.5 text-xs">
              {reviewStats.histogram.map((bar) => (
                <div key={bar.stars} className="flex items-center space-x-2">
                  <span className="w-12 text-gray-600 font-medium">{bar.stars} stars</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${bar.percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-gray-400">{bar.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="divide-y divide-gray-100">
          {reviewsData?.content && reviewsData.content.length > 0 ? (
            reviewsData.content.map((review) => (
              <div key={review.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < review.rating ? 'fill-amber-400 stroke-amber-400' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-900">{review.title}</span>
                  </div>
                  <span className="text-[11px] text-gray-400">{review.createdAt?.split('T')[0]}</span>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed">{review.comment}</p>

                <div className="flex items-center space-x-2 text-[11px] text-gray-500">
                  <span className="font-semibold text-gray-800">{review.authorName}</span>
                  {review.verifiedPurchase && (
                    <span className="inline-flex items-center text-emerald-700 font-bold">
                      <Check className="w-3 h-3 mr-0.5" />
                      Verified Purchase
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 py-6 text-center">
              Be the first to review this piece and help other homeowners design their space!
            </p>
          )}
        </div>
      </section>

      {/* Write Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Write a Review</h3>
            <p className="text-xs text-gray-500 mb-4">{product.name}</p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Your Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 text-amber-500 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newRating ? 'fill-amber-400 stroke-amber-400' : 'text-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Headline</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Gorgeous addition to our living room!"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Review Comments</label>
                <textarea
                  required
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share details about the quality, material feel, color accuracy, and assembly..."
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReviewSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#7b189f] hover:bg-[#581172] rounded-lg disabled:opacity-50"
                >
                  {isReviewSubmitting ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete the Look / Similar Products */}
      {similarProducts && similarProducts.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-gray-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Complete the Look</h2>
            <p className="text-xs text-gray-500 mt-1">
              Complementary pieces curated to coordinate with this style
            </p>
          </div>
          <ProductGrid products={similarProducts} />
        </section>
      )}
    </div>
  );
}
