import { getSupabaseAdminClient } from '../lib/supabase.js';
import { createHttpError } from '../utils/httpError.js';

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');
const toNumber = (value) => Number(value);
const toInteger = (value) => Number.parseInt(String(value), 10);

const mapProductOption = (row) => ({
  id: row.id,
  name: row.name,
  sku: row.sku,
  price: Number(row.price ?? 0),
  stockQuantity: Number(row.stock_quantity ?? 0),
});

const mapSupplierOption = (row) => ({
  id: row.id,
  name: row.name,
  document: row.document || '',
  phone: row.phone || '',
  email: row.email || '',
  isActive: Boolean(row.is_active),
});

const mapPurchaseItem = (row) => ({
  id: row.id,
  productId: row.product_id,
  productName: row.products?.name || '',
  sku: row.products?.sku || '',
  quantityOrdered: Number(row.quantity_ordered ?? 0),
  quantityReceived: Number(row.quantity_received ?? 0),
  unitCost: Number(row.unit_cost ?? 0),
  totalCost: Number(row.total_cost ?? 0),
});

const mapCustomItem = (row) => ({
  id: row.id,
  name: row.name,
  quantity: Number(row.quantity ?? 0),
  unitCost: Number(row.unit_cost ?? 0),
  totalCost: Number(row.total_cost ?? 0),
});

