import { orderService } from '../services/orderService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const orderController = {
  list: (_req, res) => {
    sendSuccess(res, orderService.list(), 'Orders loaded');
  },
  getById: (req, res) => {
    const order = orderService.getById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return sendSuccess(res, order, 'Order loaded');
  },
};
