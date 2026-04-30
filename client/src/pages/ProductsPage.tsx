import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { PageHeader } from '@/components/PageHeader';
import { Panel } from '@/components/Panel';
import { ProductCard } from '@/components/ProductCard';
import { SelectField } from '@/components/SelectField';
import { productController } from '@/controllers/productController';
import type {
  Product,
  ProductCatalogMetadata,
  ProductStatus,
  ProductUpsertPayload,
} from '@/models/types';

interface ProductFormState {
  name: string;
  sku: string;
  description: string;
  categorySlug: string;
  price: string;
  stockQuantity: string;
  minimumStock: string;
  trackStock: boolean;
  isActive: boolean;
  tagIds: string[];
}

interface StockAdjustmentState {
  quantityDelta: string;
  note: string;
}

const emptyMetadata: ProductCatalogMetadata = {
  categories: [],
  tags: [],
  stockStatuses: ['Todos', 'Em estoque', 'Estoque baixo', 'Sem estoque'],
};

const createEmptyForm = (metadata: ProductCatalogMetadata): ProductFormState => ({
  name: '',
  sku: '',
  description: '',
  categorySlug: metadata.categories[0]?.slug || '',
  price: '',
  stockQuantity: '0',
  minimumStock: '3',
  trackStock: true,
  isActive: true,
  tagIds: [],
});

const mapProductToForm = (product: Product): ProductFormState => ({
  name: product.name,
  sku: product.sku,
  description: product.description,
  categorySlug: product.category.slug,
  price: String(product.price),
  stockQuantity: String(product.stockQuantity),
  minimumStock: String(product.minimumStock),
  trackStock: product.trackStock,
  isActive: product.isActive,
  tagIds: product.tags.map((tag) => tag.id),
});

const statusTone: Record<ProductStatus, string> = {
  'Em estoque': 'text-[#3d8140]',
  'Estoque baixo': 'text-[#af7f1d]',
  'Sem estoque': 'text-[#b53a64]',
};

