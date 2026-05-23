import { getSupabaseAdminClient } from '../lib/supabase.js';
import { createHttpError } from '../utils/httpError.js';

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const mapSupplier = (row) => ({
  id: row.id,
  name: row.name,
  document: row.document || '',
  phone: row.phone || '',
  email: row.email || '',
  notes: row.notes || '',
  isActive: Boolean(row.is_active),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const validateSupplierPayload = (payload = {}) => {
  const name = normalizeText(payload.name);

  if (!name) {
    throw createHttpError('Informe o nome do fornecedor.', 400);
  }

  return {
    name,
    document: normalizeText(payload.document),
    phone: normalizeText(payload.phone),
    email: normalizeText(payload.email),
    notes: normalizeText(payload.notes),
    isActive: payload.isActive !== false,
  };
};

const fetchSupplier = async (supabase, accountId, supplierId) => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('id, name, document, phone, email, notes, is_active, created_at, updated_at')
    .eq('account_id', accountId)
    .eq('id', supplierId)
    .single();

  if (error || !data) {
    throw createHttpError('Fornecedor não encontrado.', 404);
  }

  return data;
};

export const supplierService = {
  list: async ({ accountId, filters = {} }) => {
    const supabase = getSupabaseAdminClient();
    let query = supabase
      .from('suppliers')
      .select('id, name, document, phone, email, notes, is_active, created_at, updated_at')
      .eq('account_id', accountId)
      .order('name', { ascending: true });

    if (filters.activeOnly !== 'false') {
      query = query.eq('is_active', true);
    }

    const search = normalizeText(filters.search);
    if (search) {
      query = query.or(`name.ilike.%${search}%,document.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      throw createHttpError(error.message, 400);
    }

    return (data || []).map(mapSupplier);
  },

  create: async ({ accountId, userId, payload }) => {
    const supabase = getSupabaseAdminClient();
    const normalized = validateSupplierPayload(payload);

    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        account_id: accountId,
        name: normalized.name,
        document: normalized.document,
        phone: normalized.phone,
        email: normalized.email,
        notes: normalized.notes,
        is_active: normalized.isActive,
        created_by: userId,
      })
      .select('id')
      .single();

    if (error || !data) {
      throw createHttpError(error?.message || 'Não foi possível criar o fornecedor.', 400);
    }

    return mapSupplier(await fetchSupplier(supabase, accountId, data.id));
  },

  update: async ({ accountId, supplierId, payload }) => {
    const supabase = getSupabaseAdminClient();
    await fetchSupplier(supabase, accountId, supplierId);
    const normalized = validateSupplierPayload(payload);

    const { error } = await supabase
      .from('suppliers')
      .update({
        name: normalized.name,
        document: normalized.document,
        phone: normalized.phone,
        email: normalized.email,
        notes: normalized.notes,
        is_active: normalized.isActive,
      })
      .eq('account_id', accountId)
      .eq('id', supplierId);

    if (error) {
      throw createHttpError(error.message, 400);
    }

    return mapSupplier(await fetchSupplier(supabase, accountId, supplierId));
  },

  remove: async ({ accountId, supplierId }) => {
    const supabase = getSupabaseAdminClient();
    await fetchSupplier(supabase, accountId, supplierId);

    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('account_id', accountId)
      .eq('id', supplierId);

    if (error) {
      throw createHttpError(error.message, 400);
    }

    return { id: supplierId };
  },
};
