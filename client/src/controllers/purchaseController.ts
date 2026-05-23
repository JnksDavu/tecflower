import type { PurchaseFilters, PurchaseStatus, PurchaseUpsertPayload } from '@/models/types';
import { purchaseService } from '@/services/purchaseService';

export const purchaseController = {
  list: (filters?: PurchaseFilters) => purchaseService.list(filters),
  getMetadata: () => purchaseService.getMetadata(),
  create: (payload: PurchaseUpsertPayload) => purchaseService.create(payload),
  update: (purchaseId: string, payload: PurchaseUpsertPayload) => purchaseService.update(purchaseId, payload),
  updateStatus: (purchaseId: string, status: Exclude<PurchaseStatus, 'delivered'>) =>
    purchaseService.updateStatus(purchaseId, status),
  confirmEntry: (purchaseId: string, deliveryDate?: string) =>
    purchaseService.confirmEntry(purchaseId, deliveryDate),
  cancel: (purchaseId: string, reason?: string) => purchaseService.cancel(purchaseId, reason),
};
