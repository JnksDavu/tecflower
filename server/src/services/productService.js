import { productsMock } from '../utils/mockData.js';

export const productService = {
  list: () => productsMock,
  getById: (id) => productsMock.find((product) => product.id === Number(id)),
};
