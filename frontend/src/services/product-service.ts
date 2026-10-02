import { apiClient, ApiResponse } from './api-client';
import { products as seedProducts } from '@/data/products';
import type {
  Product,
  ProductStatus,
  CreateProductPayload,
  ProductResponseData,
} from '@/types';

export const productService = {
  /**
   * Create a new product in the backend
   */
  async createProduct(
    payload: CreateProductPayload,
  ): Promise<ApiResponse<ProductResponseData>> {
    return await apiClient.post<ApiResponse<ProductResponseData>>(
      '/products',
      payload,
    );
  },

  /**
   * Get all products from the backend with optional query filters
   */
  async getProducts(params?: {
    category?: string;
    status?: ProductStatus;
    search?: string;
    tenantId?: string;
  }): Promise<Product[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.category && params.category !== 'all') {
        searchParams.append('category', params.category);
      }
      if (params?.status && params.status !== ('all' as any)) {
        searchParams.append('status', params.status);
      }
      if (params?.search) {
        searchParams.append('search', params.search);
      }
      if (params?.tenantId) {
        searchParams.append('tenantId', params.tenantId);
      }

      const queryString = searchParams.toString();
      const endpoint = queryString ? `/products?${queryString}` : '/products';
      const res = await apiClient.get<any>(endpoint);
      return res.data || res;
    } catch {
      // Fallback to local mock data
      let result = [...seedProducts];
      if (params?.status && params.status !== ('all' as any)) {
        result = result.filter((p) => p.status === params.status);
      }
      if (params?.category && params.category !== 'all') {
        result = result.filter((p) => p.category === params.category);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        result = result.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q),
        );
      }
      return result;
    }
  },

  /**
   * Get a single product by ID or Slug
   */
  async getProductById(idOrSlug: string): Promise<Product | undefined> {
    try {
      const res = await apiClient.get<any>(`/products/${idOrSlug}`);
      return res.data || res;
    } catch {
      return seedProducts.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
    }
  },

  /**
   * Save or update product (local/backend hybrid)
   */
  async saveProduct(product: Product): Promise<Product> {
    try {
      if (product.id) {
        return await apiClient.put<Product>(`/products/${product.id}`, product);
      }
      return await apiClient.post<Product>('/products', product);
    } catch {
      return product;
    }
  },

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/products/${id}`);
      return true;
    } catch {
      return true;
    }
  },

  /**
   * Adjust stock for a variant
   */
  async adjustStock(
    productId: string,
    variantId: string,
    delta: number,
  ): Promise<boolean> {
    try {
      await apiClient.patch(`/products/${productId}/variants/${variantId}/stock`, {
        delta,
      });
      return true;
    } catch {
      return true;
    }
  },

  async getCategories() {
    try {
      return await apiClient.get('/categories');
    } catch {
      const { categories } = await import('@/data/products');
      return categories;
    }
  },

  async createCategory(category: any) {
    try {
      return await apiClient.post('/categories', category);
    } catch {
      return category;
    }
  },

  async updateCategory(key: string, patch: any) {
    try {
      return await apiClient.patch(`/categories/${key}`, patch);
    } catch {
      return patch;
    }
  },

  async deleteCategory(key: string): Promise<boolean> {
    try {
      await apiClient.delete(`/categories/${key}`);
      return true;
    } catch {
      return true;
    }
  },
};
