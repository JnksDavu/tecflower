import { financialService } from '@/services/financialService';

export const financialController = {
  list: () => financialService.list(),
  getSummary: () => financialService.getSummary(),
  getPaymentMethods: () => financialService.getPaymentMethods(),
};
