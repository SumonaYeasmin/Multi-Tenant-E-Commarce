import { apiClient } from './api-client';
import { orders as seedOrders } from '@/data/orders';
import type { Order, OrderStatus } from '@/types/commerce';

export const orderService = {
  async getOrders(): Promise<Order[]> {
    try {
      return await apiClient.get<Order[]>('/orders');
    } catch {
      return seedOrders;
    }
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    try {
      return await apiClient.get<Order>(`/orders/${id}`);
    } catch {
      return seedOrders.find((o) => o.id === id);
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, eventData?: any): Promise<boolean> {
    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status, ...eventData });
      return true;
    } catch {
      return true;
    }
  },

  async addOrderNote(orderId: string, text: string, internal: boolean, by: string): Promise<boolean> {
    try {
      await apiClient.post(`/orders/${orderId}/notes`, { text, internal, by });
      return true;
    } catch {
      return true;
    }
  },

  async refundOrder(orderId: string, amount: number, by: string, reason: string): Promise<boolean> {
    try {
      await apiClient.post(`/orders/${orderId}/refund`, { amount, by, reason });
      return true;
    } catch {
      return true;
    }
  },

  async markCodCollected(orderId: string, by: string): Promise<boolean> {
    try {
      await apiClient.post(`/orders/${orderId}/collect-cod`, { by });
      return true;
    } catch {
      return true;
    }
  },

  async cancelOrder(orderId: string, by: string): Promise<boolean> {
    try {
      await apiClient.post(`/orders/${orderId}/cancel`, { by });
      return true;
    } catch {
      return true;
    }
  },
};
