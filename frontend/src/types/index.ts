export type Role = 'CUSTOMER' | 'SELLER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: Role;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegistrationResponse {
  email: string;
  message: string;
}

export interface CategorySummary {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string;
  displayOrder: number;
  productCount: number;
}

export interface DepartmentSummary extends CategorySummary {
  subcategories: CategorySummary[];
}

export interface ProductSummary {
  id: number;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  discountPercent?: number;
  stock: number;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  room?: string;
  style?: string;
  color?: string;
  material?: string;
  featured: boolean;
  freeShipping: boolean;
  categoryName?: string;
  categorySlug?: string;
  departmentName?: string;
  departmentSlug?: string;
  primaryImage?: string;
  secondaryImage?: string;
}

export interface ProductDetail extends ProductSummary {
  description?: string;
  dimensions?: string;
  weight?: string;
  assemblyRequired?: boolean;
  warranty?: string;
  returnPolicyDays?: number;
  images: string[];
  sellerId?: number;
  sellerName?: string;
}

export interface BucketCount {
  value: string;
  count: number;
}

export interface RangeBucket {
  label: string;
  min?: number;
  max?: number;
  count: number;
}

export interface ProductFacets {
  brands: BucketCount[];
  colors: BucketCount[];
  materials: BucketCount[];
  styles: BucketCount[];
  rooms: BucketCount[];
  priceBuckets: RangeBucket[];
  minPrice: number;
  maxPrice: number;
  totalMatches: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ReviewView {
  id: number;
  rating: number;
  title: string;
  comment: string;
  authorName: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface ReviewHistogram {
  stars: number;
  count: number;
  percentage: number;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  histogram: ReviewHistogram[];
}

export interface CartLineItem {
  product: ProductSummary;
  quantity: number;
}

export interface QuoteLine {
  product: ProductSummary;
  quantity: number;
  lineTotal: number;
  available: boolean;
  message?: string;
}

export interface CartQuote {
  lines: QuoteLine[];
  subtotal: number;
  savings: number;
  shipping: number;
  total: number;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  currency: string;
  unknownProductIds: number[];
}

export interface AddressDetails {
  fullName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface AddressView {
  id: number;
  address: AddressDetails;
  isDefault: boolean;
  createdAt: string;
}

export type OrderStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'RAZORPAY' | 'CASH_ON_DELIVERY';

export interface OrderLineView {
  id: number;
  productId?: number;
  productName: string;
  productSku?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  primaryImage?: string;
}

export interface OrderView {
  id: number;
  reference: string;
  email: string;
  shippingAddress: AddressDetails;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  notes?: string;
  items: OrderLineView[];
  createdAt: string;
}

export interface RazorpayOrder {
  orderReference: string;
  razorpayOrderId: string;
  amountInPaise: number;
  currency: string;
  keyId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

export interface PaymentConfig {
  razorpayEnabled: boolean;
  razorpayKeyId?: string;
  currency: string;
}

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockCount: number;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedProducts?: ProductSummary[];
  timestamp: string;
}
