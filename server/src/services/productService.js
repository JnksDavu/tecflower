import { BASE_PRODUCT_CATEGORIES, DEFAULT_PRODUCT_TAGS } from '../constants/productCatalog.js';
import { getSupabaseAdminClient } from '../lib/supabase.js';
import { createHttpError } from '../utils/httpError.js';
import { slugify } from '../utils/slugify.js';

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');
const toNumber = (value) => Number(value);
const toInteger = (value) => Number.parseInt(String(value), 10);

const computeStockStatus = (stockQuantity, minimumStock) => {
  if (stockQuantity <= 0) {
    return 'Sem estoque';
  }

  if (stockQuantity <= minimumStock) {
    return 'Estoque baixo';
  }

  return 'Em estoque';
};

const mapProduct = (row) => {
  const stockQuantity = Number(row.stock_quantity ?? 0);
  const minimumStock = Number(row.minimum_stock ?? 0);

  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    description: row.description || '',
    price: Number(row.price ?? 0),
    stockQuantity,
    minimumStock,
    trackStock: Boolean(row.track_stock),
    isActive: Boolean(row.is_active),
    status: computeStockStatus(stockQuantity, minimumStock),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    category: {
      id: row.product_categories?.id || '',
      name: row.product_categories?.name || '',
      slug: row.product_categories?.slug || '',
      sortOrder: Number(row.product_categories?.sort_order ?? 0),
      isFixed: Boolean(row.product_categories?.is_fixed),
    },
    tags: (row.product_tag_links || [])
      .map((link) => link.product_tags)
      .filter(Boolean)
      .map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        isDefault: Boolean(tag.is_default),
      })),
  };
};

const ensureBaseCategories = async (supabase, accountId) => {
  const payload = BASE_PRODUCT_CATEGORIES.map((category) => ({
    account_id: accountId,
    slug: category.slug,
    name: category.name,
    sort_order: category.sortOrder,
    is_fixed: true,
  }));

  const { error } = await supabase
    .from('product_categories')
    .upsert(payload, {
      onConflict: 'account_id,slug',
      ignoreDuplicates: false,
    });

  if (error) {
    throw createHttpError(error.message, 400);
  }
};

const ensureDefaultTags = async (supabase, accountId) => {
  const payload = DEFAULT_PRODUCT_TAGS.map((tag) => ({
    account_id: accountId,
    slug: tag.slug,
    name: tag.name,
    is_default: true,
  }));

  const { error } = await supabase
    .from('product_tags')
    .upsert(payload, {
      onConflict: 'account_id,slug',
      ignoreDuplicates: false,
    });

  if (error) {
    throw createHttpError(error.message, 400);
  }
};

const ensureCatalogSetup = async (supabase, accountId) => {
  await Promise.all([
    ensureBaseCategories(supabase, accountId),
    ensureDefaultTags(supabase, accountId),
  ]);
};

const loadCategoryBySlug = async (supabase, accountId, categorySlug) => {
  const { data, error } = await supabase
    .from('product_categories')
    .select('id, slug, name, sort_order, is_fixed')
    .eq('account_id', accountId)
    .eq('slug', categorySlug)
    .single();

  if (error || !data) {
    throw createHttpError('Categoria não encontrada.', 400);
  }

  return data;
};

const loadTagsByIds = async (supabase, accountId, tagIds) => {
  if (!tagIds.length) {
    return [];
  }

  const { data, error } = await supabase
    .from('product_tags')
    .select('id, name, slug, is_default')
    .eq('account_id', accountId)
    .in('id', tagIds);

  if (error) {
    throw createHttpError(error.message, 400);
  }

  if ((data || []).length !== tagIds.length) {
    throw createHttpError('Uma ou mais tags são inválidas para esta conta.', 400);
  }

  return data;
};

const syncProductTags = async (supabase, productId, tagIds) => {
  const { error: deleteError } = await supabase
    .from('product_tag_links')
    .delete()
    .eq('product_id', productId);

  if (deleteError) {
    throw createHttpError(deleteError.message, 400);
  }

  if (!tagIds.length) {
    return;
  }

  const { error: insertError } = await supabase.from('product_tag_links').insert(
    tagIds.map((tagId) => ({
      product_id: productId,
      tag_id: tagId,
    })),
  );

  if (insertError) {
    throw createHttpError(insertError.message, 400);
  }
};

