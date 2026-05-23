import { supplierService } from '../services/supplierService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const supplierController = {
  list: async (req, res, next) => {
    try {
      const suppliers = await supplierService.list({
        accountId: req.auth.accountId,
        filters: req.query,
      });

      sendSuccess(res, suppliers, 'Fornecedores carregados.');
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const supplier = await supplierService.create({
        accountId: req.auth.accountId,
        userId: req.auth.userId,
        payload: req.body,
      });

      sendSuccess(res, supplier, 'Fornecedor criado com sucesso.');
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const supplier = await supplierService.update({
        accountId: req.auth.accountId,
        supplierId: req.params.id,
        payload: req.body,
      });

      sendSuccess(res, supplier, 'Fornecedor atualizado com sucesso.');
    } catch (error) {
      next(error);
    }
  },

  remove: async (req, res, next) => {
    try {
      const result = await supplierService.remove({
        accountId: req.auth.accountId,
        supplierId: req.params.id,
      });

      sendSuccess(res, result, 'Fornecedor excluído com sucesso.');
    } catch (error) {
      next(error);
    }
  },
};
