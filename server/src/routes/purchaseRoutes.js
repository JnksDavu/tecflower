import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { purchaseController } from '../controllers/purchaseController.js';

export const purchaseRouter = Router();

purchaseRouter.use(requireAuth);

purchaseRouter.get('/metadata', purchaseController.getMetadata);
purchaseRouter.get('/', purchaseController.list);
purchaseRouter.post('/', purchaseController.create);
purchaseRouter.patch('/:id', purchaseController.update);
purchaseRouter.patch('/:id/status', purchaseController.updateStatus);
purchaseRouter.post('/:id/confirm-entry', purchaseController.confirmEntry);
purchaseRouter.post('/:id/cancel', purchaseController.cancel);
purchaseRouter.delete('/:id', purchaseController.cancel);
