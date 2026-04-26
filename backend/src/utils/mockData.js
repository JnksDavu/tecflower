import { FinanceModel } from '../models/financeModel.js';
import { OrderModel } from '../models/orderModel.js';
import { ProductModel } from '../models/productModel.js';
import { SaleModel } from '../models/saleModel.js';

export const productsMock = [
  new ProductModel({ id: 1, name: 'Buque Primavera', category: 'Buques', stock: 12, price: 149.9, status: 'Ativo' }),
  new ProductModel({ id: 2, name: 'Orquidea Branca', category: 'Vasos', stock: 4, price: 89.9, status: 'Baixo estoque' }),
  new ProductModel({ id: 3, name: 'Cesta Romantica', category: 'Presentes', stock: 8, price: 219.9, status: 'Ativo' }),
];

export const ordersMock = [
  new OrderModel({ id: 1021, customer: 'Ana Martins', occasion: 'Aniversario', deliveryDate: '2026-04-11', total: 179.9, status: 'Novo' }),
  new OrderModel({ id: 1022, customer: 'Carlos Nogueira', occasion: 'Casamento civil', deliveryDate: '2026-04-12', total: 430, status: 'Em preparo' }),
  new OrderModel({ id: 1023, customer: 'Fernanda Lima', occasion: 'Maternidade', deliveryDate: '2026-04-11', total: 245, status: 'Concluido' }),
];

export const salesMock = [
  new SaleModel({ id: 5001, customer: 'Cliente balcão', date: '2026-04-11', total: 89.9, channel: 'Loja' }),
  new SaleModel({ id: 5002, customer: 'Juliana Costa', date: '2026-04-11', total: 159.9, channel: 'WhatsApp' }),
  new SaleModel({ id: 5003, customer: 'Empresa Flor do Vale', date: '2026-04-10', total: 920, channel: 'Instagram' }),
];

export const financeMock = [
  new FinanceModel({ id: 9001, description: 'Fornecedor Rosas Nobres', category: 'Compra', dueDate: '2026-04-15', amount: 1200, status: 'Pendente' }),
  new FinanceModel({ id: 9002, description: 'Venda contrato mensal', category: 'Receita', dueDate: '2026-04-11', amount: 1800, status: 'Recebido' }),
  new FinanceModel({ id: 9003, description: 'Energia da loja', category: 'Despesa fixa', dueDate: '2026-04-08', amount: 420, status: 'Vencido' }),
];
