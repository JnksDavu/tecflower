import { financeEntriesMock, financePaymentMethodsMock, financeSummaryMock } from '@/mocks/data';
import type { FinanceEntry, FinancePaymentMethod, FinanceSummaryCard } from '@/models/types';
import { httpClient } from './httpClient';

export const financialService = {
  list: async (): Promise<FinanceEntry[]> => {
    if (httpClient.useMocks) {
      return Promise.resolve(financeEntriesMock);
    }

    return httpClient.get<FinanceEntry[]>('/finance');
  },
  getSummary: async (): Promise<FinanceSummaryCard[]> => {
    if (httpClient.useMocks) {
      return Promise.resolve(financeSummaryMock);
    }

    return Promise.resolve(financeSummaryMock);
  },
  getPaymentMethods: async (): Promise<FinancePaymentMethod[]> => {
    if (httpClient.useMocks) {
      return Promise.resolve(financePaymentMethodsMock);
    }

    return Promise.resolve(financePaymentMethodsMock);
  },
};
