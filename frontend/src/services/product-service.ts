import { apiClient } from './api-client';
import { products as seedProducts } from '@/data/products';
import type { Product, ProductStatus } from '@/types/commerce';

export const productService = {
  async getProducts(params?: { category?: string; status?: ProductStatus; search?: string }): Promise<Product[]> {
    try {
      return await apiClient.get<Product[]>('/products');
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
        result = result.filter((p) => p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
      }
      return result;
    }
  },

  async getProductById(id: string): Promise<Product | undefined> {
    try {
      return await apiClient.get<Product>(`/products/${id}`);
    } catch {
      return seedProducts.find((p) => p.id === id);
    }
  },

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

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/products/${id}`);
      return true;
    } catch {
      return true;
    }
  },

  async adjustStock(productId: string, variantId: string, delta: number): Promise<boolean> {
    try {
      await apiClient.patch(`/products/${productId}/variants/${variantId}/stock`, { delta });
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
