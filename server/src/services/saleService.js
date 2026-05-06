import { getSupabaseAdminClient } from '../lib/supabase.js';
import { createHttpError } from '../utils/httpError.js';

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');
const toNumber = (value) => Number(value);
const toInteger = (value) => Number.parseInt(String(value), 10);

const PAYMENT_METHODS = [
  {
    id: 'PIX',
    label: 'PIX',
    dbValue: 'pix',
  },
  {
    id: 'Cartão de crédito',
    label: 'Cartão de crédito',
    dbValue: 'credit_card',
  },
  {
    id: 'Cartão de débito',
    label: 'Cartão de débito',
    dbValue: 'debit_card',
  },
  {
    id: 'Dinheiro',
    label: 'Dinheiro',
    dbValue: 'cash',
  },
];

const PAYMENT_METHOD_LABEL_TO_DB = Object.fromEntries(
  PAYMENT_METHODS.map((method) => [method.id, method.dbValue]),
);

const PAYMENT_METHOD_DB_TO_LABEL = Object.fromEntries(
  PAYMENT_METHODS.map((method) => [method.dbValue, method.id]),
);

const mapCatalogProduct = (row) => {
  const stockQuantity = Number(row.stock_quantity ?? 0);
  const minimumStock = Number(row.minimum_stock ?? 0);

  return {
    id: row.id,
    name: row.name,
    categoryName: row.product_categories?.name || '',
    price: Number(row.price ?? 0),
    stockQuantity,
    status:
      stockQuantity <= 0
        ? 'Sem estoque'
        : stockQuantity <= minimumStock
          ? 'Estoque baixo'
          : 'Em estoque',
  };
};

const mapCustomerSuggestion = (row) => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  cpf: row.cpf || '',
  lastOrderLabel: undefined,
});

const mapSaleItem = (row) => ({
  id: row.id,
  productId: row.products?.id || '',
  productName: row.products?.name || '',
  quantity: Number(row.quantity ?? 0),
  unitPrice: Number(row.unit_price ?? 0),
  grossAmount: Number(row.gross_amount ?? 0),
  discountMode: row.discount_mode || 'fixed',
  discountValue: Number(row.discount_value ?? 0),
  discountAmount: Number(row.discount_amount ?? 0),
  totalAmount: Number(row.total_amount ?? 0),
});

const mapSale = (row) => ({
  id: row.id,
  saleNumber: row.sale_number,
  status: row.status,
  paymentMethod: PAYMENT_METHOD_DB_TO_LABEL[row.payment_method] || row.payment_method,
  subtotal: Number(row.subtotal ?? 0),
  itemsDiscountAmount: Number(row.items_discount_amount ?? 0),
  discountMode: row.discount_mode || 'fixed',
  discountValue: Number(row.discount_value ?? 0),
  discountAmount: Number(row.discount_amount ?? 0),
  totalAmount: Number(row.total_amount ?? 0),
  paidAmount: Number(row.paid_amount ?? 0),
  changeAmount: Number(row.change_amount ?? 0),
  notes: row.notes || '',
  soldAt: row.sold_at,
  createdAt: row.created_at,
  customer: row.customers
    ? {
        id: row.customers.id,
        name: row.customers.name,
        phone: row.customers.phone,
        cpf: row.customers.cpf || '',
      }
    : null,
  items: (row.sale_items || []).map(mapSaleItem),
});

const validateItemsPayload = (items) => {
  if (!Array.isArray(items) || !items.length) {
    throw createHttpError('Adicione pelo menos um produto à venda.', 400);
  }

  return items.map((item, index) => {
    const productId = normalizeText(item.productId);
    const quantity = toInteger(item.quantity);
    const discountMode = normalizeText(item.discountMode) || 'fixed';
    const discountValue = Math.max(0, toNumber(item.discountValue ?? 0));

    if (!productId) {
      throw createHttpError(`O item ${index + 1} está sem produto.`, 400);
    }

    if (Number.isNaN(quantity) || quantity <= 0) {
      throw createHttpError(`Informe uma quantidade válida para o item ${index + 1}.`, 400);
    }

    if (!['fixed', 'percent'].includes(discountMode)) {
      throw createHttpError(`Tipo de desconto inválido no item ${index + 1}.`, 400);
    }

    if (Number.isNaN(discountValue) || discountValue < 0) {
      throw createHttpError(`Desconto inválido no item ${index + 1}.`, 400);
    }

    return {
      product_id: productId,
      quantity,
      discount_mode: discountMode,
      discount_value: discountValue,
    };
  });
};

const ensureCustomer = async (supabase, accountId, payload = {}) => {
  const customerId = normalizeText(payload.customerId);
  const name = normalizeText(payload.name);
  const phone = normalizeText(payload.phone);
  const cpf = normalizeText(payload.cpf);
  const notes = normalizeText(payload.notes);

  if (customerId) {
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, phone, cpf, notes')
      .eq('account_id', accountId)
      .eq('id', customerId)
      .single();

    if (error || !data) {
      throw createHttpError('Cliente não encontrado para esta conta.', 404);
    }

    return data.id;
  }

  if (!name) {
    throw createHttpError('Informe o nome do cliente.', 400);
  }

  if (!phone) {
    throw createHttpError('Informe o telefone do cliente.', 400);
  }

  const { data: created, error: createError } = await supabase
    .from('customers')
    .insert({
      account_id: accountId,
      name,
      phone,
      cpf: cpf || null,
      notes,
    })
    .select('id')
    .single();

  if (createError || !created) {
    throw createHttpError(createError?.message || 'Não foi possível criar o cliente.', 400);
  }

  return created.id;
};

