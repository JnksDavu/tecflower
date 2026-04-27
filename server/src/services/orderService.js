import { ordersMock } from '../utils/mockData.js';

export const orderService = {
  list: () => ordersMock,
  getById: (id) => ordersMock.find((order) => order.id === Number(id)),
};
