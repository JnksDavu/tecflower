import { purchaseService } from '../services/purchaseService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const purchaseController = {
  list: async (req, res, next) => {
    try {
      const purchases = await purchaseService.list({
        accountId: req.auth.accountId,
        filters: req.query,
      });

      sendSuccess(res, purchases, 'Compras carregadas.');
    } catch (error) {
      next(error);
    }
  },

  getMetadata: async (req, res, next) => {
    try {
      const metadata = await purchaseService.getMetadata({
        accountId: req.auth.accountId,
      });

      sendSuccess(res, metadata, 'Dados de compras carregados.');
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const purchase = await purchaseService.create({
        accountId: req.auth.accountId,
        userId: req.auth.userId,
        payload: req.body,
      });

      sendSuccess(res, purchase, 'Compra cadastrada com sucesso.');
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const purchase = await purchaseService.update({
        accountId: req.auth.accountId,
        userId: req.auth.userId,
        purchaseId: req.params.id,
        payload: req.body,
      });

      sendSuccess(res, purchase, 'Compra atualizada com sucesso.');
    } catch (error) {
      next(error);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const purchase = await purchaseService.updateStatus({
        accountId: req.auth.accountId,
        userId: req.auth.userId,
        purchaseId: req.params.id,
        status: req.body.status,
        payload: req.body,
      });

      sendSuccess(res, purchase, 'Status da compra atualizado.');
    } catch (error) {
      next(error);
    }
  },

  confirmEntry: async (req, res, next) => {
    try {
      const purchase = await purchaseService.confirmEntry({
        accountId: req.auth.accountId,
        userId: req.auth.userId,
        purchaseId: req.params.id,
        payload: req.body,
      });

      sendSuccess(res, purchase, 'Entrada confirmada e estoque atualizado.');
    } catch (error) {
      next(error);
    }
  },

  cancel: async (req, res, next) => {
    try {
      const purchase = await purchaseService.cancel({
        accountId: req.auth.accountId,
        userId: req.auth.userId,
        purchaseId: req.params.id,
        payload: req.body,
      });

      sendSuccess(res, purchase, 'Compra cancelada com sucesso.');
    } catch (error) {
      next(error);
    }
  },
};
