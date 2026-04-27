import { productService } from '../services/productService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const productController = {
  list: (_req, res) => {
    sendSuccess(res, productService.list(), 'Products loaded');
  },
  getById: (req, res) => {
    const product = productService.getById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return sendSuccess(res, product, 'Product loaded');
  },
};
