import { financeService } from '../services/financeService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const financeController = {
  list: (_req, res) => {
    sendSuccess(res, financeService.list(), 'Finance entries loaded');
  },
  getById: (req, res) => {
    const entry = financeService.getById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Finance entry not found' });
    }

    return sendSuccess(res, entry, 'Finance entry loaded');
  },
};
