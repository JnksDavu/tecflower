import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import type { Product } from '@/models/types';
import { formatCurrency } from '@/utils/formatters';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const hasStock = product.stock > 0;

  return (
    <article className="rounded-[18px] border border-[#ebe6de] bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-brand-bark">{product.name}</h2>
          <p className="mt-2 text-[15px] text-[#8d8a84]">SKU {product.sku} - {product.description}</p>
          <div className="mt-4">
            <StatusBadge status={product.status} />
          </div>
          <p className={`mt-4 text-[15px] ${hasStock ? 'text-[#69a56e]' : 'text-[#cf6885]'}`}>
            Disponivel: {product.stock} unidades
          </p>
        </div>
        <p className={`text-[22px] font-bold ${hasStock ? 'text-[#8e4d8c]' : 'text-[#c94f7a]'}`}>{formatCurrency(product.price)}</p>
      </div>

      <div className="mt-4 flex gap-3">
        {!hasStock ? <Button variant="secondary" className="min-w-[184px]">Notificar</Button> : <div className="min-w-[184px] text-center text-[15px] font-semibold text-brand-bark">Ver</div>}
        <Button variant="outline" className="min-w-[184px]">Editar</Button>
      </div>
    </article>
  );
};
