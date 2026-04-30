import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import type { Product } from '@/models/types';
import { formatCurrency } from '@/utils/formatters';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
}

export const ProductCard = ({ product, onEdit, onAdjustStock }: ProductCardProps) => {
  const hasStock = product.stockQuantity > 0;

  return (
    <article className="rounded-[24px] border border-[#ebe6de] bg-white p-5 shadow-[0_16px_34px_rgba(55,43,46,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#ad8c58]">
              {product.category.name}
            </p>
            <h2 className="mt-2 text-[22px] font-bold text-brand-bark">{product.name}</h2>
            <p className="mt-2 text-[15px] text-[#8d8a84]">
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

        <div className="text-right">
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
        <Button variant="secondary" className="min-w-[184px]" onClick={() => onAdjustStock(product)}>
          Ajustar estoque
        </Button>
        <Button variant="outline" className="min-w-[184px]" onClick={() => onEdit(product)}>
          Editar produto
        </Button>
      </div>
    </article>
  );
};
