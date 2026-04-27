import { saleService } from '@/services/saleService';

export const saleController = {
  getView: () => saleService.getView(),
};