export const ProductsPage = () => {
  const [metadata, setMetadata] = useState<ProductCatalogMetadata>(emptyMetadata);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    stockStatus: 'Todos',
    tag: 'all',
  });
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(createEmptyForm(emptyMetadata));
  const [newTagName, setNewTagName] = useState('');
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockForm, setStockForm] = useState<StockAdjustmentState>({
    quantityDelta: '',
    note: '',
  });

  const categoryOptions = useMemo(
    () => [{ label: 'Todas', value: 'all' }, ...metadata.categories.map((category) => ({ label: category.name, value: category.slug }))],
    [metadata.categories],
  );

  const tagOptions = useMemo(
    () => [{ label: 'Todas', value: 'all' }, ...metadata.tags.map((tag) => ({ label: tag.name, value: tag.slug }))],
    [metadata.tags],
  );

  const stockStatusOptions = useMemo(
    () => metadata.stockStatuses.map((status) => ({ label: status, value: status })),
    [metadata.stockStatuses],
  );

  const stats = useMemo(() => {
    const totalItems = products.length;
    const totalUnits = products.reduce((sum, product) => sum + product.stockQuantity, 0);
    const lowStock = products.filter((product) => product.status === 'Estoque baixo').length;
    const noStock = products.filter((product) => product.status === 'Sem estoque').length;

    return [
      { label: 'Produtos cadastrados', value: totalItems, tone: 'text-brand-bark' },
      { label: 'Unidades em estoque', value: totalUnits, tone: 'text-[#3d8140]' },
      { label: 'Alertas de estoque baixo', value: lowStock, tone: 'text-[#af7f1d]' },
      { label: 'Sem estoque', value: noStock, tone: 'text-[#b53a64]' },
    ];
  }, [products]);

  const loadMetadata = async () => {
    const nextMetadata = await productController.getMetadata();
    setMetadata(nextMetadata);

    setProductForm((current) =>
      current.categorySlug
        ? current
        : {
            ...current,
            categorySlug: nextMetadata.categories[0]?.slug || '',
          },
    );
  };

  const loadProducts = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const nextProducts = await productController.list(filters);
      setProducts(nextProducts);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar os produtos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadPage = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        await loadMetadata();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar o catálogo.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters.category, filters.search, filters.stockStatus, filters.tag]);

  const resetMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const openCreateForm = () => {
    resetMessages();
    setEditingProduct(null);
    setStockProduct(null);
    setProductForm(createEmptyForm(metadata));
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    resetMessages();
    setEditingProduct(product);
    setStockProduct(null);
    setProductForm(mapProductToForm(product));
    setShowForm(true);
  };

  const openStockAdjustment = (product: Product) => {
    resetMessages();
    setShowForm(false);
    setStockProduct(product);
    setStockForm({
      quantityDelta: '',
      note: '',
    });
  };

  const handleFilterChange =
    (field: 'category' | 'stockStatus' | 'tag') =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      setFilters((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFilters((current) => ({
      ...current,
      search: event.target.value,
    }));
  };

  const handleFormChange =
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

  const buildPayload = (): ProductUpsertPayload => ({
    name: productForm.name,
    sku: productForm.sku,
    description: productForm.description,
    categorySlug: productForm.categorySlug,
    price: Number(productForm.price),
    stockQuantity: Number(productForm.stockQuantity),
    minimumStock: Number(productForm.minimumStock),
    trackStock: productForm.trackStock,
    isActive: productForm.isActive,
    tagIds: productForm.tagIds,
  });

  const handleProductSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();
    setIsSubmitting(true);

    try {
      if (editingProduct) {
        await productController.update(editingProduct.id, buildPayload());
        setSuccessMessage('Produto atualizado com sucesso.');
      } else {
        await productController.create(buildPayload());
        setSuccessMessage('Produto criado com sucesso.');
      }

      setShowForm(false);
      setEditingProduct(null);
      await Promise.all([loadMetadata(), loadProducts()]);
      setProductForm(createEmptyForm(metadata));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar o produto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();
    setIsSubmitting(true);

    try {
      const tag = await productController.createTag(newTagName);
      setNewTagName('');
      setProductForm((current) => ({
        ...current,
        tagIds: current.tagIds.includes(tag.id) ? current.tagIds : [...current.tagIds, tag.id],
      }));
      await loadMetadata();
      setSuccessMessage('Tag criada e vinculada ao formulário.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível criar a tag.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stockProduct) {
      return;
    }

    resetMessages();
    setIsSubmitting(true);

    try {
      await productController.adjustStock(stockProduct.id, {
        quantityDelta: Number(stockForm.quantityDelta),
        note: stockForm.note,
      });
      setSuccessMessage('Estoque ajustado com sucesso.');
      setStockProduct(null);
      await loadProducts();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível ajustar o estoque.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Produtos"
        titleColor="text-[#7B5CE6]"
        action={<Button className="min-w-[154px]" onClick={openCreateForm}>Novo Produto</Button>}
      />

      <section className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Panel key={stat.label} className="rounded-[22px] border-none bg-[linear-gradient(180deg,#ffffff_0%,#fbf8f3_100%)] p-5">
            <p className="text-sm text-[#8d8a84]">{stat.label}</p>
            <p className={`mt-3 text-[28px] font-bold ${stat.tone}`}>{stat.value}</p>
          </Panel>
        ))}
      </section>

      <section className="mt-6 rounded-[24px] border border-[#ebe6de] bg-white p-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,0.6fr))]">
          <div className="flex items-center gap-3 rounded-full border border-[#ebe6de] bg-[#faf8f3] px-4">
            <svg viewBox="0 0 20 20" className="h-4 w-4 text-[#8f8d87]" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m14 14 4 4M8.5 15A6.5 6.5 0 1 1 15 8.5 6.5 6.5 0 0 1 8.5 15Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              value={filters.search}
              onChange={handleSearchChange}
              className="h-12 w-full border-none bg-transparent text-[15px] text-brand-bark outline-none placeholder:text-[#8f8d87]"
              placeholder="Buscar por nome, categoria, descrição ou SKU"
            />
          </div>

          <SelectField label="Categoria" value={filters.category} options={categoryOptions} onChange={handleFilterChange('category')} />
          <SelectField label="Status de estoque" value={filters.stockStatus} options={stockStatusOptions} onChange={handleFilterChange('stockStatus')} />
          <SelectField label="Tag" value={filters.tag} options={tagOptions} onChange={handleFilterChange('tag')} />
        </div>
      </section>

      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-[#f3d5df] bg-[#fff7f9] px-4 py-3 text-sm text-[#9a3253]">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-4 rounded-2xl border border-[#d9f0df] bg-[#f4fbf6] px-4 py-3 text-sm text-[#27633a]">
          {successMessage}
        </div>
      ) : null}

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.9fr)]">
        <div className="space-y-4">
          {isLoading ? (
            <Panel title="Carregando produtos" description="Buscando catálogo e estoque da sua conta." />
          ) : products.length ? (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={openEditForm}
                onAdjustStock={openStockAdjustment}
              />
            ))
          ) : (
            <Panel
              title="Nenhum produto encontrado"
              description="Ajuste os filtros ou cadastre o primeiro produto do catálogo."
              action={<Button size="sm" onClick={openCreateForm}>Cadastrar produto</Button>}
            />
          )}
        </div>

        <div className="space-y-4">
          <Panel
            title={editingProduct ? 'Editar produto' : 'Cadastro de produto'}
            description="Estrutura com categoria fixa, tags livres e regras próprias de estoque."
            action={
              showForm ? (
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  Fechar
                </Button>
              ) : (
                <Button size="sm" onClick={openCreateForm}>
                  Novo
                </Button>
              )
            }
          >
            {showForm ? (
              <form className="space-y-4" onSubmit={handleProductSubmit}>
                <Input label="Nome do produto" value={productForm.name} onChange={handleFormChange('name')} required />
                <div className="grid gap-3 md:grid-cols-2">
                  <Input label="SKU" value={productForm.sku} onChange={handleFormChange('sku')} required />
                  <SelectField
                    label="Categoria"
                    value={productForm.categorySlug}
                    options={metadata.categories.map((category) => ({ label: category.name, value: category.slug }))}
                    onChange={handleFormChange('categorySlug')}
                  />
                </div>
                <label className="flex w-full flex-col gap-2 text-sm font-medium text-brand-bark">
                  <span>Descrição</span>
                  <textarea
                    value={productForm.description}
                    onChange={handleFormChange('description')}
                    rows={4}
                    className="w-full rounded-[20px] border border-[#d7d7d1] bg-[#f4f4f1] px-4 py-3 text-sm text-brand-bark outline-none transition placeholder:text-[#9b9a94] focus:border-brand-sage focus:bg-white"
                    placeholder="Descreva composição, ocasião, flores e observações internas."
                  />
                </label>
                <div className="grid gap-3 md:grid-cols-3">
                  <Input label="Preço" type="number" min="0" step="0.01" value={productForm.price} onChange={handleFormChange('price')} required />
                  <Input label="Estoque atual" type="number" min="0" value={productForm.stockQuantity} onChange={handleFormChange('stockQuantity')} required />
                  <Input label="Estoque mínimo" type="number" min="0" value={productForm.minimumStock} onChange={handleFormChange('minimumStock')} required />
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-brand-bark">Tags do produto</p>
                  <div className="flex flex-wrap gap-2">
                    {metadata.tags.map((tag) => {
                      const isSelected = productForm.tagIds.includes(tag.id);

                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                            isSelected
                              ? 'bg-[#6f3fe4] text-white shadow-[0_12px_24px_rgba(111,63,228,0.18)]'
                              : 'border border-[#ded8f0] bg-[#faf7ff] text-[#6f3fe4]'
                          }`}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-[20px] border border-[#e8e1d6] bg-[#faf8f3] px-4 py-3 text-sm text-brand-bark">
                    <input
                      type="checkbox"
                      checked={productForm.trackStock}
                      onChange={handleFormChange('trackStock')}
                      className="h-4 w-4 rounded border-[#cfc8be] text-[#6f3fe4] focus:ring-[#b89cff]"
                    />
                    Controlar estoque deste produto
                  </label>
                  <label className="flex items-center gap-3 rounded-[20px] border border-[#e8e1d6] bg-[#faf8f3] px-4 py-3 text-sm text-brand-bark">
                    <input
                      type="checkbox"
                      checked={productForm.isActive}
                      onChange={handleFormChange('isActive')}
                      className="h-4 w-4 rounded border-[#cfc8be] text-[#6f3fe4] focus:ring-[#b89cff]"
                    />
                    Produto ativo para venda
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : editingProduct ? 'Salvar alterações' : 'Cadastrar produto'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowForm(false);
                      setEditingProduct(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="rounded-[20px] border border-dashed border-[#d8d1c6] bg-[#fcfbf8] px-4 py-6 text-sm text-[#8d8a84]">
                Abra o formulário para cadastrar ou editar um produto do catálogo.
              </div>
            )}
          </Panel>

          <Panel title="Criar nova tag" description="As tags ajudam a segmentar catálogo, campanhas e ocasiões de compra.">
            <form className="space-y-3" onSubmit={handleTagSubmit}>
              <Input
                label="Nome da tag"
                value={newTagName}
                onChange={(event) => setNewTagName(event.target.value)}
                placeholder="Ex.: Dia das Mães, Maternidade, Premium"
                required
              />
              <Button type="submit" variant="secondary" disabled={isSubmitting}>
                {isSubmitting ? 'Criando...' : 'Criar tag'}
              </Button>
            </form>
          </Panel>

          <Panel
            title={stockProduct ? `Ajustar estoque: ${stockProduct.name}` : 'Ajuste de estoque'}
            description="Use para entradas, perdas e correções manuais sem editar o produto inteiro."
          >
            {stockProduct ? (
              <form className="space-y-4" onSubmit={handleStockSubmit}>
                <div className="rounded-[20px] border border-[#eee5d9] bg-[#fcfaf6] px-4 py-3">
                  <p className="text-sm text-[#8d8a84]">Estoque atual</p>
                  <p className={`mt-2 text-2xl font-bold ${statusTone[stockProduct.status]}`}>
                    {stockProduct.stockQuantity} unidades
                  </p>
                </div>
                <Input
                  label="Ajuste de quantidade"
                  type="number"
                  value={stockForm.quantityDelta}
                  onChange={(event) =>
                    setStockForm((current) => ({
                      ...current,
                      quantityDelta: event.target.value,
                    }))
                  }
                  placeholder="Use positivo para entrada e negativo para saída"
                  required
                />
                <label className="flex w-full flex-col gap-2 text-sm font-medium text-brand-bark">
                  <span>Motivo</span>
                  <textarea
                    value={stockForm.note}
                    onChange={(event) =>
                      setStockForm((current) => ({
                        ...current,
                        note: event.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full rounded-[20px] border border-[#d7d7d1] bg-[#f4f4f1] px-4 py-3 text-sm text-brand-bark outline-none transition placeholder:text-[#9b9a94] focus:border-brand-sage focus:bg-white"
                    placeholder="Ex.: compra no fornecedor, quebra de vaso, correção de inventário."
                  />
                </label>
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Aplicando...' : 'Aplicar ajuste'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setStockProduct(null)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="rounded-[20px] border border-dashed border-[#d8d1c6] bg-[#fcfbf8] px-4 py-6 text-sm text-[#8d8a84]">
                Selecione um produto na lista para registrar entrada ou saída de estoque.
              </div>
            )}
          </Panel>
        </div>
      </section>
    </div>
  );
};
