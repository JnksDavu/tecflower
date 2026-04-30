import type { FinanceEntry, FinancePaymentMethod, FinanceSummaryCard, Product, SalesView } from '@/models/types';

export const storeStatus = 'Loja aberta - Sábado';

export const productsMock: Product[] = [
  {
    id: '1',
    name: 'Buque Primavera',
    sku: 'FLR-001',
    description: 'Flores frescas mistas',
    category: {
      id: 'cat-1',
      name: 'Buquês',
      slug: 'buques',
      sortOrder: 1,
      isFixed: true,
    },
    tags: [],
    stockQuantity: 24,
    minimumStock: 5,
    price: 89.9,
    status: 'Em estoque',
    trackStock: true,
    isActive: true,
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Orquídea Phalaenopsis',
    sku: 'FLR-014',
    description: 'Vaso cerâmico incluso',
    category: {
      id: 'cat-2',
      name: 'Plantas',
      slug: 'plantas',
      sortOrder: 2,
      isFixed: true,
    },
    tags: [],
    stockQuantity: 5,
    minimumStock: 5,
    price: 129,
    status: 'Estoque baixo',
    trackStock: true,
    isActive: true,
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Girassol Premium',
    sku: 'FLR-021',
    description: 'Haste longa e vibrante',
    category: {
      id: 'cat-3',
      name: 'Complementos',
      slug: 'complementos',
      sortOrder: 3,
      isFixed: true,
    },
    tags: [],
    stockQuantity: 42,
    minimumStock: 8,
    price: 39.9,
    status: 'Em estoque',
    trackStock: true,
    isActive: true,
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
  {
    id: '4',
    name: 'Arranjo Rosas Vermelhas',
    sku: 'FLR-033',
    description: 'Caixa presente luxo',
    category: {
      id: 'cat-4',
      name: 'Arranjos',
      slug: 'arranjos',
      sortOrder: 4,
      isFixed: true,
    },
    tags: [],
    stockQuantity: 0,
    minimumStock: 3,
    price: 149.9,
    status: 'Sem estoque',
    trackStock: true,
    isActive: true,
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
];

export const salesViewMock: SalesView = {
  cartItems: [
    { id: 1, name: 'Buque Rosas', quantity: 2 },
    { id: 2, name: 'Vaso Cerâmica', quantity: 1 },
    { id: 3, name: 'Cartão personalizado', quantity: 1 },
  ],
  popularProducts: [
    { id: 1, name: 'Buque Rosas', price: 89 },
    { id: 2, name: 'Orquídea', price: 65 },
    { id: 3, name: 'Girassol', price: 24 },
    { id: 4, name: 'Cesta Presente', price: 120 },
  ],
  total: 318,
  customerName: '',
  customerCpf: '',
  selectedPayment: 'PIX',
  paidAmount: 350,
  statusTitle: 'Venda concluída com sucesso',
  statusMessage: 'Comprovante enviado no WhatsApp. Estoque atualizado imediatamente.',
};

export const financeSummaryMock: FinanceSummaryCard[] = [
  { id: 'cash', title: 'Resumo de Caixa', value: 3840, caption: 'Saldo atualizado as 18:30', tone: 'neutral' },
  { id: 'income', title: 'Entradas do Dia', value: 2460, caption: '34 vendas registradas', tone: 'positive' },
  { id: 'expense', title: 'Saídas do Dia', value: 740, caption: '12 despesas lançadas', tone: 'negative' },
];

export const financePaymentMethodsMock: FinancePaymentMethod[] = [
  { id: 1, label: 'PIX', amount: 1320, tone: 'sand' },
  { id: 2, label: 'Cartão de Crédito', amount: 780, tone: 'sage' },
  { id: 3, label: 'Dinheiro', amount: 290, tone: 'blue' },
  { id: 4, label: 'Débito', amount: 70, tone: 'lilac' },
];

export const financeEntriesMock: FinanceEntry[] = [
  { id: 1, time: '09:12', description: 'Venda #1824 - Buque Primavera', amount: 145, type: 'entrada' },
  { id: 2, time: '11:05', description: 'Compra de rosas vermelhas', amount: 210, type: 'saida' },
  { id: 3, time: '14:48', description: 'Venda #1829 - Arranjo festa', amount: 320, type: 'entrada' },
  { id: 4, time: '17:22', description: 'Taxa de entrega parceiro', amount: 48, type: 'saida' },
];
