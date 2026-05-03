import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
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
  const [newTagName, setNewTagName] = useState('');
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      await productController.createTag(newTagName);
      setNewTagName('');
      setSuccessMessage('Tag criada com sucesso.');
      await loadPage();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível criar a tag.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Tags"
        description="Crie tags de ocasião e descubra quais organizam melhor o catálogo."
        titleColor="text-[#7B5CE6]"
      />

      {errorMessage ? <div className="mt-4 rounded-2xl border border-[#f3d5df] bg-[#fff7f9] px-4 py-3 text-sm text-[#9a3253]">{errorMessage}</div> : null}
      {successMessage ? <div className="mt-4 rounded-2xl border border-[#d9f0df] bg-[#f4fbf6] px-4 py-3 text-sm text-[#27633a]">{successMessage}</div> : null}

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_360px]">
        <Panel title="Tags do catálogo" description="Clique em uma tag para ver todos os produtos relacionados.">
          {isLoading ? (
            <div className="flex min-h-[260px] items-center justify-center"><LoadingSpinner className="h-9 w-9" /></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {rankedTags.map(({ tag, productCount }) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className="rounded-[24px] border border-[#e6ded2] bg-white p-5 text-left shadow-[0_16px_34px_rgba(55,43,46,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_44px_rgba(55,43,46,0.09)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[20px] font-bold text-brand-bark">{tag.name}</p>
                      <p className="mt-2 text-sm text-[#8d8a84]">
                        {tag.isDefault ? 'Tag padrão do sistema' : 'Tag criada pela conta'}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#faf7ff] px-3 py-1 text-xs font-semibold text-[#6b4acb]">
                      {productCount} produtos
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Nova tag" description="Crie tags livres para datas, perfis e contextos de venda.">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Nome da tag"
              value={newTagName}
              onChange={(event) => setNewTagName(event.target.value)}
              placeholder="Ex.: Maternidade, Premium, Dia das Mães"
              required
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar tag'}
            </Button>
          </form>
        </Panel>
      </section>

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
