import { Router } from 'express';
import { orderController } from '../controllers/orderController.js';

export const orderRouter = Router();

orderRouter.get('/', orderController.list);
orderRouter.get('/:id', orderController.getById);
