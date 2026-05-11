import { saleService } from '@/services/saleService';

export const saleController = {
  getView: () => saleService.getView(),
  create: (payload: Parameters<typeof saleService.create>[0], signal?: AbortSignal) => saleService.create(payload, signal),
};
