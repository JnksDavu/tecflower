import { Router } from 'express';
import { registerController } from '../controllers/authController.js';

export const authRouter = Router();

authRouter.post('/register', registerController);
