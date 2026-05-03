import type {
  ProductCategoryCreatePayload,
  ProductFilters,
  ProductStockAdjustmentPayload,
  ProductUpsertPayload,
} from '@/models/types';
import { productService } from '@/services/productService';

export const productController = {
  list: (filters?: ProductFilters) => productService.list(filters),
  getMetadata: () => productService.getMetadata(),
  create: (payload: ProductUpsertPayload) => productService.create(payload),
  update: (productId: string, payload: ProductUpsertPayload) => productService.update(productId, payload),
  adjustStock: (productId: string, payload: ProductStockAdjustmentPayload) =>
    productService.adjustStock(productId, payload),
  createCategory: (payload: ProductCategoryCreatePayload) => productService.createCategory(payload),
  createTag: (name: string) => productService.createTag(name),
  listStockMovements: () => productService.listStockMovements(),
};