const validateProductPayload = (payload) => {
  const name = normalizeText(payload.name);
  const sku = normalizeText(payload.sku).toUpperCase();
  const categorySlug = normalizeText(payload.categorySlug);
  const description = normalizeText(payload.description);
  const price = toNumber(payload.price);
  const stockQuantity = toInteger(payload.stockQuantity);
  const minimumStock = toInteger(payload.minimumStock);
  const trackStock = payload.trackStock !== false;
  const isActive = payload.isActive !== false;
  const tagIds = Array.isArray(payload.tagIds)
    ? [...new Set(payload.tagIds.map((value) => normalizeText(value)).filter(Boolean))]
    : [];

  if (!name) {
    throw createHttpError('Informe o nome do produto.', 400);
  }

  if (!sku) {
    throw createHttpError('Informe o SKU do produto.', 400);
  }

  if (!categorySlug) {
    throw createHttpError('Selecione uma categoria.', 400);
  }

  if (Number.isNaN(price) || price < 0) {
    throw createHttpError('Informe um preço válido.', 400);
  }

  if (Number.isNaN(stockQuantity) || stockQuantity < 0) {
    throw createHttpError('Informe um estoque inicial válido.', 400);
  }

  if (Number.isNaN(minimumStock) || minimumStock < 0) {
    throw createHttpError('Informe um estoque mínimo válido.', 400);
  }

  return {
    name,
    sku,
    categorySlug,
    description,
    price,
    stockQuantity,
    minimumStock,
    trackStock,
    isActive,
    tagIds,
  };
};

