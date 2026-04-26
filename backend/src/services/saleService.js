import { salesMock } from '../utils/mockData.js';

export const saleService = {
  list: () => salesMock,
  getById: (id) => salesMock.find((sale) => sale.id === Number(id)),
};