const mapPurchase = (row) => ({
  id: row.id,
  name: row.name,
  supplierMode: row.supplier_id ? 'supplier' : 'no-supplier',
  supplierId: row.supplier_id || '',
  supplierName: row.suppliers?.name || 'Sem fornecedor',
  purchaseDate: row.purchase_date,
  expectedDeliveryDate: row.expected_delivery_date || '',
  deliveryDate: row.delivery_date || '',
  description: row.description || '',
  notes: row.notes || '',
  estimatedCost: Number(row.total_amount ?? 0),
  status: row.status,
  productIds: (row.purchase_order_items || []).map((item) => item.product_id),
  customProducts: (row.purchase_order_custom_items || []).map((item) => item.name).join(', '),
  items: (row.purchase_order_items || []).map(mapPurchaseItem),
  customItems: (row.purchase_order_custom_items || []).map(mapCustomItem),
  cancellationReason: row.cancellation_reason || '',
  cancelledAt: row.cancelled_at || '',
  cancelledBy: row.cancelled_by || '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const purchaseSelect = `
  id,
  name,
  supplier_id,
  purchase_date,
  expected_delivery_date,
  delivery_date,
  description,
  notes,
  total_amount,
  status,
  cancellation_reason,
  cancelled_at,
  cancelled_by,
  created_at,
  updated_at,
  suppliers (
    id,
    name
  ),
  purchase_order_items (
    id,
    product_id,
    quantity_ordered,
    quantity_received,
    unit_cost,
    total_cost,
    products (
      id,
      name,
      sku,
      stock_quantity
    )
  ),
  purchase_order_custom_items (
    id,
    name,
    quantity,
    unit_cost,
    total_cost
  )
`;

const fetchPurchaseRow = async (supabase, accountId, purchaseId) => {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select(purchaseSelect)
    .eq('account_id', accountId)
    .eq('id', purchaseId)
    .single();

  if (error || !data) {
    throw createHttpError('Compra não encontrada.', 404);
  }

  return data;
};

const validateSupplier = async (supabase, accountId, supplierMode, supplierId) => {
  if (supplierMode === 'no-supplier' || !supplierId) {
    return null;
  }

  const { data, error } = await supabase
    .from('suppliers')
    .select('id')
    .eq('account_id', accountId)
    .eq('id', supplierId)
    .single();

  if (error || !data) {
    throw createHttpError('Fornecedor inválido para esta conta.', 400);
  }

  return data.id;
};

const normalizeProductItems = (payload = {}) => {
  if (Array.isArray(payload.items)) {
    return payload.items.map((item, index) => {
      const productId = normalizeText(item.productId);
      const quantityOrdered = toInteger(item.quantityOrdered ?? item.quantity ?? 1);
      const quantityReceived = toInteger(item.quantityReceived ?? 0);
      const unitCost = Math.max(0, toNumber(item.unitCost ?? 0));

      if (!productId) {
        throw createHttpError(`Produto inválido no item ${index + 1}.`, 400);
      }

      if (Number.isNaN(quantityOrdered) || quantityOrdered <= 0) {
        throw createHttpError(`Quantidade inválida no item ${index + 1}.`, 400);
      }

      if (Number.isNaN(quantityReceived) || quantityReceived < 0 || quantityReceived > quantityOrdered) {
        throw createHttpError(`Quantidade recebida inválida no item ${index + 1}.`, 400);
      }

      return { productId, quantityOrdered, quantityReceived, unitCost };
    });
  }

  const productIds = Array.isArray(payload.productIds) ? payload.productIds : [];
  return [...new Set(productIds.map((productId) => normalizeText(productId)).filter(Boolean))]
    .map((productId) => ({ productId, quantityOrdered: 1, quantityReceived: 0, unitCost: 0 }));
};

const normalizeCustomItems = (payload = {}) => {
  if (Array.isArray(payload.customItems)) {
    return payload.customItems
      .map((item) => ({
        name: normalizeText(item.name),
        quantity: toInteger(item.quantity ?? 1),
        unitCost: Math.max(0, toNumber(item.unitCost ?? 0)),
      }))
      .filter((item) => item.name);
  }

  const customProducts = normalizeText(payload.customProducts);
  if (!customProducts) {
    return [];
  }

  return customProducts
    .split(/[,\\n]/)
    .map((name) => normalizeText(name))
    .filter(Boolean)
    .map((name) => ({ name, quantity: 1, unitCost: 0 }));
};

const validateProductItems = async (supabase, accountId, items) => {
  if (!items.length) {
    return;
  }

  const productIds = items.map((item) => item.productId);
  const { data, error } = await supabase
    .from('products')
    .select('id')
    .eq('account_id', accountId)
    .in('id', productIds);

  if (error) {
    throw createHttpError(error.message, 400);
  }

  if ((data || []).length !== productIds.length) {
    throw createHttpError('Um ou mais produtos não pertencem a esta conta.', 400);
  }
};

const validatePurchasePayload = (payload = {}) => {
  const name = normalizeText(payload.name);
  const purchaseDate = normalizeText(payload.purchaseDate) || new Date().toISOString().slice(0, 10);
  const expectedDeliveryDate = normalizeText(payload.expectedDeliveryDate);
  const deliveryDate = normalizeText(payload.deliveryDate);
  const description = normalizeText(payload.description);
  const notes = normalizeText(payload.notes);
  const totalAmount = Math.max(0, toNumber(payload.estimatedCost ?? payload.totalAmount ?? 0));
  const supplierMode = payload.supplierMode === 'no-supplier' ? 'no-supplier' : 'supplier';
  const supplierId = normalizeText(payload.supplierId);
  const items = normalizeProductItems(payload);
  const customItems = normalizeCustomItems(payload);

  if (!name) {
    throw createHttpError('Informe o nome da compra.', 400);
  }

  if (Number.isNaN(totalAmount)) {
    throw createHttpError('Informe um valor válido para a compra.', 400);
  }

  return {
    name,
    purchaseDate,
    expectedDeliveryDate: expectedDeliveryDate || null,
    deliveryDate: deliveryDate || null,
    description,
    notes,
    totalAmount,
    supplierMode,
    supplierId,
    items,
    customItems,
  };
};

const syncPurchaseItems = async (supabase, accountId, purchaseId, items, customItems) => {
  const [deleteItemsResult, deleteCustomResult] = await Promise.all([
    supabase.from('purchase_order_items').delete().eq('account_id', accountId).eq('purchase_order_id', purchaseId),
    supabase.from('purchase_order_custom_items').delete().eq('account_id', accountId).eq('purchase_order_id', purchaseId),
  ]);

  if (deleteItemsResult.error) {
    throw createHttpError(deleteItemsResult.error.message, 400);
  }

  if (deleteCustomResult.error) {
    throw createHttpError(deleteCustomResult.error.message, 400);
  }

  if (items.length) {
    const { error } = await supabase.from('purchase_order_items').insert(
      items.map((item) => ({
        account_id: accountId,
        purchase_order_id: purchaseId,
        product_id: item.productId,
        quantity_ordered: item.quantityOrdered,
        quantity_received: item.quantityReceived,
        unit_cost: item.unitCost,
      })),
    );

    if (error) {
      throw createHttpError(error.message, 400);
    }
  }

  if (customItems.length) {
    const { error } = await supabase.from('purchase_order_custom_items').insert(
      customItems.map((item) => ({
        account_id: accountId,
        purchase_order_id: purchaseId,
        name: item.name,
        quantity: item.quantity,
        unit_cost: item.unitCost,
      })),
    );

    if (error) {
      throw createHttpError(error.message, 400);
    }
  }
};

const upsertFinanceEntry = async (supabase, accountId, userId, purchaseId, purchase) => {
  const financePayload = {
    account_id: accountId,
    created_by: userId,
    entry_type: 'payable',
    status: purchase.status === 'cancelled' ? 'cancelled' : 'pending',
    source_type: 'purchase_order',
    source_id: purchaseId,
    description: `Compra: ${purchase.name}`,
    amount: purchase.totalAmount,
    due_date: purchase.expectedDeliveryDate || purchase.deliveryDate || purchase.purchaseDate,
    notes: purchase.notes,
  };

  const { data: existingEntry, error: lookupError } = await supabase
    .from('finance_entries')
    .select('id')
    .eq('account_id', accountId)
    .eq('source_type', 'purchase_order')
    .eq('source_id', purchaseId)
    .maybeSingle();

  if (lookupError) {
    throw createHttpError(lookupError.message, 400);
  }

  const query = existingEntry
    ? supabase.from('finance_entries').update(financePayload).eq('account_id', accountId).eq('id', existingEntry.id)
    : supabase.from('finance_entries').insert(financePayload);

  const { error } = await query;
  if (error) {
    throw createHttpError(error.message, 400);
  }
};

const cancelPurchase = async (supabase, accountId, userId, purchaseId, payload = {}) => {
  const purchase = await fetchPurchaseRow(supabase, accountId, purchaseId);
  const reason = normalizeText(payload.reason);

  if (purchase.status === 'cancelled') {
    return mapPurchase(purchase);
  }

  if (purchase.status === 'delivered') {
    for (const item of purchase.purchase_order_items || []) {
      const receivedQuantity = Number(item.quantity_received ?? 0);
      if (receivedQuantity <= 0) {
        continue;
      }

      const previousQuantity = Number(item.products?.stock_quantity ?? 0);
      const nextQuantity = previousQuantity <= 0 ? 0 : Math.max(0, previousQuantity - receivedQuantity);
      const quantityDelta = nextQuantity - previousQuantity;

      const { error: productError } = await supabase
        .from('products')
        .update({ stock_quantity: nextQuantity })
        .eq('account_id', accountId)
        .eq('id', item.product_id);

      if (productError) {
        throw createHttpError(productError.message, 400);
      }

      const { error: itemError } = await supabase
        .from('purchase_order_items')
        .update({ quantity_received: 0 })
        .eq('account_id', accountId)
        .eq('id', item.id);

      if (itemError) {
        throw createHttpError(itemError.message, 400);
      }

      const { error: movementError } = await supabase.from('stock_movements').insert({
        account_id: accountId,
        product_id: item.product_id,
        purchase_order_id: purchaseId,
        movement_type: 'manual_adjustment',
        quantity_delta: quantityDelta,
        previous_quantity: previousQuantity,
        next_quantity: nextQuantity,
        note: reason
          ? `Estorno da compra ${purchase.name}. Motivo: ${reason}.`
          : `Estorno da compra ${purchase.name}.`,
        created_by: userId,
      });

      if (movementError) {
        throw createHttpError(movementError.message, 400);
      }
    }
  }

  const { error: orderError } = await supabase
    .from('purchase_orders')
    .update({
      status: 'cancelled',
      delivery_date: null,
      cancelled_at: new Date().toISOString(),
      cancelled_by: userId,
      cancellation_reason: reason,
    })
    .eq('account_id', accountId)
    .eq('id', purchaseId);

  if (orderError) {
    throw createHttpError(orderError.message, 400);
  }

  const { error: financeError } = await supabase
    .from('finance_entries')
    .update({
      status: 'cancelled',
      notes: reason ? `Compra cancelada. Motivo: ${reason}.` : 'Compra cancelada.',
    })
    .eq('account_id', accountId)
    .eq('source_type', 'purchase_order')
    .eq('source_id', purchaseId);

  if (financeError) {
    throw createHttpError(financeError.message, 400);
  }

  return mapPurchase(await fetchPurchaseRow(supabase, accountId, purchaseId));
};

export const purchaseService = {
  getMetadata: async ({ accountId }) => {
    const supabase = getSupabaseAdminClient();
    const [suppliersResult, productsResult] = await Promise.all([
      supabase
        .from('suppliers')
        .select('id, name, document, phone, email, is_active')
        .eq('account_id', accountId)
        .eq('is_active', true)
        .order('name', { ascending: true }),
      supabase
        .from('products')
        .select('id, name, sku, price, stock_quantity')
        .eq('account_id', accountId)
        .eq('is_active', true)
        .order('name', { ascending: true }),
    ]);

    if (suppliersResult.error) {
      throw createHttpError(suppliersResult.error.message, 400);
    }

    if (productsResult.error) {
      throw createHttpError(productsResult.error.message, 400);
    }

    return {
      suppliers: (suppliersResult.data || []).map(mapSupplierOption),
      products: (productsResult.data || []).map(mapProductOption),
      statuses: [
        { id: 'requested', label: 'Solicitado' },
        { id: 'delivered', label: 'Entregue' },
        { id: 'cancelled', label: 'Cancelado' },
      ],
    };
  },

  list: async ({ accountId, filters = {} }) => {
    const supabase = getSupabaseAdminClient();
    let query = supabase
      .from('purchase_orders')
      .select(purchaseSelect)
      .eq('account_id', accountId)
      .order('purchase_date', { ascending: false })
      .order('created_at', { ascending: false });

    const search = normalizeText(filters.search);
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const status = normalizeText(filters.status);
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const supplierId = normalizeText(filters.supplierId);
    if (supplierId === 'no-supplier') {
      query = query.is('supplier_id', null);
    } else if (supplierId && supplierId !== 'all') {
      query = query.eq('supplier_id', supplierId);
    }

    const dateFrom = normalizeText(filters.dateFrom);
    if (dateFrom) {
      query = query.gte('purchase_date', dateFrom);
    }

    const dateTo = normalizeText(filters.dateTo);
    if (dateTo) {
      query = query.lte('purchase_date', dateTo);
    }

    const { data, error } = await query;
    if (error) {
      throw createHttpError(error.message, 400);
    }

    return (data || []).map(mapPurchase);
  },

  create: async ({ accountId, userId, payload }) => {
    const supabase = getSupabaseAdminClient();
    const normalized = validatePurchasePayload(payload);
    const supplierId = await validateSupplier(supabase, accountId, normalized.supplierMode, normalized.supplierId);
    await validateProductItems(supabase, accountId, normalized.items);

    const { data, error } = await supabase
      .from('purchase_orders')
      .insert({
        account_id: accountId,
        supplier_id: supplierId,
        created_by: userId,
        name: normalized.name,
        description: normalized.description,
        notes: normalized.notes,
        purchase_date: normalized.purchaseDate,
        expected_delivery_date: normalized.expectedDeliveryDate,
        delivery_date: normalized.deliveryDate,
        total_amount: normalized.totalAmount,
        status: 'requested',
      })
      .select('id')
      .single();

    if (error || !data) {
      throw createHttpError(error?.message || 'Não foi possível criar a compra.', 400);
    }

    await syncPurchaseItems(supabase, accountId, data.id, normalized.items, normalized.customItems);
    await upsertFinanceEntry(supabase, accountId, userId, data.id, { ...normalized, status: 'requested' });

    return mapPurchase(await fetchPurchaseRow(supabase, accountId, data.id));
  },

  update: async ({ accountId, userId, purchaseId, payload }) => {
    const supabase = getSupabaseAdminClient();
    const current = await fetchPurchaseRow(supabase, accountId, purchaseId);

    if (current.status === 'delivered') {
      throw createHttpError('Compras entregues não podem ser editadas.', 400);
    }

    const normalized = validatePurchasePayload(payload);
    const supplierId = await validateSupplier(supabase, accountId, normalized.supplierMode, normalized.supplierId);
    await validateProductItems(supabase, accountId, normalized.items);

    const { error } = await supabase
      .from('purchase_orders')
      .update({
        supplier_id: supplierId,
        name: normalized.name,
        description: normalized.description,
        notes: normalized.notes,
        purchase_date: normalized.purchaseDate,
        expected_delivery_date: normalized.expectedDeliveryDate,
        delivery_date: normalized.deliveryDate,
        total_amount: normalized.totalAmount,
      })
      .eq('account_id', accountId)
      .eq('id', purchaseId);

    if (error) {
      throw createHttpError(error.message, 400);
    }

    await syncPurchaseItems(supabase, accountId, purchaseId, normalized.items, normalized.customItems);
    await upsertFinanceEntry(supabase, accountId, userId, purchaseId, { ...normalized, status: current.status });

    return mapPurchase(await fetchPurchaseRow(supabase, accountId, purchaseId));
  },

  updateStatus: async ({ accountId, userId, purchaseId, status, payload = {} }) => {
    if (!['requested', 'cancelled'].includes(status)) {
      throw createHttpError('Status inválido para atualização manual.', 400);
    }

    const supabase = getSupabaseAdminClient();
    if (status === 'cancelled') {
      return cancelPurchase(supabase, accountId, userId, purchaseId, payload);
    }

    const current = await fetchPurchaseRow(supabase, accountId, purchaseId);

    if (current.status === 'delivered') {
      throw createHttpError('Compras entregues não podem ter o status alterado manualmente.', 400);
    }

    const { error } = await supabase
      .from('purchase_orders')
      .update({
        status,
        delivery_date: status === 'cancelled' ? null : current.delivery_date,
      })
      .eq('account_id', accountId)
      .eq('id', purchaseId);

    if (error) {
      throw createHttpError(error.message, 400);
    }

    const { error: financeError } = await supabase
      .from('finance_entries')
      .update({ status: status === 'cancelled' ? 'cancelled' : 'pending' })
      .eq('account_id', accountId)
      .eq('source_type', 'purchase_order')
      .eq('source_id', purchaseId);

    if (financeError) {
      throw createHttpError(financeError.message, 400);
    }

    return mapPurchase(await fetchPurchaseRow(supabase, accountId, purchaseId));
  },

  confirmEntry: async ({ accountId, userId, purchaseId, payload = {} }) => {
    const supabase = getSupabaseAdminClient();
    const purchase = await fetchPurchaseRow(supabase, accountId, purchaseId);

    if (purchase.status === 'cancelled') {
      throw createHttpError('Compras canceladas não podem confirmar entrada.', 400);
    }

    if (purchase.status === 'delivered') {
      return mapPurchase(purchase);
    }

    for (const item of purchase.purchase_order_items || []) {
      const quantityToReceive = Number(item.quantity_ordered ?? 0) - Number(item.quantity_received ?? 0);
      if (quantityToReceive <= 0) {
        continue;
      }

      const previousQuantity = Number(item.products?.stock_quantity ?? 0);
      const nextQuantity = previousQuantity + quantityToReceive;

      const { error: productError } = await supabase
        .from('products')
        .update({ stock_quantity: nextQuantity })
        .eq('account_id', accountId)
        .eq('id', item.product_id);

      if (productError) {
        throw createHttpError(productError.message, 400);
      }

      const { error: itemError } = await supabase
        .from('purchase_order_items')
        .update({ quantity_received: item.quantity_ordered })
        .eq('account_id', accountId)
        .eq('id', item.id);

      if (itemError) {
        throw createHttpError(itemError.message, 400);
      }

      const { error: movementError } = await supabase.from('stock_movements').insert({
        account_id: accountId,
        product_id: item.product_id,
        purchase_order_id: purchaseId,
        movement_type: 'restock',
        quantity_delta: quantityToReceive,
        previous_quantity: previousQuantity,
        next_quantity: nextQuantity,
        note: `Entrada da compra ${purchase.name}.`,
        created_by: userId,
      });

      if (movementError) {
        throw createHttpError(movementError.message, 400);
      }
    }

    const deliveryDate = normalizeText(payload.deliveryDate) || new Date().toISOString().slice(0, 10);
    const { error: orderError } = await supabase
      .from('purchase_orders')
      .update({
        status: 'delivered',
        delivery_date: deliveryDate,
        confirmed_by: userId,
      })
      .eq('account_id', accountId)
      .eq('id', purchaseId);

    if (orderError) {
      throw createHttpError(orderError.message, 400);
    }

    const { error: financeError } = await supabase
      .from('finance_entries')
      .update({ status: 'pending' })
      .eq('account_id', accountId)
      .eq('source_type', 'purchase_order')
      .eq('source_id', purchaseId);

    if (financeError) {
      throw createHttpError(financeError.message, 400);
    }

    return mapPurchase(await fetchPurchaseRow(supabase, accountId, purchaseId));
  },

  cancel: async ({ accountId, userId, purchaseId, payload = {} }) => {
    const supabase = getSupabaseAdminClient();
    return cancelPurchase(supabase, accountId, userId, purchaseId, payload);
  },
};
