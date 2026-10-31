// ─── Domain Types ────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  variant: string;
  description: string;
  inventory: number;
  featured: boolean;
}

export interface CartLine {
  product: Product;
  quantity: number;
}

export interface Order {
  reference: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
}

export interface Account {
  name: string;
  email: string;
  token: string;
}

// ─── Request / Response shapes ───────────────────────────────────────────────

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
}

export interface CreateOrderRequest {
  email: string;
  fullName: string;
  deliveryAddress: string;
  items: { productId: number; quantity: number }[];
}

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface RecommendationRequest {
  products: { id: number; category: string; featured: boolean }[];
  cart_ids: number[];
  limit?: number;
}

export interface RecommendationResponse {
  productIds: number[];
  reason: string;
}

// ─── Razorpay global types ───────────────────────────────────────────────────

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string };
  theme: { color: string };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (
        event: 'payment.failed',
        handler: (response: { error?: { description?: string } }) => void,
      ) => void;
    };
  }
}

