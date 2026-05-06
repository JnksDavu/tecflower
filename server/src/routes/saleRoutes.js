import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { saleController } from '../controllers/saleController.js';

export const saleRouter = Router();

saleRouter.use(requireAuth);

saleRouter.get('/view', saleController.getView);
saleRouter.get('/', saleController.list);
saleRouter.post('/', saleController.create);
saleRouter.get('/:id', saleController.getById);
