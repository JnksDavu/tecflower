import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { supplierController } from '../controllers/supplierController.js';

export const supplierRouter = Router();

supplierRouter.use(requireAuth);

supplierRouter.get('/', supplierController.list);
supplierRouter.post('/', supplierController.create);
supplierRouter.patch('/:id', supplierController.update);
supplierRouter.delete('/:id', supplierController.remove);
