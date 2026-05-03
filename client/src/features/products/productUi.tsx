import type { ChangeEvent, FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Panel } from '@/components/Panel';
import { ProductCard } from '@/components/ProductCard';
import { StatusBadge } from '@/components/StatusBadge';
import type {
  Product,
  ProductCategory,
  ProductCatalogMetadata,
  ProductStatus,
  ProductTag,
  ProductUpsertPayload,
} from '@/models/types';
import { formatCurrency } from '@/utils/formatters';

export interface ProductFormState {
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

export interface FilterOption {
  label: string;
  value: string;
  keywords?: string;
}

export const emptyMetadata: ProductCatalogMetadata = {
  categories: [],
  tags: [],
  stockStatuses: ['Todos', 'Em estoque', 'Estoque baixo', 'Sem estoque'],
};

export const statusTone: Record<ProductStatus, string> = {
  'Em estoque': 'text-[#3d8140]',
  'Estoque baixo': 'text-[#af7f1d]',
  'Sem estoque': 'text-[#b53a64]',
};

export const LoadingSpinner = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <span
    className={`inline-block animate-spin rounded-full border-2 border-[#dbcfc1] border-t-[#7B5CE6] ${className}`}
  />
);

export const createEmptyProductForm = (metadata: ProductCatalogMetadata): ProductFormState => ({
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

export const mapProductToForm = (product: Product): ProductFormState => ({
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

export const buildProductPayload = (form: ProductFormState): ProductUpsertPayload => ({
  name: form.name,
  sku: form.sku,
  description: form.description,
  categorySlug: form.categorySlug,
  price: Number(form.price),
  stockQuantity: Number(form.stockQuantity),
  minimumStock: Number(form.minimumStock),
  trackStock: form.trackStock,
  isActive: form.isActive,
  tagIds: form.tagIds,
});

export const SearchableFilter = ({
  label,
  value,
  options,
  searchPlaceholder,
  onSelect,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  searchPlaceholder: string;
  onSelect: (value: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedOption = options.find((option) => option.value === value) || options[0];
  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return options;
    }

    return options.filter((option) =>
      `${option.label} ${option.keywords || ''}`.toLowerCase().includes(normalized),
    );
  }, [options, query]);

  return (
    <div className="relative px-1">
      <p className="mb-2 pl-1 text-sm font-medium text-brand-bark">{label}</p>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-12 w-full items-center justify-between rounded-[18px] border border-[#ddd6cb] bg-white px-4 text-left text-sm text-brand-bark shadow-[0_10px_24px_rgba(55,43,46,0.06)]"
      >
        <span className="truncate">{selectedOption?.label || 'Selecione'}</span>
        <svg
          viewBox="0 0 20 20"
          className={`h-4 w-4 text-[#9d978e] transition ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="m5 8 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 rounded-[22px] border border-[#e4ddd2] bg-white p-3 shadow-[0_20px_40px_rgba(55,43,46,0.14)]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-[16px] border border-[#e8e1d6] bg-[#f8f5ef] px-4 text-sm text-brand-bark outline-none transition focus:border-[#7B5CE6] focus:bg-white"
          />
          <div className="mt-3 max-h-56 space-y-1 overflow-y-auto">
            {filteredOptions.length ? (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onSelect(option.value);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className={`flex w-full items-center justify-between rounded-[16px] px-3 py-3 text-left text-sm transition ${
                      isSelected
                        ? 'bg-[#f3efff] font-semibold text-[#5f3bc4]'
                        : 'text-brand-bark hover:bg-[#f8f5ef]'
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected ? <span className="text-xs font-semibold uppercase tracking-[0.2em]">Ativo</span> : null}
                  </button>
                );
              })
            ) : (
              <div className="rounded-[16px] bg-[#faf7f2] px-3 py-4 text-sm text-[#8d8a84]">
                Nenhuma opção encontrada.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const ProductFormModal = ({
  isOpen,
  metadata,
  form,
  editingProduct,
  isSubmitting,
  onClose,
  onChange,
  onToggleTag,
  onSubmit,
}: {
  isOpen: boolean;
  metadata: ProductCatalogMetadata;
  form: ProductFormState;
  editingProduct: Product | null;
  isSubmitting: boolean;
  onClose: () => void;
  onChange: (field: keyof ProductFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onToggleTag: (tagId: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={editingProduct ? 'Editar produto' : 'Novo produto'}
    description="Cadastre um item do catálogo com categoria, tags e regras de estoque."
    size="xl"
  >
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Nome do produto" value={form.name} onChange={onChange('name')} required />
        <Input label="SKU" value={form.sku} onChange={onChange('sku')} required />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex w-full flex-col gap-2 text-sm font-medium text-brand-bark">
          <span>Categoria</span>
          <select
            value={form.categorySlug}
            onChange={onChange('categorySlug')}
            className="h-12 rounded-[18px] border border-[#d7d7d1] bg-[#f4f4f1] px-4 text-sm text-brand-bark outline-none transition focus:border-brand-sage focus:bg-white"
          >
            {metadata.categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <Input label="Preço" type="number" min="0" step="0.01" value={form.price} onChange={onChange('price')} required />
      </div>

      <label className="flex w-full flex-col gap-2 text-sm font-medium text-brand-bark">
        <span>Descrição</span>
        <textarea
          value={form.description}
          onChange={onChange('description')}
          rows={4}
          className="w-full rounded-[20px] border border-[#d7d7d1] bg-[#f4f4f1] px-4 py-3 text-sm text-brand-bark outline-none transition placeholder:text-[#9b9a94] focus:border-brand-sage focus:bg-white"
          placeholder="Descreva composição, ocasião, flores e observações internas."
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <Input label="Estoque atual" type="number" min="0" value={form.stockQuantity} onChange={onChange('stockQuantity')} required />
        <Input label="Estoque mínimo" type="number" min="0" value={form.minimumStock} onChange={onChange('minimumStock')} required />
        <div className="grid gap-3">
          <label className="flex items-center gap-3 rounded-[20px] border border-[#e8e1d6] bg-[#faf8f3] px-4 py-3 text-sm text-brand-bark">
            <input type="checkbox" checked={form.trackStock} onChange={onChange('trackStock')} className="h-4 w-4 rounded border-[#cfc8be] text-[#6f3fe4] focus:ring-[#b89cff]" />
            Controlar estoque
          </label>
          <label className="flex items-center gap-3 rounded-[20px] border border-[#e8e1d6] bg-[#faf8f3] px-4 py-3 text-sm text-brand-bark">
            <input type="checkbox" checked={form.isActive} onChange={onChange('isActive')} className="h-4 w-4 rounded border-[#cfc8be] text-[#6f3fe4] focus:ring-[#b89cff]" />
            Produto ativo
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-brand-bark">Tags do produto</p>
        <div className="flex flex-wrap gap-2">
          {metadata.tags.map((tag) => {
            const isSelected = form.tagIds.includes(tag.id);

            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onToggleTag(tag.id)}
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

      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : editingProduct ? 'Salvar alterações' : 'Cadastrar produto'}
        </Button>
      </div>
    </form>
  </Modal>
);

export const EntityProductsModal = ({
  isOpen,
  title,
  description,
  products,
  onClose,
}: {
  isOpen: boolean;
  title: string;
  description: string;
  products: Product[];
  onClose: () => void;
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} size="xl">
    <div className="grid gap-4 md:grid-cols-2">
      {products.length ? (
        products.map((product) => (
          <div key={product.id} className="rounded-[22px] border border-[#e8e1d6] bg-[#fffdf9] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ad8c58]">{product.category.name}</p>
                <h3 className="mt-2 text-lg font-bold text-brand-bark">{product.name}</h3>
                <p className="mt-1 text-sm text-[#8d8a84]">SKU {product.sku}</p>
              </div>
              <p className="text-base font-bold text-[#8e4d8c]">{formatCurrency(product.price)}</p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={product.status} />
              <span className="text-sm text-[#6f6a63]">Estoque {product.stockQuantity}</span>
            </div>
          </div>
        ))
      ) : (
        <Panel title="Nenhum produto vinculado" description="Ainda não há produtos relacionados a este item." />
      )}
    </div>
  </Modal>
);

export const InventoryAdjustmentModal = ({
  isOpen,
  product,
  direction,
  quantityMoved,
  newStockQuantity,
  note,
  isSubmitting,
  onClose,
  onIncrease,
  onDecrease,
  onQuantityMovedChange,
  onNewStockChange,
  onNoteChange,
  onSubmit,
}: {
  isOpen: boolean;
  product: Product | null;
  direction: 'increase' | 'decrease';
  quantityMoved: string;
  newStockQuantity: string;
  note: string;
  isSubmitting: boolean;
  onClose: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  onQuantityMovedChange: (value: string) => void;
  onNewStockChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={product ? `Ajustar estoque: ${product.name}` : 'Ajustar estoque'}
    description="Registre entradas, perdas e correções manuais."
    size="md"
  >
    {product ? (
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="rounded-[20px] border border-[#eee5d9] bg-[#fcfaf6] px-4 py-3">
          <p className="text-sm text-[#8d8a84]">Estoque atual</p>
          <p className={`mt-2 text-2xl font-bold ${statusTone[product.status]}`}>{product.stockQuantity} unidades</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onDecrease}
            className={`flex h-12 w-12 items-center justify-center rounded-full border text-2xl font-semibold transition ${
              direction === 'decrease'
                ? 'border-[#c94f7a] bg-[#fff1f6] text-[#c94f7a]'
                : 'border-[#ddd6cb] bg-white text-brand-bark hover:bg-[#faf7f2]'
            }`}
          >
            -
          </button>
          <button
            type="button"
            onClick={onIncrease}
            className={`flex h-12 w-12 items-center justify-center rounded-full border text-2xl font-semibold transition ${
              direction === 'increase'
                ? 'border-[#4a9a4c] bg-[#f1fbf1] text-[#4a9a4c]'
                : 'border-[#ddd6cb] bg-white text-brand-bark hover:bg-[#faf7f2]'
            }`}
          >
            +
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Quantidade movimentada"
            type="number"
            min="0"
            value={quantityMoved}
            onChange={(event) => onQuantityMovedChange(event.target.value)}
            required
          />
          <Input
            label="Nova quantidade em estoque"
            type="number"
            min="0"
            value={newStockQuantity}
            onChange={(event) => onNewStockChange(event.target.value)}
            required
          />
        </div>
        <label className="flex w-full flex-col gap-2 text-sm font-medium text-brand-bark">
          <span>Motivo</span>
          <textarea
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            rows={3}
            className="w-full rounded-[20px] border border-[#d7d7d1] bg-[#f4f4f1] px-4 py-3 text-sm text-brand-bark outline-none transition placeholder:text-[#9b9a94] focus:border-brand-sage focus:bg-white"
            placeholder="Ex.: compra no fornecedor, quebra de vaso, correção de inventário."
          />
        </label>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Aplicando...' : 'Aplicar ajuste'}</Button>
        </div>
      </form>
    ) : null}
  </Modal>
);

export const CatalogProductGrid = ({
  isLoading,
  products,
  onEdit,
  onAdjustStock,
}: {
  isLoading: boolean;
  products: Product[];
  onEdit: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
}) => (
  <div className="grid gap-4 md:grid-cols-2">
    {isLoading ? (
      Array.from({ length: 4 }).map((_, index) => (
        <Panel key={index} className="flex min-h-[278px] items-center justify-center rounded-[24px] border border-[#e7e0d5] bg-white shadow-[0_18px_38px_rgba(55,43,46,0.08)]">
          <div className="flex flex-col items-center gap-3 text-[#8d8a84]">
            <LoadingSpinner className="h-9 w-9" />
            <p className="text-sm">Buscando produtos...</p>
          </div>
        </Panel>
      ))
    ) : (
      products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onAdjustStock={onAdjustStock}
        />
      ))
    )}
  </div>
);

export const getCategoryProductCount = (products: Product[], category: ProductCategory) =>
  products.filter((product) => product.category.id === category.id).length;

export const getTagProductCount = (products: Product[], tag: ProductTag) =>
  products.filter((product) => product.tags.some((productTag) => productTag.id === tag.id)).length;
