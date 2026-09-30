import { apiClient } from './api-client';
import { customers as seedCustomers } from '@/data/customers';
import type { Customer } from '@/types/commerce';

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    try {
      return await apiClient.get<Customer[]>('/customers');
    } catch {
      return seedCustomers;
    }
  },

  async getCustomerById(id: string): Promise<Customer | undefined> {
    try {
      return await apiClient.get<Customer>(`/customers/${id}`);
    } catch {
      return seedCustomers.find((c) => c.id === id);
    }
  },

  async toggleStatus(id: string): Promise<boolean> {
    try {
      await apiClient.patch(`/customers/${id}/status`, {});
      return true;
    } catch {
      return true;
    }
  },
};