const fetchProductRow = async (supabase, accountId, productId) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      sku,
      description,
      price,
      stock_quantity,
      minimum_stock,
      track_stock,
      is_active,
      created_at,
      updated_at,
      product_categories (
        id,
        name,
        slug,
        sort_order,
        is_fixed
      ),
      product_tag_links (
        product_tags (
          id,
          name,
          slug,
          is_default
        )
      )
    `)
    .eq('account_id', accountId)
    .eq('id', productId)
    .single();

  if (error || !data) {
    throw createHttpError('Produto não encontrado.', 404);
  }

  return data;
};

const loadMetadata = async (supabase, accountId) => {
  const [categoriesResult, tagsResult] = await Promise.all([
    supabase
      .from('product_categories')
      .select('id, name, slug, sort_order, is_fixed')
      .eq('account_id', accountId)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
    supabase
      .from('product_tags')
      .select('id, name, slug, is_default')
      .eq('account_id', accountId)
      .order('name', { ascending: true }),
  ]);

  if (categoriesResult.error) {
    throw createHttpError(categoriesResult.error.message, 400);
  }

  if (tagsResult.error) {
    throw createHttpError(tagsResult.error.message, 400);
  }

  return {
    categories: (categoriesResult.data || []).map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      sortOrder: Number(category.sort_order ?? 0),
      isFixed: Boolean(category.is_fixed),
    })),
    tags: (tagsResult.data || []).map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      isDefault: Boolean(tag.is_default),
    })),
    stockStatuses: ['Todos', 'Em estoque', 'Estoque baixo', 'Sem estoque'],
  };
};

const getNextCategorySortOrder = async (supabase, accountId) => {
  const { data, error } = await supabase
    .from('product_categories')
    .select('sort_order')
    .eq('account_id', accountId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw createHttpError(error.message, 400);
  }

  return Number(data?.sort_order ?? 0) + 1;
};

export const productService = {
  list: async ({ accountId, filters = {} }) => {
    const supabase = getSupabaseAdminClient();
    await ensureCatalogSetup(supabase, accountId);

    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        sku,
        description,
        price,
        stock_quantity,
        minimum_stock,
        track_stock,
        is_active,
        created_at,
        updated_at,
        product_categories (
          id,
          name,
          slug,
          sort_order,
          is_fixed
        ),
        product_tag_links (
          product_tags (
            id,
            name,
            slug,
            is_default
          )
        )
      `)
      .eq('account_id', accountId)
      .order('updated_at', { ascending: false });

    const search = normalizeText(filters.search);
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`,
      );
    }

    const categorySlug = normalizeText(filters.category);
    if (categorySlug && categorySlug !== 'all') {
      const category = await loadCategoryBySlug(supabase, accountId, categorySlug);
      query = query.eq('category_id', category.id);
    }

    const stockStatus = normalizeText(filters.stockStatus);
    if (stockStatus === 'Sem estoque') {
      query = query.lte('stock_quantity', 0);
    } else if (stockStatus === 'Em estoque') {
      query = query.gt('stock_quantity', 0);
    }

    const { data, error } = await query;

    if (error) {
      throw createHttpError(error.message, 400);
    }

    let products = (data || []).map(mapProduct);

    if (stockStatus === 'Estoque baixo') {
      products = products.filter((product) => product.status === 'Estoque baixo');
    } else if (stockStatus === 'Em estoque') {
      products = products.filter((product) => product.status === 'Em estoque');
    }

    const tagSlug = normalizeText(filters.tag);
    if (tagSlug && tagSlug !== 'all') {
      products = products.filter((product) => product.tags.some((tag) => tag.slug === tagSlug));
    }

    return products;
  },

  getById: async ({ accountId, productId }) => {
    const supabase = getSupabaseAdminClient();
    await ensureCatalogSetup(supabase, accountId);
    const row = await fetchProductRow(supabase, accountId, productId);
    return mapProduct(row);
  },

  getMetadata: async ({ accountId }) => {
    const supabase = getSupabaseAdminClient();
    await ensureCatalogSetup(supabase, accountId);
    return loadMetadata(supabase, accountId);
  },

  create: async ({ accountId, userId, payload }) => {
    const supabase = getSupabaseAdminClient();
    await ensureCatalogSetup(supabase, accountId);

    const normalized = validateProductPayload(payload);
    const category = await loadCategoryBySlug(supabase, accountId, normalized.categorySlug);
    await loadTagsByIds(supabase, accountId, normalized.tagIds);

    const { data: created, error: createError } = await supabase
      .from('products')
      .insert({
        account_id: accountId,
        category_id: category.id,
        name: normalized.name,
        sku: normalized.sku,
        description: normalized.description,
        price: normalized.price,
        stock_quantity: normalized.stockQuantity,
        minimum_stock: normalized.minimumStock,
        track_stock: normalized.trackStock,
        is_active: normalized.isActive,
      })
      .select('id')
      .single();

    if (createError || !created) {
      throw createHttpError(createError?.message || 'Não foi possível criar o produto.', 400);
    }

    await syncProductTags(supabase, created.id, normalized.tagIds);

    if (normalized.stockQuantity > 0) {
      const { error: movementError } = await supabase.from('stock_movements').insert({
        account_id: accountId,
        product_id: created.id,
        movement_type: 'restock',
        quantity_delta: normalized.stockQuantity,
        previous_quantity: 0,
        next_quantity: normalized.stockQuantity,
        note: 'Estoque inicial do produto.',
        created_by: userId,
      });

      if (movementError) {
        throw createHttpError(movementError.message, 400);
      }
    }

    const row = await fetchProductRow(supabase, accountId, created.id);
    return mapProduct(row);
  },

  update: async ({ accountId, userId, productId, payload }) => {
    const supabase = getSupabaseAdminClient();
    await ensureCatalogSetup(supabase, accountId);

    const currentProduct = await fetchProductRow(supabase, accountId, productId);
    const normalized = validateProductPayload({
      ...currentProduct,
      categorySlug: currentProduct.product_categories?.slug,
      tagIds: (currentProduct.product_tag_links || [])
        .map((link) => link.product_tags?.id)
        .filter(Boolean),
      ...payload,
    });

    const category = await loadCategoryBySlug(supabase, accountId, normalized.categorySlug);
    await loadTagsByIds(supabase, accountId, normalized.tagIds);

    const { error: updateError } = await supabase
      .from('products')
      .update({
        category_id: category.id,
        name: normalized.name,
        sku: normalized.sku,
        description: normalized.description,
        price: normalized.price,
        stock_quantity: normalized.stockQuantity,
        minimum_stock: normalized.minimumStock,
        track_stock: normalized.trackStock,
        is_active: normalized.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('account_id', accountId)
      .eq('id', productId);

    if (updateError) {
      throw createHttpError(updateError.message, 400);
    }

    await syncProductTags(supabase, productId, normalized.tagIds);

    const previousQuantity = Number(currentProduct.stock_quantity ?? 0);
    const nextQuantity = normalized.stockQuantity;

    if (previousQuantity !== nextQuantity) {
      const quantityDelta = nextQuantity - previousQuantity;
      const { error: movementError } = await supabase.from('stock_movements').insert({
        account_id: accountId,
        product_id: productId,
        movement_type: quantityDelta > 0 ? 'restock' : 'manual_adjustment',
        quantity_delta: quantityDelta,
        previous_quantity: previousQuantity,
        next_quantity: nextQuantity,
        note: 'Estoque ajustado na edição do produto.',
        created_by: userId,
      });

      if (movementError) {
        throw createHttpError(movementError.message, 400);
      }
    }

    const row = await fetchProductRow(supabase, accountId, productId);
    return mapProduct(row);
  },

  adjustStock: async ({ accountId, userId, productId, payload }) => {
    const supabase = getSupabaseAdminClient();
    await ensureCatalogSetup(supabase, accountId);

    const quantityDelta = toInteger(payload.quantityDelta);
    const note = normalizeText(payload.note);

    if (Number.isNaN(quantityDelta) || quantityDelta === 0) {
      throw createHttpError('Informe um ajuste de estoque diferente de zero.', 400);
    }

    const { data: current, error: currentError } = await supabase
      .from('products')
      .select('id, stock_quantity')
      .eq('account_id', accountId)
      .eq('id', productId)
      .single();

    if (currentError || !current) {
      throw createHttpError('Produto não encontrado.', 404);
    }

    const previousQuantity = Number(current.stock_quantity ?? 0);
    const nextQuantity = previousQuantity + quantityDelta;

    if (nextQuantity < 0) {
      throw createHttpError('O ajuste não pode deixar o estoque negativo.', 400);
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({
        stock_quantity: nextQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq('account_id', accountId)
      .eq('id', productId);

    if (updateError) {
      throw createHttpError(updateError.message, 400);
    }

    const { error: movementError } = await supabase.from('stock_movements').insert({
      account_id: accountId,
      product_id: productId,
      movement_type: quantityDelta > 0 ? 'restock' : 'manual_adjustment',
      quantity_delta: quantityDelta,
      previous_quantity: previousQuantity,
      next_quantity: nextQuantity,
      note: note || 'Ajuste manual de estoque.',
      created_by: userId,
    });

    if (movementError) {
      throw createHttpError(movementError.message, 400);
    }

    const row = await fetchProductRow(supabase, accountId, productId);
    return mapProduct(row);
  },

  createTag: async ({ accountId, payload }) => {
    const supabase = getSupabaseAdminClient();
    await ensureCatalogSetup(supabase, accountId);

    const name = normalizeText(payload.name);

    if (!name) {
      throw createHttpError('Informe o nome da tag.', 400);
    }

    const slug = slugify(name);

    if (!slug) {
      throw createHttpError('Informe um nome de tag válido.', 400);
    }

    const { data, error } = await supabase
      .from('product_tags')
      .insert({
        account_id: accountId,
        name,
        slug,
        is_default: false,
      })
      .select('id, name, slug, is_default')
      .single();

    if (error || !data) {
      throw createHttpError(error?.message || 'Não foi possível criar a tag.', 400);
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      isDefault: Boolean(data.is_default),
    };
  },

  createCategory: async ({ accountId, payload }) => {
    const supabase = getSupabaseAdminClient();
    await ensureCatalogSetup(supabase, accountId);

    const name = normalizeText(payload.name);

    if (!name) {
      throw createHttpError('Informe o nome da categoria.', 400);
    }

    const slug = slugify(name);

    if (!slug) {
      throw createHttpError('Informe um nome de categoria válido.', 400);
    }

    const sortOrder = await getNextCategorySortOrder(supabase, accountId);

    const { data, error } = await supabase
      .from('product_categories')
      .insert({
        account_id: accountId,
        name,
        slug,
        sort_order: sortOrder,
        is_fixed: false,
      })
      .select('id, name, slug, sort_order, is_fixed')
      .single();

    if (error || !data) {
      throw createHttpError(error?.message || 'Não foi possível criar a categoria.', 400);
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      sortOrder: Number(data.sort_order ?? 0),
      isFixed: Boolean(data.is_fixed),
    };
  },

  listStockMovements: async ({ accountId }) => {
    const supabase = getSupabaseAdminClient();
    await ensureCatalogSetup(supabase, accountId);

    const { data, error } = await supabase
      .from('stock_movements')
      .select(`
        id,
        movement_type,
        quantity_delta,
        previous_quantity,
        next_quantity,
        note,
        created_at,
        products (
          id,
          name,
          sku
        )
      `)
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw createHttpError(error.message, 400);
    }

    return (data || []).map((movement) => ({
      id: movement.id,
      movementType: movement.movement_type,
      quantityDelta: Number(movement.quantity_delta ?? 0),
      previousQuantity: Number(movement.previous_quantity ?? 0),
      nextQuantity: Number(movement.next_quantity ?? 0),
      note: movement.note || '',
      createdAt: movement.created_at,
      product: {
        id: movement.products?.id || '',
        name: movement.products?.name || '',
        sku: movement.products?.sku || '',
      },
    }));
  },
};
