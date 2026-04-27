import { salesViewMock } from '@/mocks/data';
import type { SalesView } from '@/models/types';
import { httpClient } from './httpClient';

export const saleService = {
  getView: async (): Promise<SalesView> => {
    if (httpClient.useMocks) {
      return Promise.resolve(salesViewMock);
    }

    return Promise.resolve(salesViewMock);
  },
};
