export type ProductStatus = 'Em estoque' | 'Estoque baixo' | 'Sem estoque';
export type FinanceEntryType = 'entrada' | 'saida';

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isFixed: boolean;
}

export interface ProductTag {
  id: string;
  name: string;
  slug: string;
  isDefault: boolean;
}

export interface AppUser {
  name: string;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: ProductCategory;
  tags: ProductTag[];
  stockQuantity: number;
  minimumStock: number;
  price: number;
  status: ProductStatus;
  trackStock: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCatalogMetadata {
  categories: ProductCategory[];
  tags: ProductTag[];
  stockStatuses: Array<'Todos' | ProductStatus>;
}

export interface ProductFilters {
  [key: string]: string | undefined;
  search?: string;
  category?: string;
  stockStatus?: string;
  tag?: string;
}

export interface ProductUpsertPayload {
  name: string;
  sku: string;
  description: string;
  categorySlug: string;
  price: number;
  stockQuantity: number;
  minimumStock: number;
  trackStock: boolean;
  isActive: boolean;
  tagIds: string[];
}

export interface ProductStockAdjustmentPayload {
  quantityDelta: number;
  note: string;
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
  selectedPayment: 'PIX' | 'Cartão de crédito' | 'Dinheiro';
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
