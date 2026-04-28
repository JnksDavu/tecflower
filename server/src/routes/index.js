import { Router } from 'express';
import { authRouter } from './authRoutes.js';
import { financeRouter } from './financeRoutes.js';
import { orderRouter } from './orderRoutes.js';
import { productRouter } from './productRoutes.js';
import { saleRouter } from './saleRoutes.js';

export const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
  res.json({
    message: 'TecFlower API',
    modules: ['auth', 'products', 'orders', 'sales', 'finance'],
  });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/sales', saleRouter);
apiRouter.use('/finance', financeRouter);
