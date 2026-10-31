// ─── Centralised API client ───────────────────────────────────────────────────
// All fetch calls go through here so the base URL and auth header
// are always consistent.

import axios from 'axios';
import type {
  AuthResponse,
  CreateOrderRequest,
  LoginRequest,
  Order,
  PaymentOrder,
  Product,
  RecommendationRequest,
  RecommendationResponse,
  RegisterRequest,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const AI_URL  = import.meta.env.VITE_AI_URL  || 'http://localhost:8001';

// ── axios instance ────────────────────────────────────────────────────────────
export const api = axios.create({ baseURL: API_URL });

// Attach JWT on every request if present
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('cg.account');
    if (raw) {
      const account: { token: string } = JSON.parse(raw);
      if (account?.token) config.headers.Authorization = `Bearer ${account.token}`;
    }
  } catch { /* ignore */ }
  return config;
});

// ── Products ──────────────────────────────────────────────────────────────────
export async function fetchProducts(category?: string, q?: string): Promise<Product[]> {
  const params: Record<string, string> = {};
  if (category && category !== 'All') params.category = category;
  if (q) params.q = q;
  const { data } = await api.get<Product[]>('/api/products', { params });
  return data;
}

export async function fetchProduct(id: number): Promise<Product> {
  const { data } = await api.get<Product>(`/api/products/${id}`);
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/api/auth/register', payload);
  return data;
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/api/auth/login', payload);
  return data;
}

// ── Orders ────────────────────────────────────────────────────────────────────
export async function createOrder(payload: CreateOrderRequest): Promise<Order> {
  const { data } = await api.post<Order>('/api/orders', payload);
  return data;
}

export async function fetchMyOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>('/api/orders');
  return data;
}

export async function fetchOrderStatus(reference: string): Promise<Order> {
  const { data } = await api.get<Order>(`/api/orders/${reference}`);
  return data;
}

// ── Razorpay ──────────────────────────────────────────────────────────────────
export async function startPayment(reference: string): Promise<PaymentOrder> {
  const { data } = await api.post<PaymentOrder>('/api/payments/razorpay/order', { reference });
  return data;
}

export async function verifyPayment(payload: {
  reference: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<{ reference: string; status: string; paymentStatus: string }> {
  const { data } = await api.post('/api/payments/razorpay/verify', payload);
  return data;
}

// ── AI Recommendations & Assistant ──────────────────────────────────────────
export async function fetchRecommendations(
  req: RecommendationRequest,
): Promise<RecommendationResponse> {
  const { data } = await axios.post<RecommendationResponse>(
    `${AI_URL}/api/recommendations`,
    req,
  );
  return data;
}

export async function askAssistant(
  message: string,
  catalog: Product[],
): Promise<{ reply: string; suggestedProductIds: number[] }> {
  const payload = {
    message,
    catalog: catalog.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description,
      variant: p.variant,
      featured: p.featured,
    })),
  };
  const { data } = await axios.post<{ reply: string; suggestedProductIds: number[] }>(
    `${AI_URL}/api/assistant`,
    payload,
  );
  return data;
}

// ── Health ────────────────────────────────────────────────────────────────────
export async function checkHealth(): Promise<boolean> {
  try {
    await api.get('/health', { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

