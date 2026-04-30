import { productService } from '../services/productService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const productController = {
  list: async (req, res, next) => {
    try {
      const products = await productService.list({
        accountId: req.auth.accountId,
        filters: req.query,
      });

      sendSuccess(res, products, 'Produtos carregados.');
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const product = await productService.getById({
        accountId: req.auth.accountId,
        productId: req.params.id,
      });

      sendSuccess(res, product, 'Produto carregado.');
    } catch (error) {
      next(error);
    }
  },

  getMetadata: async (req, res, next) => {
    try {
      const metadata = await productService.getMetadata({
        accountId: req.auth.accountId,
      });

      sendSuccess(res, metadata, 'Catálogo carregado.');
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const product = await productService.create({
        accountId: req.auth.accountId,
        userId: req.auth.userId,
        payload: req.body,
      });

      sendSuccess(res, product, 'Produto criado com sucesso.');
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const product = await productService.update({
        accountId: req.auth.accountId,
        userId: req.auth.userId,
        productId: req.params.id,
        payload: req.body,
      });

      sendSuccess(res, product, 'Produto atualizado com sucesso.');
    } catch (error) {
      next(error);
    }
  },

  adjustStock: async (req, res, next) => {
    try {
      const product = await productService.adjustStock({
        accountId: req.auth.accountId,
        userId: req.auth.userId,
        productId: req.params.id,
        payload: req.body,
      });

      sendSuccess(res, product, 'Estoque ajustado com sucesso.');
    } catch (error) {
      next(error);
    }
  },

  createTag: async (req, res, next) => {
    try {
      const tag = await productService.createTag({
        accountId: req.auth.accountId,
        payload: req.body,
      });

      sendSuccess(res, tag, 'Tag criada com sucesso.');
    } catch (error) {
      next(error);
    }
  },
};