export const saleService = {
  getView: async ({ accountId }) => {
    const supabase = getSupabaseAdminClient();

    const [productsResult, customersResult] = await Promise.all([
      supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          stock_quantity,
          minimum_stock,
          is_active,
          product_categories (
            name
          )
        `)
        .eq('account_id', accountId)
        .eq('is_active', true)
        .order('name', { ascending: true }),
      supabase
        .from('customers')
        .select('id, name, phone, cpf')
        .eq('account_id', accountId)
        .order('updated_at', { ascending: false })
        .limit(50),
    ]);

    if (productsResult.error) {
      throw createHttpError(productsResult.error.message, 400);
    }

    if (customersResult.error) {
      throw createHttpError(customersResult.error.message, 400);
    }

    const catalogProducts = (productsResult.data || []).map(mapCatalogProduct);
    const customerSuggestions = (customersResult.data || []).map(mapCustomerSuggestion);

    return {
      cartItems: [],
      catalogProducts,
      popularProducts: catalogProducts.slice(0, 6).map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
      })),
      customerSuggestions,
      paymentMethods: PAYMENT_METHODS.map(({ id, label, helper }) => ({ id, label, helper })),
      customerName: '',
      customerPhone: '',
      customerCpf: '',
      customerNotes: '',
      selectedPayment: 'PIX',
      paidAmount: 0,
      discountAmount: 0,
      quickNotes: [],
    };
  },

  create: async ({ accountId, userId, payload }) => {
    const supabase = getSupabaseAdminClient();
    const customer = payload.customer || {};
    const paymentMethodLabel = normalizeText(payload.paymentMethod);
    const paymentMethod = PAYMENT_METHOD_LABEL_TO_DB[paymentMethodLabel];
    const discountMode = normalizeText(payload.discountMode) || 'fixed';
    const discountValue = Math.max(0, toNumber(payload.discountValue ?? 0));
    const paidAmount = Math.max(0, toNumber(payload.paidAmount ?? 0));
    const notes = normalizeText(payload.notes);
    const items = validateItemsPayload(payload.items);

    if (!paymentMethod) {
      throw createHttpError('Selecione uma forma de pagamento válida.', 400);
    }

    if (!['fixed', 'percent'].includes(discountMode)) {
      throw createHttpError('Tipo de desconto geral inválido.', 400);
    }

    if (Number.isNaN(discountValue) || discountValue < 0) {
      throw createHttpError('Desconto geral inválido.', 400);
    }

    if (Number.isNaN(paidAmount) || paidAmount < 0) {
      throw createHttpError('Valor recebido inválido.', 400);
    }

    const customerId = await ensureCustomer(supabase, accountId, customer);

    const { data: saleId, error: rpcError } = await supabase.rpc('create_sale_with_items', {
      p_account_id: accountId,
      p_user_id: userId,
      p_customer_id: customerId,
      p_payment_method: paymentMethod,
      p_paid_amount: paidAmount,
      p_discount_mode: discountMode,
      p_discount_value: discountValue,
      p_notes: notes,
      p_items: items,
    });

    if (rpcError || !saleId) {
      throw createHttpError(rpcError?.message || 'Não foi possível concluir a venda.', 400);
    }

    return saleService.getById({
      accountId,
      saleId,
    });
  },

  list: async ({ accountId }) => {
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('sales')
      .select(`
        id,
        sale_number,
        status,
        payment_method,
        subtotal,
        items_discount_amount,
        discount_mode,
        discount_value,
        discount_amount,
        total_amount,
        paid_amount,
        change_amount,
        notes,
        sold_at,
        created_at,
        customers (
          id,
          name,
          phone,
          cpf
        )
      `)
      .eq('account_id', accountId)
      .order('sold_at', { ascending: false })
      .limit(100);

    if (error) {
      throw createHttpError(error.message, 400);
    }

    return (data || []).map((row) => ({
      id: row.id,
      saleNumber: row.sale_number,
      status: row.status,
      paymentMethod: PAYMENT_METHOD_DB_TO_LABEL[row.payment_method] || row.payment_method,
      totalAmount: Number(row.total_amount ?? 0),
      paidAmount: Number(row.paid_amount ?? 0),
      soldAt: row.sold_at,
      customer: row.customers
        ? {
            id: row.customers.id,
            name: row.customers.name,
            phone: row.customers.phone,
          }
        : null,
    }));
  },

  getById: async ({ accountId, saleId }) => {
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('sales')
      .select(`
        id,
        sale_number,
        status,
        payment_method,
        subtotal,
        items_discount_amount,
        discount_mode,
        discount_value,
        discount_amount,
        total_amount,
        paid_amount,
        change_amount,
        notes,
        sold_at,
        created_at,
        customers (
          id,
          name,
          phone,
          cpf
        ),
        sale_items (
          id,
          quantity,
          unit_price,
          gross_amount,
          discount_mode,
          discount_value,
          discount_amount,
          total_amount,
          products (
            id,
            name
          )
        )
      `)
      .eq('account_id', accountId)
      .eq('id', saleId)
      .single();

    if (error || !data) {
      throw createHttpError('Venda não encontrada.', 404);
    }

    return mapSale(data);
  },
};
