import { Router } from 'express';
import { authRouter } from './authRoutes.js';
import { financeRouter } from './financeRoutes.js';
import { orderRouter } from './orderRoutes.js';
import { productRouter } from './productRoutes.js';
import { purchaseRouter } from './purchaseRoutes.js';
import { saleRouter } from './saleRoutes.js';
import { supplierRouter } from './supplierRoutes.js';

export const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
  res.json({
    message: 'TecFlower API',
    modules: ['auth', 'products', 'orders', 'sales', 'purchases', 'suppliers', 'finance'],
  });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/sales', saleRouter);
apiRouter.use('/purchases', purchaseRouter);
apiRouter.use('/suppliers', supplierRouter);
apiRouter.use('/finance', financeRouter);
