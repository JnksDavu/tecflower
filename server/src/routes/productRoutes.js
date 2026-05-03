import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { productController } from '../controllers/productController.js';

export const productRouter = Router();

productRouter.use(requireAuth);

productRouter.get('/metadata', productController.getMetadata);
productRouter.get('/stock-movements', productController.listStockMovements);
productRouter.post('/categories', productController.createCategory);
productRouter.post('/tags', productController.createTag);
productRouter.get('/', productController.list);
productRouter.post('/', productController.create);
productRouter.patch('/:id', productController.update);
productRouter.post('/:id/stock-adjustments', productController.adjustStock);
productRouter.get('/:id', productController.getById);
