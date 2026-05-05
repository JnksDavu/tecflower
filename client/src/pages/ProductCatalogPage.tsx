import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Panel } from '@/components/Panel';
import { productController } from '@/controllers/productController';
import type { Product } from '@/models/types';
import {
  buildProductPayload,
  CatalogProductGrid,
  createEmptyProductForm,
  emptyMetadata,
  FilterOption,
  InventoryAdjustmentModal,
  LoadingSpinner,
  mapProductToForm,
  ProductFormModal,
  ProductFormState,
  SearchableFilter,
} from '@/features/products/productUi';

const parseNonNegativeInteger = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
};

export const ProductCatalogPage = () => {
  const [metadata, setMetadata] = useState(emptyMetadata);
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    productId: 'all',
    category: 'all',
    stockStatus: 'Todos',
    tag: 'all',
  });
  const [productForm, setProductForm] = useState<ProductFormState>(createEmptyProductForm(emptyMetadata));
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockForm, setStockForm] = useState({
    direction: 'increase' as 'increase' | 'decrease',
    quantityMoved: '0',
    newStockQuantity: '0',
    note: '',
  });

  const productOptions = useMemo<FilterOption[]>(
    () => [
      { label: 'Todos os produtos', value: 'all' },
      ...catalogProducts.map((product) => ({
        label: product.name,
        value: product.id,
        keywords: `${product.sku} ${product.category.name} ${product.description}`,
      })),
    ],
    [catalogProducts],
  );

  const categoryOptions = useMemo<FilterOption[]>(
    () => [{ label: 'Todas as categorias', value: 'all' }, ...metadata.categories.map((category) => ({ label: category.name, value: category.slug }))],
    [metadata.categories],
  );

  const tagOptions = useMemo<FilterOption[]>(
    () => [{ label: 'Todas as tags', value: 'all' }, ...metadata.tags.map((tag) => ({ label: tag.name, value: tag.slug }))],
    [metadata.tags],
  );

  const stockStatusOptions = useMemo<FilterOption[]>(
    () => metadata.stockStatuses.map((status) => ({ label: status, value: status })),
    [metadata.stockStatuses],
  );

  const filteredProducts = useMemo(
    () => products.filter((product) => filters.productId === 'all' || product.id === filters.productId),
    [filters.productId, products],
  );

  const stats = useMemo(() => {
    const totalItems = filteredProducts.length;
    const totalUnits = filteredProducts.reduce((sum, product) => sum + product.stockQuantity, 0);
    const lowStock = filteredProducts.filter((product) => product.status === 'Estoque baixo').length;
    const noStock = filteredProducts.filter((product) => product.status === 'Sem estoque').length;

    return [
      { label: 'Produtos cadastrados', value: totalItems, tone: 'text-brand-bark' },
      { label: 'Unidades em estoque', value: totalUnits, tone: 'text-[#3d8140]' },
      { label: 'Alertas de estoque baixo', value: lowStock, tone: 'text-[#af7f1d]' },
      { label: 'Sem estoque', value: noStock, tone: 'text-[#b53a64]' },
    ];
  }, [filteredProducts]);

  const loadMetadata = async () => {
    const nextMetadata = await productController.getMetadata();
    setMetadata(nextMetadata);
    setProductForm((current) => current.categorySlug ? current : createEmptyProductForm(nextMetadata));
  };

  const loadCatalogProducts = async () => {
    const allProducts = await productController.list();
    setCatalogProducts(allProducts);
  };

  const loadProducts = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const nextProducts = await productController.list({
        search: filters.search,
        category: filters.category,
        stockStatus: filters.stockStatus,
        tag: filters.tag,
      });
      setProducts(nextProducts);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar os produtos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        await Promise.all([loadMetadata(), loadCatalogProducts()]);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar o catálogo.');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters.category, filters.search, filters.stockStatus, filters.tag]);

  const handleProductFormChange =
    (field: keyof ProductFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const nextValue =
        event.target instanceof HTMLInputElement && event.target.type === 'checkbox'
          ? event.target.checked
          : event.target.value;

      setProductForm((current) => ({
        ...current,
        [field]: nextValue,
      }));
    };

  const toggleTag = (tagId: string) => {
    setProductForm((current) => ({
      ...current,
      tagIds: current.tagIds.includes(tagId)
        ? current.tagIds.filter((value) => value !== tagId)
        : [...current.tagIds, tagId],
    }));
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setProductForm(createEmptyProductForm(metadata));
    setIsProductModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setProductForm(mapProductToForm(product));
    setIsProductModalOpen(true);
  };

  const openStockModal = (product: Product) => {
    setStockProduct(product);
    setStockForm({
      direction: 'increase',
      quantityMoved: '0',
      newStockQuantity: String(product.stockQuantity),
      note: '',
    });
  };

  const handleStockStep = (step: 1 | -1) => {
    setStockForm((current) => {
      const currentStock = stockProduct?.stockQuantity ?? 0;
      const currentProjectedStock = parseNonNegativeInteger(current.newStockQuantity);
      const nextStockQuantity = Math.max(0, currentProjectedStock + step);
      const direction = nextStockQuantity >= currentStock ? 'increase' : 'decrease';
      const quantityMoved = Math.abs(nextStockQuantity - currentStock);

      return {
        ...current,
        direction,
        quantityMoved: String(quantityMoved),
        newStockQuantity: String(nextStockQuantity),
      };
    });
  };

  const handleStockQuantityMovedChange = (value: string) => {
    setStockForm((current) => {
      const currentStock = stockProduct?.stockQuantity ?? 0;
      const rawQuantity = parseNonNegativeInteger(value);
      const quantityMoved =
        current.direction === 'decrease'
          ? Math.min(rawQuantity, currentStock)
          : rawQuantity;
      const newStockQuantity =
        current.direction === 'increase'
          ? currentStock + quantityMoved
          : Math.max(0, currentStock - quantityMoved);

      return {
        ...current,
        quantityMoved: String(quantityMoved),
        newStockQuantity: String(newStockQuantity),
      };
    });
  };

  const handleStockNewQuantityChange = (value: string) => {
    setStockForm((current) => {
      const currentStock = stockProduct?.stockQuantity ?? 0;
      const nextStock = parseNonNegativeInteger(value);
      const direction = nextStock >= currentStock ? 'increase' : 'decrease';
      const quantityMoved = Math.abs(nextStock - currentStock);

      return {
        ...current,
        direction,
        quantityMoved: String(quantityMoved),
        newStockQuantity: String(nextStock),
      };
    });
  };

  const handleProductSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (editingProduct) {
        await productController.update(editingProduct.id, buildProductPayload(productForm));
        setSuccessMessage('Produto atualizado com sucesso.');
      } else {
        await productController.create(buildProductPayload(productForm));
        setSuccessMessage('Produto criado com sucesso.');
      }

      setIsProductModalOpen(false);
      await Promise.all([loadMetadata(), loadCatalogProducts(), loadProducts()]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar o produto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Excluir o produto "${product.name}"?`)) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    try {
      await productController.remove(product.id);
      setSuccessMessage('Produto excluído com sucesso.');
      await Promise.all([loadMetadata(), loadCatalogProducts(), loadProducts()]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível excluir o produto.');
    }
  };

  const handleAdjustStock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stockProduct) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const quantityMoved = parseNonNegativeInteger(stockForm.quantityMoved);
      const quantityDelta = stockForm.direction === 'increase' ? quantityMoved : -quantityMoved;

      await productController.adjustStock(stockProduct.id, {
        quantityDelta,
        note: stockForm.note,
      });
      setSuccessMessage('Estoque ajustado com sucesso.');
      setStockProduct(null);
      await Promise.all([loadCatalogProducts(), loadProducts()]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível ajustar o estoque.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Catálogo"
        description="Visão geral do catálogo com filtros, indicadores e cadastro central de produtos."
        titleColor="text-[#7B5CE6]"
        action={<Button className="min-w-[164px]" onClick={openCreateModal}>Adicionar produto</Button>}
      />

      <section className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Panel key={stat.label} className="rounded-[22px] border border-[#e6ded2] bg-white p-5 shadow-[0_14px_32px_rgba(55,43,46,0.06)]">
            <p className="text-center text-sm text-[#8d8a84]">{stat.label}</p>
            <div className="mt-3 flex min-h-[36px] items-center justify-center">
              {isLoading ? <LoadingSpinner className="h-7 w-7" /> : <p className={`text-[28px] font-bold ${stat.tone}`}>{stat.value}</p>}
            </div>
          </Panel>
        ))}
      </section>

      <section className="mt-6 rounded-[28px] border border-[#e6ded2] bg-white p-5 shadow-[0_18px_42px_rgba(55,43,46,0.07)]">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_repeat(4,minmax(0,0.78fr))]">
          <div>
            <p className="mb-2 text-sm font-medium text-brand-bark">Busca geral</p>
            <div className="flex items-center gap-3 rounded-[18px] border border-[#ddd6cb] bg-white px-4 shadow-[0_10px_24px_rgba(55,43,46,0.06)]">
              <svg viewBox="0 0 20 20" className="h-4 w-4 text-[#8f8d87]" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m14 14 4 4M8.5 15A6.5 6.5 0 1 1 15 8.5 6.5 6.5 0 0 1 8.5 15Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                className="h-12 w-full border-none bg-transparent text-[15px] text-brand-bark outline-none placeholder:text-[#8f8d87]"
                placeholder="Buscar por nome, categoria, descrição ou SKU"
              />
            </div>
          </div>
          <SearchableFilter label="Produto" value={filters.productId} options={productOptions} searchPlaceholder="Pesquisar produto" onSelect={(value) => setFilters((current) => ({ ...current, productId: value }))} />
          <SearchableFilter label="Categoria" value={filters.category} options={categoryOptions} searchPlaceholder="Pesquisar categoria" onSelect={(value) => setFilters((current) => ({ ...current, category: value }))} />
          <SearchableFilter label="Status" value={filters.stockStatus} options={stockStatusOptions} searchPlaceholder="Pesquisar status" onSelect={(value) => setFilters((current) => ({ ...current, stockStatus: value }))} />
          <SearchableFilter label="Tag" value={filters.tag} options={tagOptions} searchPlaceholder="Pesquisar tag" onSelect={(value) => setFilters((current) => ({ ...current, tag: value }))} />
        </div>
      </section>

      {errorMessage ? <div className="mt-4 rounded-2xl border border-[#f3d5df] bg-[#fff7f9] px-4 py-3 text-sm text-[#9a3253]">{errorMessage}</div> : null}
      {successMessage ? <div className="mt-4 rounded-2xl border border-[#d9f0df] bg-[#f4fbf6] px-4 py-3 text-sm text-[#27633a]">{successMessage}</div> : null}

      <section className="mt-6">
        {filteredProducts.length || isLoading ? (
          <CatalogProductGrid
            isLoading={isLoading}
            products={filteredProducts}
            onEdit={openEditModal}
            onAdjustStock={openStockModal}
            onDelete={handleDeleteProduct}
          />
        ) : (
          <Panel title="Nenhum produto encontrado" description="Ajuste os filtros ou crie um novo produto." action={<Button size="sm" onClick={openCreateModal}>Cadastrar produto</Button>} />
        )}
      </section>

      <ProductFormModal
        isOpen={isProductModalOpen}
        metadata={metadata}
        form={productForm}
        editingProduct={editingProduct}
        isSubmitting={isSubmitting}
        onClose={() => setIsProductModalOpen(false)}
        onChange={handleProductFormChange}
        onToggleTag={toggleTag}
        onSubmit={handleProductSubmit}
      />

      <InventoryAdjustmentModal
        isOpen={Boolean(stockProduct)}
        product={stockProduct}
        direction={stockForm.direction}
        quantityMoved={stockForm.quantityMoved}
        newStockQuantity={stockForm.newStockQuantity}
        note={stockForm.note}
        isSubmitting={isSubmitting}
        onClose={() => setStockProduct(null)}
        onIncrease={() => handleStockStep(1)}
        onDecrease={() => handleStockStep(-1)}
        onQuantityMovedChange={handleStockQuantityMovedChange}
        onNewStockChange={handleStockNewQuantityChange}
        onNoteChange={(value) => setStockForm((current) => ({ ...current, note: value }))}
        onSubmit={handleAdjustStock}
      />
    </div>
  );
};
