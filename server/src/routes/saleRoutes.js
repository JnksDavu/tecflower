import { Router } from 'express';
import { saleController } from '../controllers/saleController.js';

export const saleRouter = Router();

saleRouter.get('/', saleController.list);
saleRouter.get('/:id', saleController.getById);
