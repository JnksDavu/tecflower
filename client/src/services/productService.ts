import type {
  Product,
  ProductCategory,
  ProductCategoryCreatePayload,
  ProductCatalogMetadata,
  ProductFilters,
  ProductStockMovement,
  ProductStockAdjustmentPayload,
  ProductTag,
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
  adjustStock: async (productId: string, payload: ProductStockAdjustmentPayload): Promise<Product> =>
    httpClient.post<Product, ProductStockAdjustmentPayload>(`/products/${productId}/stock-adjustments`, payload),
  createCategory: async (payload: ProductCategoryCreatePayload): Promise<ProductCategory> =>
    httpClient.post<ProductCategory, ProductCategoryCreatePayload>('/products/categories', payload),
  createTag: async (name: string): Promise<ProductTag> =>
    httpClient.post<ProductTag, { name: string }>('/products/tags', { name }),
  listStockMovements: async (): Promise<ProductStockMovement[]> =>
    httpClient.get<ProductStockMovement[]>('/products/stock-movements'),
};
