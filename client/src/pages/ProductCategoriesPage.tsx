import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';
import { Panel } from '@/components/Panel';
import { productController } from '@/controllers/productController';
import type { Product, ProductCategory } from '@/models/types';
import {
  emptyMetadata,
  EntityProductsModal,
  getCategoryProductCount,
  LoadingSpinner,
} from '@/features/products/productUi';

export const ProductCategoriesPage = () => {
  const [metadata, setMetadata] = useState(emptyMetadata);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);

  const rankedCategories = useMemo(
    () =>
      metadata.categories
        .map((category) => ({
          category,
          productCount: getCategoryProductCount(products, category),
        }))
        .sort((a, b) => b.productCount - a.productCount || a.category.sortOrder - b.category.sortOrder),
    [metadata.categories, products],
  );

  const selectedProducts = useMemo(
    () => products.filter((product) => product.category.id === selectedCategory?.id),
    [products, selectedCategory],
  );

  const loadPage = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const [nextMetadata, nextProducts] = await Promise.all([
        productController.getMetadata(),
        productController.list(),
      ]);

      setMetadata(nextMetadata);
      setProducts(nextProducts);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar as categorias.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      await productController.createCategory({ name: newCategoryName });
      setNewCategoryName('');
      setSuccessMessage('Categoria criada com sucesso.');
      await loadPage();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível criar a categoria.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Categorias"
        description="Gerencie as categorias do catálogo e veja quais concentram mais produtos."
        titleColor="text-[#7B5CE6]"
      />

      {errorMessage ? <div className="mt-4 rounded-2xl border border-[#f3d5df] bg-[#fff7f9] px-4 py-3 text-sm text-[#9a3253]">{errorMessage}</div> : null}
      {successMessage ? <div className="mt-4 rounded-2xl border border-[#d9f0df] bg-[#f4fbf6] px-4 py-3 text-sm text-[#27633a]">{successMessage}</div> : null}

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_360px]">
        <Panel title="Categorias do catálogo" description="Clique em uma categoria para ver os produtos vinculados.">
          {isLoading ? (
            <div className="flex min-h-[260px] items-center justify-center"><LoadingSpinner className="h-9 w-9" /></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {rankedCategories.map(({ category, productCount }) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-[24px] border border-[#e6ded2] bg-white p-5 text-left shadow-[0_16px_34px_rgba(55,43,46,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_44px_rgba(55,43,46,0.09)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[20px] font-bold text-brand-bark">{category.name}</p>
                      <p className="mt-2 text-sm text-[#8d8a84]">
                        {category.isFixed ? 'Categoria base do sistema' : 'Categoria criada pela conta'}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#f7f3eb] px-3 py-1 text-xs font-semibold text-[#8e7347]">
                      {productCount} produtos
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Nova categoria" description="Crie categorias adicionais para o catálogo.">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Nome da categoria"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="Ex.: Flores secas, Eventos, Assinaturas"
              required
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar categoria'}
            </Button>
          </form>
        </Panel>
      </section>

      <EntityProductsModal
        isOpen={Boolean(selectedCategory)}
        title={selectedCategory?.name || 'Categoria'}
        description="Produtos relacionados a esta categoria."
        products={selectedProducts}
        onClose={() => setSelectedCategory(null)}
      />
    </div>
  );
};
