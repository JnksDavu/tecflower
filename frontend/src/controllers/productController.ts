import { productService } from '@/services/productService';

export const productController = {
  list: () => productService.list(),
  listCategories: () => productService.listCategories(),
};
