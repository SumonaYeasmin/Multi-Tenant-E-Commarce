import { apiClient } from './api-client';
import { returns as seedReturns } from '@/data/orders';
import type { ReturnRequest, ReturnStatus } from '@/types/commerce';

export const returnService = {
  async getReturns(): Promise<ReturnRequest[]> {
    try {
      return await apiClient.get<ReturnRequest[]>('/returns');
    } catch {
      return seedReturns;
    }
  },

  async updateReturn(id: string, status: ReturnStatus, by: string, note?: string): Promise<boolean> {
    try {
      await apiClient.patch(`/returns/${id}`, { status, by, note });
      return true;
    } catch {
      return true;
    }
  },
};
