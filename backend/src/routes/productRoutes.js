import { Router } from 'express';
import { productController } from '../controllers/productController.js';

export const productRouter = Router();

productRouter.get('/', productController.list);
productRouter.get('/:id', productController.getById);
