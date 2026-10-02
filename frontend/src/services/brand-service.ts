import { apiClient, ApiResponse } from './api-client';

export interface CreateBrandPayload {
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
  tenantId?: string;
}

export interface BrandResponseData {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const brandService = {
  /**
   * Create a new brand in the backend
   */
  async createBrand(
    payload: CreateBrandPayload,
  ): Promise<ApiResponse<BrandResponseData>> {
    return await apiClient.post<ApiResponse<BrandResponseData>>(
      '/brands',
      payload,
    );
  },
};
