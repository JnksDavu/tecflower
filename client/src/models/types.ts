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

export interface ProductCategoryCreatePayload {
  name: string;
}

export interface ProductTagUpsertPayload {
  name: string;
}

export interface ProductStockMovement {
  id: string;
  movementType: 'manual_adjustment' | 'restock' | 'sale' | 'loss';
  quantityDelta: number;
  previousQuantity: number;
  nextQuantity: number;
  note: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface SaleCartItem {
  productId: string;
  quantity: number;
}

export interface PopularProduct {
  id: string;
  name: string;
  price: number;
}

export interface SalesCatalogProduct {
  id: string;
  name: string;
  categoryName: string;
  price: number;
  stockQuantity: number;
  status: ProductStatus;
}

export interface SalesCustomer {
  id: string;
  name: string;
  phone: string;
  cpf?: string;
  lastOrderLabel?: string;
}

export interface SalesPaymentMethodOption {
  id: 'PIX' | 'Cartão de crédito' | 'Cartão de débito' | 'Dinheiro';
  label: string;
  helper?: string;
}

export interface SalesView {
  cartItems: SaleCartItem[];
  catalogProducts: SalesCatalogProduct[];
  popularProducts: PopularProduct[];
  customerSuggestions: SalesCustomer[];
  paymentMethods: SalesPaymentMethodOption[];
  customerName: string;
  customerPhone: string;
  customerCpf: string;
  customerNotes: string;
  selectedPayment?: '' | 'PIX' | 'Cartão de crédito' | 'Cartão de débito' | 'Dinheiro';
  paidAmount: number;
  discountAmount: number;
  quickNotes: string[];
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
