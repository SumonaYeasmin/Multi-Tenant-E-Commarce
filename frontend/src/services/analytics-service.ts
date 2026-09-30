import { apiClient } from './api-client';
import { salesSeries, kpis, funnel, salesByPayment, salesByRegion, salesByChannel, topSearches } from '@/data/analytics';

export const analyticsService = {
  async getSalesSeries() {
    try {
      return await apiClient.get('/analytics/sales-series');
    } catch {
      return salesSeries;
    }
  },

  async getKpis() {
    try {
      return await apiClient.get('/analytics/kpis');
    } catch {
      return kpis;
    }
  },

  async getFunnel() {
    try {
      return await apiClient.get('/analytics/funnel');
    } catch {
      return funnel;
    }
  },

  async getSalesByPayment() {
    try {
      return await apiClient.get('/analytics/sales-by-payment');
    } catch {
      return salesByPayment;
    }
  },

  async getSalesByRegion() {
    try {
      return await apiClient.get('/analytics/sales-by-region');
    } catch {
      return salesByRegion;
    }
  },

  async getSalesByChannel() {
    try {
      return await apiClient.get('/analytics/sales-by-channel');
    } catch {
      return salesByChannel;
    }
  },

  async getTopSearches() {
    try {
      return await apiClient.get('/analytics/top-searches');
    } catch {
      return topSearches;
    }
  },
};
