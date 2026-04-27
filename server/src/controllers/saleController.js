import { saleService } from '../services/saleService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const saleController = {
  list: (_req, res) => {
    sendSuccess(res, saleService.list(), 'Sales loaded');
  },
  getById: (req, res) => {
    const sale = saleService.getById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    return sendSuccess(res, sale, 'Sale loaded');
  },
};
