import type { SaleRecord, SaleSubmitPayload, SalesView } from '@/models/types';
import { httpClient } from './httpClient';

export const saleService = {
  getView: async (): Promise<SalesView> => httpClient.get<SalesView>('/sales/view'),
  create: async (payload: SaleSubmitPayload): Promise<SaleRecord> =>
    httpClient.post<SaleRecord, SaleSubmitPayload>('/sales', payload),
};
