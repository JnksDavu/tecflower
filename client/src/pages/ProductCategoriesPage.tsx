import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { PageHeader } from '@/components/PageHeader';
import { productController } from '@/controllers/productController';
import type { Product, ProductCategory } from '@/models/types';
import {
  emptyMetadata,
  EntityProductsModal,
  getCategoryProductCount,
  LoadingSpinner,
} from '@/features/products/productUi';
import { Modal } from '@/components/Modal';
import { Panel } from '@/components/Panel';

export const ProductCategoriesPage = () => {
  const [metadata, setMetadata] = useState(emptyMetadata);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
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

  const openCreateModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setIsCategoryModalOpen(true);
  };

  const openEditModal = (category: ProductCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setIsCategoryModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (editingCategory) {
        await productController.updateCategory(editingCategory.id, { name: categoryName });
        setSuccessMessage('Categoria atualizada com sucesso.');
      } else {
        await productController.createCategory({ name: categoryName });
        setSuccessMessage('Categoria criada com sucesso.');
      }

      setIsCategoryModalOpen(false);
      await loadPage();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar a categoria.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category: ProductCategory) => {
    if (!window.confirm(`Excluir a categoria "${category.name}"?`)) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    try {
      await productController.removeCategory(category.id);
      setSuccessMessage('Categoria excluída com sucesso.');
      await loadPage();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível excluir a categoria.');
    }
  };

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Categorias"
        description="Gerencie as categorias do catálogo e veja quais concentram mais produtos."
        titleColor="text-[#7B5CE6]"
        action={<Button className="min-w-[168px]" onClick={openCreateModal}>Nova categoria</Button>}
      />

      {errorMessage ? <div className="mt-4 rounded-2xl border border-[#f3d5df] bg-[#fff7f9] px-4 py-3 text-sm text-[#9a3253]">{errorMessage}</div> : null}
      {successMessage ? <div className="mt-4 rounded-2xl border border-[#d9f0df] bg-[#f4fbf6] px-4 py-3 text-sm text-[#27633a]">{successMessage}</div> : null}

      <section className="mt-6">
        <Panel title="Categorias do catálogo" description="Clique no card para ver produtos vinculados. Use os ícones para editar ou excluir.">
          {isLoading ? (
            <div className="flex min-h-[260px] items-center justify-center"><LoadingSpinner className="h-9 w-9" /></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {rankedCategories.map(({ category, productCount }) => (
                <div
                  key={category.id}
                  className="rounded-[24px] border border-[#e6ded2] bg-white p-5 shadow-[0_16px_34px_rgba(55,43,46,0.05)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <button type="button" onClick={() => setSelectedCategory(category)} className="flex-1 text-left">
                      <p className="text-[20px] font-bold text-brand-bark">{category.name}</p>
                      <p className="mt-2 text-sm text-[#8d8a84]">
                        {category.isFixed ? 'Categoria base do sistema' : 'Categoria criada pela conta'}
                      </p>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(category)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ded8cf] text-[#7e756c] transition hover:bg-[#faf7f2]"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
                          <path d="m4 20 4.2-1 9.1-9.1a2.2 2.2 0 0 0-3.1-3.1L5.1 15.9 4 20Z" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="m13 6 5 5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#f0d7df] text-[#b45072] transition hover:bg-[#fff5f8]"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
                          <path d="M5 7h14M9 7V5.8c0-.44.36-.8.8-.8h4.4c.44 0 .8.36.8.8V7m-8 0 1 11c.04.55.5 1 1.06 1h5.88c.56 0 1.02-.45 1.06-1l1-11M10 11v5M14 11v5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="rounded-full bg-[#f7f3eb] px-3 py-1 text-xs font-semibold text-[#8e7347]">
                      {productCount} produtos
                    </span>
                    {category.isFixed ? <span className="text-xs font-medium text-[#8d8a84]">Base</span> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </section>

      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? 'Editar categoria' : 'Nova categoria'}
        description="Crie ou ajuste categorias do catálogo."
        size="md"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Nome da categoria"
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="Ex.: Flores secas, Eventos, Assinaturas"
            required
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsCategoryModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : editingCategory ? 'Salvar categoria' : 'Criar categoria'}
            </Button>
          </div>
        </form>
      </Modal>

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
