import { saleService } from '../services/saleService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const saleController = {
  getView: async (req, res, next) => {
    try {
      const view = await saleService.getView({
        accountId: req.auth.accountId,
      });

      sendSuccess(res, view, 'Tela de vendas carregada.');
    } catch (error) {
      next(error);
    }
  },

  list: async (req, res, next) => {
    try {
      const sales = await saleService.list({
        accountId: req.auth.accountId,
      });

      sendSuccess(res, sales, 'Vendas carregadas.');
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const sale = await saleService.getById({
        accountId: req.auth.accountId,
        saleId: req.params.id,
      });

      sendSuccess(res, sale, 'Venda carregada.');
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const sale = await saleService.create({
        accountId: req.auth.accountId,
        userId: req.auth.userId,
        payload: req.body,
      });

      sendSuccess(res, sale, 'Venda concluída com sucesso.');
    } catch (error) {
      next(error);
    }
  },
};
