import { productsMock } from '@/mocks/data';
import type { Product } from '@/models/types';
import { httpClient } from './httpClient';

export const productService = {
  list: async (): Promise<Product[]> => {
    if (httpClient.useMocks) {
      return Promise.resolve(productsMock);
    }

    return httpClient.get<Product[]>('/products');
  },
  listCategories: async (): Promise<string[]> => {
    const products = httpClient.useMocks ? productsMock : await httpClient.get<Product[]>('/products');
    return ['Todas', ...new Set(products.map((product) => product.category))];
  },
};
