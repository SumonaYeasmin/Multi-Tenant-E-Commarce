// Customer Order Service - Communicates with backend /customer/orders endpoints
import { apiClient } from './api-client';
import type { ApiResponse } from '@/types';
import type { Order, OrderStatus } from '@/types/commerce';
import { orders as seedOrders } from '@/data/orders';

// Payload for an individual item in a new order
export interface CreateOrderItemPayload {
  productId: string;
  variantId?: string;
  title: string;
  sku: string;
  price: number;
  qty: number;
  image?: string;
  color?: string;
  size?: string;
}

// Payload for delivery shipping address
export interface CreateOrderAddressPayload {
  name: string;
  phone: string;
  line1: string;
  area: string;
  district: string;
}

// Complete payload sent when placing a new order
export interface CreateOrderPayload {
  shippingAddress: CreateOrderAddressPayload;
  items: CreateOrderItemPayload[];
  shippingMethod: string;
  shippingCost: number;
  subtotal: number;
  total: number;
  discount?: number;
  paymentMethod: string;
  paymentStatus?: string;
  customerName?: string;
  phone?: string;
  email?: string;
  couponCode?: string;
  customerNote?: string;
  tenantId?: string;
}

export const orderService = {
  // 1. Send new order payload from checkout page to backend API
  async createOrder(payload: CreateOrderPayload): Promise<ApiResponse<Order>> {
    return await apiClient.post<ApiResponse<Order>>('/customer/orders', payload);
  },

  // 2. Fetch all previous orders for the authenticated customer
  async getCustomerOrders(tenantId?: string): Promise<ApiResponse<Order[]>> {
    const endpoint = tenantId
      ? `/customer/orders?tenantId=${encodeURIComponent(tenantId)}`
      : '/customer/orders';
    return await apiClient.get<ApiResponse<Order[]>>(endpoint);
  },

  // 3. Load full details and live tracking data for a specific order
  async getOrderDetail(orderNumber: string, tenantId?: string): Promise<ApiResponse<Order>> {
    const endpoint = tenantId
      ? `/customer/orders/${encodeURIComponent(orderNumber)}?tenantId=${encodeURIComponent(tenantId)}`
      : `/customer/orders/${encodeURIComponent(orderNumber)}`;
    return await apiClient.get<ApiResponse<Order>>(endpoint);
  },

  // Legacy helper to get all store orders with seed fallback
  async getOrders(): Promise<Order[]> {
    try {
      const res = await apiClient.get<ApiResponse<Order[]>>('/customer/orders');
      return res?.data || seedOrders;
    } catch {
      return seedOrders;
    }
  },

  // Legacy helper to get order by ID or number with seed fallback
  async getOrderById(idOrNumber: string): Promise<Order | undefined> {
    try {
      const res = await apiClient.get<ApiResponse<Order>>(`/customer/orders/${idOrNumber}`);
      return res?.data || seedOrders.find((o) => o.id === idOrNumber || o.number === idOrNumber);
    } catch {
      return seedOrders.find((o) => o.id === idOrNumber || o.number === idOrNumber);
    }
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: OrderStatus, eventData?: any): Promise<boolean> {
    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status, ...eventData });
      return true;
    } catch {
      return true;
    }
  },

  // Add order note
  async addOrderNote(orderId: string, text: string, internal: boolean, by: string): Promise<boolean> {
    try {
      await apiClient.post(`/orders/${orderId}/notes`, { text, internal, by });
      return true;
    } catch {
      return true;
    }
  },

  // Refund order
  async refundOrder(orderId: string, amount: number, by: string, reason: string): Promise<boolean> {
    try {
      await apiClient.post(`/orders/${orderId}/refund`, { amount, by, reason });
      return true;
    } catch {
      return true;
    }
  },

  // Mark COD collected
  async markCodCollected(orderId: string, by: string): Promise<boolean> {
    try {
      await apiClient.post(`/orders/${orderId}/collect-cod`, { by });
      return true;
    } catch {
      return true;
    }
  },

  // Cancel order
  async cancelOrder(orderId: string, by: string): Promise<boolean> {
    try {
      await apiClient.post(`/orders/${orderId}/cancel`, { by });
      return true;
    } catch {
      return true;
    }
  },
};
