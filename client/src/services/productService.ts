import type {
  Product,
  ProductCategory,
  ProductCategoryCreatePayload,
  ProductCatalogMetadata,
  ProductFilters,
  ProductStockMovement,
  ProductStockAdjustmentPayload,
  ProductTag,
  ProductTagUpsertPayload,
  ProductUpsertPayload,
} from '@/models/types';
import { httpClient } from './httpClient';

export const productService = {
  list: async (filters: ProductFilters = {}): Promise<Product[]> => {
    return httpClient.get<Product[]>('/products', filters);
  },
  getMetadata: async (): Promise<ProductCatalogMetadata> => {
    return httpClient.get<ProductCatalogMetadata>('/products/metadata');
  },
  create: async (payload: ProductUpsertPayload): Promise<Product> =>
    httpClient.post<Product, ProductUpsertPayload>('/products', payload),
  update: async (productId: string, payload: ProductUpsertPayload): Promise<Product> =>
    httpClient.patch<Product, ProductUpsertPayload>(`/products/${productId}`, payload),
  remove: async (productId: string): Promise<{ id: string }> =>
    httpClient.delete<{ id: string }>(`/products/${productId}`),
  adjustStock: async (productId: string, payload: ProductStockAdjustmentPayload): Promise<Product> =>
    httpClient.post<Product, ProductStockAdjustmentPayload>(`/products/${productId}/stock-adjustments`, payload),
  createCategory: async (payload: ProductCategoryCreatePayload): Promise<ProductCategory> =>
    httpClient.post<ProductCategory, ProductCategoryCreatePayload>('/products/categories', payload),
  updateCategory: async (categoryId: string, payload: ProductCategoryCreatePayload): Promise<ProductCategory> =>
    httpClient.patch<ProductCategory, ProductCategoryCreatePayload>(`/products/categories/${categoryId}`, payload),
  removeCategory: async (categoryId: string): Promise<{ id: string }> =>
    httpClient.delete<{ id: string }>(`/products/categories/${categoryId}`),
  createTag: async (name: string): Promise<ProductTag> =>
    httpClient.post<ProductTag, { name: string }>('/products/tags', { name }),
  updateTag: async (tagId: string, payload: ProductTagUpsertPayload): Promise<ProductTag> =>
    httpClient.patch<ProductTag, ProductTagUpsertPayload>(`/products/tags/${tagId}`, payload),
  removeTag: async (tagId: string): Promise<{ id: string }> =>
    httpClient.delete<{ id: string }>(`/products/tags/${tagId}`),
  listStockMovements: async (): Promise<ProductStockMovement[]> =>
    httpClient.get<ProductStockMovement[]>('/products/stock-movements'),
};
