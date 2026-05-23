import type {
  PurchaseFilters,
  PurchaseMetadata,
  PurchaseRecord,
  PurchaseStatus,
  PurchaseUpsertPayload,
} from '@/models/types';
import { httpClient } from './httpClient';

export const purchaseService = {
  list: async (filters: PurchaseFilters = {}): Promise<PurchaseRecord[]> =>
    httpClient.get<PurchaseRecord[]>('/purchases', filters),
  getMetadata: async (): Promise<PurchaseMetadata> =>
    httpClient.get<PurchaseMetadata>('/purchases/metadata'),
  create: async (payload: PurchaseUpsertPayload): Promise<PurchaseRecord> =>
    httpClient.post<PurchaseRecord, PurchaseUpsertPayload>('/purchases', payload),
  update: async (purchaseId: string, payload: PurchaseUpsertPayload): Promise<PurchaseRecord> =>
    httpClient.patch<PurchaseRecord, PurchaseUpsertPayload>(`/purchases/${purchaseId}`, payload),
  updateStatus: async (purchaseId: string, status: Exclude<PurchaseStatus, 'delivered'>): Promise<PurchaseRecord> =>
    httpClient.patch<PurchaseRecord, { status: Exclude<PurchaseStatus, 'delivered'> }>(
      `/purchases/${purchaseId}/status`,
      { status },
    ),
  confirmEntry: async (purchaseId: string, deliveryDate?: string): Promise<PurchaseRecord> =>
    httpClient.post<PurchaseRecord, { deliveryDate?: string }>(`/purchases/${purchaseId}/confirm-entry`, {
      deliveryDate,
    }),
  cancel: async (purchaseId: string, reason?: string): Promise<PurchaseRecord> =>
    httpClient.post<PurchaseRecord, { reason?: string }>(`/purchases/${purchaseId}/cancel`, { reason }),
};
