export type ProductStatus = 'Em estoque' | 'Estoque baixo' | 'Sem estoque';
export type FinanceEntryType = 'entrada' | 'saida';

export interface AppUser {
  name: string;
  email: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  category: string;
  stock: number;
  price: number;
  status: ProductStatus;
}

export interface SaleCartItem {
  id: number;
  name: string;
  quantity: number;
}

export interface PopularProduct {
  id: number;
  name: string;
  price: number;
}

export interface SalesView {
  cartItems: SaleCartItem[];
  popularProducts: PopularProduct[];
  total: number;
  customerName: string;
  customerCpf: string;
  selectedPayment: 'PIX' | 'Cartao de credito' | 'Dinheiro';
  paidAmount: number;
  statusTitle: string;
  statusMessage: string;
}

export interface FinanceSummaryCard {
  id: string;
  title: string;
  value: number;
  caption: string;
  tone: 'neutral' | 'positive' | 'negative';
}

export interface FinancePaymentMethod {
  id: number;
  label: string;
  amount: number;
  tone: 'sand' | 'sage' | 'blue' | 'lilac';
}

export interface FinanceEntry {
  id: number;
  time: string;
  description: string;
  amount: number;
  type: FinanceEntryType;
}
