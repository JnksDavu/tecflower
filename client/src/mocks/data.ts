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
    { productId: '1', quantity: 1, discountMode: 'fixed', discountValue: 5 },
    { productId: '3', quantity: 2, discountMode: 'percent', discountValue: 10 },
  ],
  catalogProducts: productsMock.map((product) => ({
    id: product.id,
    name: product.name,
    categoryName: product.category.name,
    price: product.price,
    stockQuantity: product.stockQuantity,
    status: product.status,
  })),
  popularProducts: [
    { id: '1', name: 'Buque Primavera', price: 89.9 },
    { id: '2', name: 'Orquídea Phalaenopsis', price: 129 },
    { id: '3', name: 'Girassol Premium', price: 39.9 },
    { id: '4', name: 'Arranjo Rosas Vermelhas', price: 149.9 },
  ],
  customerSuggestions: [
    { id: 'c1', name: 'Maria Oliveira', phone: '(11) 99888-2211', cpf: '123.456.789-00', lastOrderLabel: 'Comprou ontem' },
    { id: 'c2', name: 'João Ferreira', phone: '(11) 97777-1020', lastOrderLabel: 'Cliente frequente' },
    { id: 'c3', name: 'Ana Costa', phone: '(11) 96666-4321', lastOrderLabel: 'Última compra há 12 dias' },
  ],
  paymentMethods: [
    { id: 'PIX', label: 'PIX' },
    { id: 'Cartão de crédito', label: 'Cartão de crédito' },
    { id: 'Cartão de débito', label: 'Cartão de débito' },
    { id: 'Dinheiro', label: 'Dinheiro' },
  ],
  customerName: '',
  customerPhone: '',
  customerCpf: '',
  customerNotes: '',
  selectedPayment: '',
  paidAmount: 0,
  discountAmount: 0,
  quickNotes: [
    'Cliente novo: cadastro em menos de 10 segundos com nome e telefone.',
    'Desconto aplicado antes do pagamento para evitar retrabalho no caixa.',
    'Resumo lateral sempre visível para fechamento rápido.',
  ],
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
