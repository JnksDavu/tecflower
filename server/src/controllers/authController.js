import { registerAccountOwner } from '../services/authService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const registerController = async (req, res, next) => {
  try {
    const result = await registerAccountOwner(req.body);
    sendSuccess(res, result, 'Conta criada com sucesso.');
  } catch (error) {
    next(error);
  }
};
