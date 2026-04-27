import { financeMock } from '../utils/mockData.js';

export const financeService = {
  list: () => financeMock,
  getById: (id) => financeMock.find((entry) => entry.id === Number(id)),
};
