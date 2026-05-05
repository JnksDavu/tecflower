import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';
import { Panel } from '@/components/Panel';
import { productController } from '@/controllers/productController';
import type { Product, ProductTag } from '@/models/types';
import {
  emptyMetadata,
  EntityProductsModal,
  getTagProductCount,
  LoadingSpinner,
} from '@/features/products/productUi';

export const ProductTagsPage = () => {
  const [metadata, setMetadata] = useState(emptyMetadata);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [tagName, setTagName] = useState('');
  const [editingTag, setEditingTag] = useState<ProductTag | null>(null);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<ProductTag | null>(null);

  const rankedTags = useMemo(
    () =>
      metadata.tags
        .map((tag) => ({
          tag,
          productCount: getTagProductCount(products, tag),
        }))
        .sort((a, b) => b.productCount - a.productCount || a.tag.name.localeCompare(b.tag.name)),
    [metadata.tags, products],
  );

  const selectedProducts = useMemo(
    () => products.filter((product) => product.tags.some((tag) => tag.id === selectedTag?.id)),
    [products, selectedTag],
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
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar as tags.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const openCreateModal = () => {
    setEditingTag(null);
    setTagName('');
    setIsTagModalOpen(true);
  };

  const openEditModal = (tag: ProductTag) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setIsTagModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (editingTag) {
        await productController.updateTag(editingTag.id, { name: tagName });
        setSuccessMessage('Tag atualizada com sucesso.');
      } else {
        await productController.createTag(tagName);
        setSuccessMessage('Tag criada com sucesso.');
      }

      setIsTagModalOpen(false);
      await loadPage();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar a tag.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (tag: ProductTag) => {
    if (!window.confirm(`Excluir a tag "${tag.name}"?`)) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    try {
      await productController.removeTag(tag.id);
      setSuccessMessage('Tag excluída com sucesso.');
      await loadPage();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível excluir a tag.');
    }
  };

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Tags"
        description="Crie tags de ocasião e descubra quais organizam melhor o catálogo."
        titleColor="text-[#7B5CE6]"
        action={<Button className="min-w-[148px]" onClick={openCreateModal}>Nova tag</Button>}
      />

      {errorMessage ? <div className="mt-4 rounded-2xl border border-[#f3d5df] bg-[#fff7f9] px-4 py-3 text-sm text-[#9a3253]">{errorMessage}</div> : null}
      {successMessage ? <div className="mt-4 rounded-2xl border border-[#d9f0df] bg-[#f4fbf6] px-4 py-3 text-sm text-[#27633a]">{successMessage}</div> : null}

      <section className="mt-6">
        <Panel title="Tags do catálogo" description="Clique no card para ver produtos relacionados. Use os ícones para editar ou excluir.">
          {isLoading ? (
            <div className="flex min-h-[260px] items-center justify-center"><LoadingSpinner className="h-9 w-9" /></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {rankedTags.map(({ tag, productCount }) => (
                <div
                  key={tag.id}
                  className="rounded-[24px] border border-[#e6ded2] bg-white p-5 shadow-[0_16px_34px_rgba(55,43,46,0.05)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <button type="button" onClick={() => setSelectedTag(tag)} className="flex-1 text-left">
                      <p className="text-[20px] font-bold text-brand-bark">{tag.name}</p>
                      <p className="mt-2 text-sm text-[#8d8a84]">
                        {tag.isDefault ? 'Tag padrão do sistema' : 'Tag criada pela conta'}
                      </p>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(tag)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ded8cf] text-[#7e756c] transition hover:bg-[#faf7f2]"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
                          <path d="m4 20 4.2-1 9.1-9.1a2.2 2.2 0 0 0-3.1-3.1L5.1 15.9 4 20Z" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="m13 6 5 5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(tag)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#f0d7df] text-[#b45072] transition hover:bg-[#fff5f8]"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
                          <path d="M5 7h14M9 7V5.8c0-.44.36-.8.8-.8h4.4c.44 0 .8.36.8.8V7m-8 0 1 11c.04.55.5 1 1.06 1h5.88c.56 0 1.02-.45 1.06-1l1-11M10 11v5M14 11v5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="rounded-full bg-[#faf7ff] px-3 py-1 text-xs font-semibold text-[#6b4acb]">
                      {productCount} produtos
                    </span>
                    {tag.isDefault ? <span className="text-xs font-medium text-[#8d8a84]">Padrão</span> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </section>

      <Modal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        title={editingTag ? 'Editar tag' : 'Nova tag'}
        description="Crie ou ajuste tags de organização do catálogo."
        size="md"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Nome da tag"
            value={tagName}
            onChange={(event) => setTagName(event.target.value)}
            placeholder="Ex.: Maternidade, Premium, Dia das Mães"
            required
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsTagModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : editingTag ? 'Salvar tag' : 'Criar tag'}
            </Button>
          </div>
        </form>
      </Modal>

      <EntityProductsModal
        isOpen={Boolean(selectedTag)}
        title={selectedTag?.name || 'Tag'}
        description="Produtos relacionados a esta tag."
        products={selectedProducts}
        onClose={() => setSelectedTag(null)}
      />
    </div>
  );
};
