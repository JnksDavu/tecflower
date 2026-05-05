import type {
  ProductCategoryCreatePayload,
  ProductFilters,
  ProductStockAdjustmentPayload,
  ProductTagUpsertPayload,
  ProductUpsertPayload,
} from '@/models/types';
import { productService } from '@/services/productService';

export const productController = {
  list: (filters?: ProductFilters) => productService.list(filters),
  getMetadata: () => productService.getMetadata(),
  create: (payload: ProductUpsertPayload) => productService.create(payload),
  update: (productId: string, payload: ProductUpsertPayload) => productService.update(productId, payload),
  remove: (productId: string) => productService.remove(productId),
  adjustStock: (productId: string, payload: ProductStockAdjustmentPayload) =>
    productService.adjustStock(productId, payload),
  createCategory: (payload: ProductCategoryCreatePayload) => productService.createCategory(payload),
  updateCategory: (categoryId: string, payload: ProductCategoryCreatePayload) =>
    productService.updateCategory(categoryId, payload),
  removeCategory: (categoryId: string) => productService.removeCategory(categoryId),
  createTag: (name: string) => productService.createTag(name),
  updateTag: (tagId: string, payload: ProductTagUpsertPayload) => productService.updateTag(tagId, payload),
  removeTag: (tagId: string) => productService.removeTag(tagId),
  listStockMovements: () => productService.listStockMovements(),
};
