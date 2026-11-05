import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  DepartmentSummary,
  ProductSummary,
  ProductDetail,
  ProductFacets,
  PageResponse,
  CartQuote,
  PaymentConfig,
  AuthResponse,
  RegistrationResponse,
  User,
  OrderView,
  RazorpayOrder,
  ReviewView,
  ReviewStats,
  AddressView,
  AddressDetails,
  AdminStats,
} from '../types';
import { RootState } from './index';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const AI_BASE_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8001';

type ApiProductSummary = ProductSummary & {
  imageUrl?: string;
  hoverImageUrl?: string;
  category?: string;
};

const normalizeProductSummaries = (products: ApiProductSummary[]): ProductSummary[] =>
  products.map((product) => ({
    ...product,
    primaryImage: product.primaryImage || product.imageUrl,
    secondaryImage: product.secondaryImage || product.hoverImageUrl,
    categoryName: product.categoryName || product.category,
  }));

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Products', 'Categories', 'Orders', 'Cart', 'Reviews', 'Addresses', 'Admin', 'User'],
  endpoints: (builder) => ({
    // Catalog
    getDepartments: builder.query<DepartmentSummary[], void>({
      query: () => '/api/categories/tree',
      providesTags: ['Categories'],
    }),
    getProducts: builder.query<PageResponse<ProductSummary>, Record<string, any>>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              value.forEach((v) => queryParams.append(key, v.toString()));
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });
        return `/api/products?${queryParams.toString()}`;
      },
      providesTags: ['Products'],
    }),
    getProductFacets: builder.query<ProductFacets, Record<string, any>>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
        return `/api/products/facets?${queryParams.toString()}`;
      },
      providesTags: ['Products'],
    }),
    getProductBySlug: builder.query<ProductDetail, string>({
      query: (slug) => `/api/products/${slug}`,
      providesTags: (_result, _error, slug) => [{ type: 'Products', id: slug }],
    }),
    getSimilarProducts: builder.query<ProductSummary[], string>({
      query: (slug) => `/api/products/${slug}/similar?limit=6`,
      transformResponse: normalizeProductSummaries,
    }),
    getRecommendations: builder.query<ProductSummary[], { viewedIds?: number[]; excludeIds?: number[] }>({
      query: ({ viewedIds = [], excludeIds = [] }) => {
        const params = new URLSearchParams();
        if (viewedIds.length) params.set('viewedIds', viewedIds.join(','));
        if (excludeIds.length) params.set('excludeIds', excludeIds.join(','));
        params.set('limit', '8');
        return `/api/recommendations?${params.toString()}`;
      },
      transformResponse: normalizeProductSummaries,
    }),
    getFrequentlyBoughtTogether: builder.query<ProductSummary[], number>({
      query: (productId) => `/api/recommendations/frequently-bought-together?productId=${productId}&limit=4`,
      transformResponse: normalizeProductSummaries,
    }),

    // Cart Quote
    getCartQuote: builder.mutation<CartQuote, { items: { productId: number; quantity: number }[] }>({
      query: (body) => ({
        url: '/api/cart/quote',
        method: 'POST',
        body,
      }),
    }),

    // Auth
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/api/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User', 'Orders', 'Addresses'],
    }),
    register: builder.mutation<
      RegistrationResponse,
      { name: string; email: string; password: string; phone?: string; accountType?: 'CUSTOMER' | 'SELLER' }
    >({
      query: (body) => ({
        url: '/api/auth/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    googleLogin: builder.mutation<AuthResponse, { idToken: string }>({
      query: (body) => ({ url: '/api/auth/google', method: 'POST', body }),
      invalidatesTags: ['User', 'Orders', 'Addresses'],
    }),
    requestEmailVerification: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: '/api/auth/email-verification/request', method: 'POST', body }),
    }),
    verifyEmail: builder.mutation<{ message: string }, { email: string; code: string }>({
      query: (body) => ({ url: '/api/auth/email-verification/verify', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    requestPasswordReset: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: '/api/auth/password-reset/request', method: 'POST', body }),
    }),
    resetPassword: builder.mutation<{ message: string }, { email: string; code: string; newPassword: string }>({
      query: (body) => ({ url: '/api/auth/password-reset', method: 'POST', body }),
    }),
    getCurrentUser: builder.query<User, void>({
      query: () => '/api/auth/me',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<User, { fullName: string; phone?: string }>({
      query: (body) => ({ url: '/api/auth/me', method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),
    requestPhoneVerification: builder.mutation<{ message: string }, void>({
      query: () => ({ url: '/api/auth/phone-verification/request', method: 'POST' }),
    }),
    verifyPhone: builder.mutation<{ message: string }, { code: string }>({
      query: (body) => ({ url: '/api/auth/phone-verification/verify', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),

    // Addresses
    getAddresses: builder.query<AddressView[], void>({
      query: () => '/api/addresses',
      providesTags: ['Addresses'],
    }),
    createAddress: builder.mutation<AddressView, { address: AddressDetails; makeDefault?: boolean }>({
      query: (body) => ({
        url: '/api/addresses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Addresses'],
    }),
    deleteAddress: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Addresses'],
    }),

    // Orders
    placeOrder: builder.mutation<
      OrderView,
      {
        items: { productId: number; quantity: number }[];
        shippingAddress: AddressDetails;
        paymentMethod: string;
        saveAddress?: boolean;
      }
    >({
      query: (body) => ({
        url: '/api/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Orders', 'Products', 'Admin'],
    }),
    getMyOrders: builder.query<PageResponse<OrderView>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 10 } = {}) => `/api/orders?page=${page}&size=${size}`,
      providesTags: ['Orders'],
    }),
    getOrderByReference: builder.query<OrderView, string>({
      query: (reference) => `/api/orders/${reference}`,
      providesTags: (_res, _err, ref) => [{ type: 'Orders', id: ref }],
    }),
    cancelOrder: builder.mutation<OrderView, string>({
      query: (reference) => ({
        url: `/api/orders/${reference}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Orders', 'Products', 'Admin'],
    }),

    // Payment
    getPaymentConfig: builder.query<PaymentConfig, void>({
      query: () => '/api/payment/config',
    }),
    createRazorpayOrder: builder.mutation<RazorpayOrder, { orderReference: string }>({
      query: (body) => ({
        url: '/api/payment/razorpay/order',
        method: 'POST',
        body,
      }),
    }),
    verifyRazorpayPayment: builder.mutation<
      OrderView,
      {
        orderReference: string;
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
      }
    >({
      query: (body) => ({
        url: '/api/payment/razorpay/verify',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Orders'],
    }),

    // Reviews
    getProductReviews: builder.query<PageResponse<ReviewView>, { productId: number; page?: number; size?: number }>({
      query: ({ productId, page = 0, size = 10 }) => `/api/products/${productId}/reviews?page=${page}&size=${size}`,
      providesTags: (_res, _err, { productId }) => [{ type: 'Reviews', id: productId }],
    }),
    getReviewStats: builder.query<ReviewStats, number>({
      query: (productId) => `/api/products/${productId}/reviews/stats`,
      providesTags: (_res, _err, id) => [{ type: 'Reviews', id }],
    }),
    createReview: builder.mutation<ReviewView, { productId: number; rating: number; title: string; comment: string }>({
      query: ({ productId, ...body }) => ({
        url: `/api/products/${productId}/reviews`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, { productId }) => [{ type: 'Reviews', id: productId }, 'Products'],
    }),

    // Admin / Seller
    getAdminStats: builder.query<AdminStats, void>({
      query: () => '/api/admin/stats',
      providesTags: ['Admin'],
    }),
    getAdminOrders: builder.query<PageResponse<OrderView>, { page?: number; size?: number; status?: string }>({
      query: ({ page = 0, size = 20, status = '' } = {}) =>
        `/api/admin/orders?page=${page}&size=${size}${status ? `&status=${status}` : ''}`,
      providesTags: ['Admin', 'Orders'],
    }),
    updateOrderStatus: builder.mutation<OrderView, { reference: string; status: string; notes?: string }>({
      query: ({ reference, ...body }) => ({
        url: `/api/admin/orders/${reference}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Admin', 'Orders', 'Products'],
    }),
    getAdminProducts: builder.query<PageResponse<any>, { page?: number; size?: number; query?: string }>({
      query: ({ page = 0, size = 20, query = '' } = {}) =>
        `/api/manage/products?page=${page}&size=${size}${query ? `&query=${encodeURIComponent(query)}` : ''}`,
      providesTags: ['Admin', 'Products'],
    }),
    createProduct: builder.mutation<any, any>({
      query: (body) => ({
        url: '/api/manage/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Products', 'Admin'],
    }),
    updateProduct: builder.mutation<any, { id: number; data: any }>({
      query: ({ id, data }) => ({
        url: `/api/manage/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Products', 'Admin'],
    }),
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/manage/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products', 'Admin'],
    }),

    // AI Designer
    askAiAssistant: builder.mutation<
      { reply: string; suggestedProductIds: number[]; suggestedProducts?: ProductSummary[] },
      { message: string; history?: any[] }
    >({
      queryFn: async (arg) => {
        try {
          const resp = await fetch(`${AI_BASE_URL}/api/assistant`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: arg.message, history: arg.history || [] }),
          });
          if (!resp.ok) {
            throw new Error(`AI assistant error ${resp.status}`);
          }
          const data = await resp.json();
          return { data };
        } catch (err: any) {
          return {
            data: {
              reply:
                "I'm here to help you design and furnish your dream space! Explore our best-selling living room collections, accent chairs, and plush rugs.",
              suggestedProductIds: [],
            },
          };
        }
      },
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useGetProductsQuery,
  useGetProductFacetsQuery,
  useGetProductBySlugQuery,
  useGetSimilarProductsQuery,
  useGetRecommendationsQuery,
  useGetFrequentlyBoughtTogetherQuery,
  useGetCartQuoteMutation,
  useLoginMutation,
  useRegisterMutation,
  useGoogleLoginMutation,
  useRequestEmailVerificationMutation,
  useVerifyEmailMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useRequestPhoneVerificationMutation,
  useVerifyPhoneMutation,
  useGetAddressesQuery,
  useCreateAddressMutation,
  useDeleteAddressMutation,
  usePlaceOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByReferenceQuery,
  useCancelOrderMutation,
  useGetPaymentConfigQuery,
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
  useGetProductReviewsQuery,
  useGetReviewStatsQuery,
  useCreateReviewMutation,
  useGetAdminStatsQuery,
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetAdminProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useAskAiAssistantMutation,
} = apiSlice;
