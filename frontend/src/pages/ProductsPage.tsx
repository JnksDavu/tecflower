import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { ProductCard } from '@/components/ProductCard';
import { SelectField } from '@/components/SelectField';
import { productController } from '@/controllers/productController';
import type { Product } from '@/models/types';

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['Todas']);

  useEffect(() => {
    productController.list().then(setProducts);
    productController.listCategories().then(setCategories);
  }, []);

  const featuredProducts = useMemo(() => products.slice(0, 4), [products]);

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Produtos"
        titleColor="text-[#7B5CE6]"
        action={<Button className="min-w-[154px]">Novo Produto</Button>}
      />

      <section className="mt-6 flex items-end justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 rounded-full border border-transparent px-2">
            <svg viewBox="0 0 20 20" className="h-4 w-4 text-[#8f8d87]" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m14 14 4 4M8.5 15A6.5 6.5 0 1 1 15 8.5 6.5 6.5 0 0 1 8.5 15Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              className="h-12 w-full border-none bg-transparent text-[15px] text-brand-bark outline-none placeholder:text-[#8f8d87]"
              placeholder="Buscar por nome, categoria ou SKU"
            />
          </div>
        </div>

        <div className="flex items-end gap-3">
          <SelectField label="Categoria" value={categories[0] || 'Todas'} />
          <SelectField label="Status de estoque" value="Todos" />
          <Button variant="outline" className="min-w-[110px]">Exportar</Button>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </div>
  );
};
