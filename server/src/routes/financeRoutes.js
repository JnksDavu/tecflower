import { Router } from 'express';
import { financeController } from '../controllers/financeController.js';

export const financeRouter = Router();

financeRouter.get('/', financeController.list);
financeRouter.get('/:id', financeController.getById);
