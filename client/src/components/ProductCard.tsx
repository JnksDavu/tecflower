import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import type { Product } from '@/models/types';
import { formatCurrency } from '@/utils/formatters';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductCard = ({ product, onEdit, onAdjustStock, onDelete }: ProductCardProps) => {
  const hasStock = product.stockQuantity > 0;

  return (
    <article className="flex h-full flex-col rounded-[24px] border border-[#e7e0d5] bg-white p-5 shadow-[0_18px_38px_rgba(55,43,46,0.08)]">
      <div className="flex flex-1 flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#ad8c58]">
              {product.category.name}
            </p>
            <h2 className="mt-2 text-[22px] font-bold text-brand-bark">{product.name}</h2>
            <p className="mt-2 min-h-[44px] text-[15px] text-[#8d8a84]">
              SKU {product.sku} · {product.description || 'Sem descrição cadastrada'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={product.status} />
            {!product.isActive ? (
              <span className="rounded-full bg-[#f4eee3] px-3 py-1 text-xs font-semibold text-[#866f44]">
                Inativo
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {product.tags.length ? (
              product.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full border border-[#e6ddf2] bg-[#faf7ff] px-3 py-1 text-xs font-medium text-[#6b4acb]"
                >
                  {tag.name}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-dashed border-[#ddd5ca] px-3 py-1 text-xs text-[#8d8a84]">
                Sem tags
              </span>
            )}
          </div>
        </div>

        <div className="min-w-[112px] text-right">
          <div className="mb-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ded8cf] text-[#7e756c] transition hover:bg-[#faf7f2]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
                <path d="m4 20 4.2-1 9.1-9.1a2.2 2.2 0 0 0-3.1-3.1L5.1 15.9 4 20Z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="m13 6 5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onDelete(product)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#f0d7df] text-[#b45072] transition hover:bg-[#fff5f8]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
                <path d="M5 7h14M9 7V5.8c0-.44.36-.8.8-.8h4.4c.44 0 .8.36.8.8V7m-8 0 1 11c.04.55.5 1 1.06 1h5.88c.56 0 1.02-.45 1.06-1l1-11M10 11v5M14 11v5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <p className={`text-[24px] font-bold ${hasStock ? 'text-[#8e4d8c]' : 'text-[#c94f7a]'}`}>
            {formatCurrency(product.price)}
          </p>
          <p className={`mt-4 text-[15px] ${hasStock ? 'text-[#4a9a4c]' : 'text-[#cf6885]'}`}>
            Estoque: {product.stockQuantity} un.
          </p>
          <p className="mt-1 text-sm text-[#8d8a84]">Mínimo: {product.minimumStock} un.</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button variant="secondary" className="min-w-[184px] flex-1" onClick={() => onAdjustStock(product)}>
          Ajustar estoque
        </Button>
        
      </div>
    </article>
  );
};
