import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Panel } from '@/components/Panel';
import { productController } from '@/controllers/productController';
import type { Product, ProductStockMovement } from '@/models/types';
import { FilterOption, InventoryAdjustmentModal, LoadingSpinner, SearchableFilter, statusTone } from '@/features/products/productUi';
import { formatCurrency } from '@/utils/formatters';

const movementLabels: Record<ProductStockMovement['movementType'], string> = {
  manual_adjustment: 'Ajuste manual',
  restock: 'Reposição',
  sale: 'Venda',
  loss: 'Perda',
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));

const parseNonNegativeInteger = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
};

export const InventoryPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<ProductStockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockForm, setStockForm] = useState({
    direction: 'increase' as 'increase' | 'decrease',
    quantityMoved: '0',
    newStockQuantity: '0',
    note: '',
  });
  const [movementFilters, setMovementFilters] = useState({
    productId: 'all',
    dateFrom: '',
    dateTo: '',
  });

  const productOptions = useMemo<FilterOption[]>(
    () => [
      { label: 'Todos os produtos', value: 'all' },
      ...products.map((product) => ({
        label: product.name,
        value: product.id,
        keywords: `${product.sku} ${product.category.name}`,
      })),
    ],
    [products],
  );

  const lowStockProducts = useMemo(
    () => products.filter((product) => product.status === 'Estoque baixo'),
    [products],
  );

  const noStockProducts = useMemo(
    () => products.filter((product) => product.status === 'Sem estoque'),
    [products],
  );

  const filteredMovements = useMemo(
    () =>
      movements.filter((movement) => {
        if (movementFilters.productId !== 'all' && movement.product.id !== movementFilters.productId) {
          return false;
        }

        const movementDate = new Date(movement.createdAt);
        if (movementFilters.dateFrom) {
          const fromDate = new Date(`${movementFilters.dateFrom}T00:00:00`);
          if (movementDate < fromDate) {
            return false;
          }
        }

        if (movementFilters.dateTo) {
          const toDate = new Date(`${movementFilters.dateTo}T23:59:59`);
          if (movementDate > toDate) {
            return false;
          }
        }

        return true;
      }),
    [movementFilters.dateFrom, movementFilters.dateTo, movementFilters.productId, movements],
  );

  const loadPage = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const [nextProducts, nextMovements] = await Promise.all([
        productController.list(),
        productController.listStockMovements(),
      ]);

      setProducts(nextProducts);
      setMovements(nextMovements);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar o estoque.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const handleAdjustStock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stockProduct) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const quantityMoved = parseNonNegativeInteger(stockForm.quantityMoved);
      const quantityDelta = stockForm.direction === 'increase' ? quantityMoved : -quantityMoved;

      await productController.adjustStock(stockProduct.id, {
        quantityDelta,
        note: stockForm.note,
      });
      setSuccessMessage('Movimentação registrada com sucesso.');
      setStockProduct(null);
      await loadPage();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível registrar a movimentação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openStockModal = (product: Product) => {
    setStockProduct(product);
    setStockForm({
      direction: 'increase',
      quantityMoved: '0',
      newStockQuantity: String(product.stockQuantity),
      note: '',
    });
  };

  const handleStockStep = (step: 1 | -1) => {
    setStockForm((current) => {
      const currentStock = stockProduct?.stockQuantity ?? 0;
      const currentProjectedStock = parseNonNegativeInteger(current.newStockQuantity);
      const nextStockQuantity = Math.max(0, currentProjectedStock + step);
      const direction = nextStockQuantity >= currentStock ? 'increase' : 'decrease';
      const quantityMoved = Math.abs(nextStockQuantity - currentStock);

      return {
        ...current,
        direction,
        quantityMoved: String(quantityMoved),
        newStockQuantity: String(nextStockQuantity),
      };
    });
  };

  const handleStockQuantityMovedChange = (value: string) => {
    setStockForm((current) => {
      const currentStock = stockProduct?.stockQuantity ?? 0;
      const rawQuantity = parseNonNegativeInteger(value);
      const quantityMoved =
        current.direction === 'decrease'
          ? Math.min(rawQuantity, currentStock)
          : rawQuantity;
      const newStockQuantity =
        current.direction === 'increase'
          ? currentStock + quantityMoved
          : Math.max(0, currentStock - quantityMoved);

      return {
        ...current,
        quantityMoved: String(quantityMoved),
        newStockQuantity: String(newStockQuantity),
      };
    });
  };

  const handleStockNewQuantityChange = (value: string) => {
    setStockForm((current) => {
      const currentStock = stockProduct?.stockQuantity ?? 0;
      const nextStock = parseNonNegativeInteger(value);
      const direction = nextStock >= currentStock ? 'increase' : 'decrease';
      const quantityMoved = Math.abs(nextStock - currentStock);

      return {
        ...current,
        direction,
        quantityMoved: String(quantityMoved),
        newStockQuantity: String(nextStock),
      };
    });
  };

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Estoque"
        description="Controle operacional do estoque com movimentações, níveis atuais e alertas."
        titleColor="text-[#7B5CE6]"
      />

      {errorMessage ? <div className="mt-4 rounded-2xl border border-[#f3d5df] bg-[#fff7f9] px-4 py-3 text-sm text-[#9a3253]">{errorMessage}</div> : null}
      {successMessage ? <div className="mt-4 rounded-2xl border border-[#d9f0df] bg-[#f4fbf6] px-4 py-3 text-sm text-[#27633a]">{successMessage}</div> : null}

      <section className="mt-6 grid gap-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Panel title="Níveis de estoque" description="Todos os produtos com seus níveis atuais e gatilho de reposição.">
            {isLoading ? (
              <div className="flex min-h-[180px] items-center justify-center"><LoadingSpinner className="h-9 w-9" /></div>
            ) : (
              <div className="grid gap-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between gap-4 rounded-[20px] border border-[#e8e1d6] bg-white p-4">
                    <div>
                      <p className="font-semibold text-brand-bark">{product.name}</p>
                      <p className="mt-1 text-sm text-[#8d8a84]">{product.category.name} · {formatCurrency(product.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${statusTone[product.status]}`}>{product.stockQuantity} un.</p>
                      <p className="text-sm text-[#8d8a84]">Mínimo {product.minimumStock}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openStockModal(product)}
                      className="rounded-full border border-[#ddd5c9] px-4 py-2 text-sm font-semibold text-brand-bark transition hover:bg-[#f8f5ef]"
                    >
                      Ajustar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Alertas" description="Produtos com estoque baixo ou zerado.">
            {isLoading ? (
              <div className="flex min-h-[180px] items-center justify-center"><LoadingSpinner className="h-9 w-9" /></div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-[22px] border border-[#efe1ac] bg-[#fff9e8] p-4">
                  <p className="text-sm font-medium text-[#946d14]">Baixo estoque</p>
                  <p className="mt-2 text-3xl font-bold text-[#af7f1d]">{lowStockProducts.length}</p>
                </div>
                <div className="rounded-[22px] border border-[#f1d7e0] bg-[#fff6f9] p-4">
                  <p className="text-sm font-medium text-[#a33c62]">Sem estoque</p>
                  <p className="mt-2 text-3xl font-bold text-[#b53a64]">{noStockProducts.length}</p>
                </div>
                
              </div>
            )}
          </Panel>
        </div>

        <Panel title="Movimentações" description="Histórico recente das entradas, ajustes e saídas de estoque.">
          <div className="mb-5 grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(180px,0.7fr)_minmax(180px,0.7fr)]">
            <SearchableFilter
              label="Produto"
              value={movementFilters.productId}
              options={productOptions}
              searchPlaceholder="Pesquisar produto"
              onSelect={(value) => setMovementFilters((current) => ({ ...current, productId: value }))}
            />
            <label className="flex flex-col gap-2 px-1 text-sm font-medium text-brand-bark">
              <span className="pl-1">De</span>
              <input
                type="date"
                value={movementFilters.dateFrom}
                onChange={(event) => setMovementFilters((current) => ({ ...current, dateFrom: event.target.value }))}
                className="h-12 rounded-[18px] border border-[#ddd6cb] bg-white px-4 text-sm text-brand-bark outline-none shadow-[0_10px_24px_rgba(55,43,46,0.06)]"
              />
            </label>
            <label className="flex flex-col gap-2 px-1 text-sm font-medium text-brand-bark">
              <span className="pl-1">Até</span>
              <input
                type="date"
                value={movementFilters.dateTo}
                onChange={(event) => setMovementFilters((current) => ({ ...current, dateTo: event.target.value }))}
                className="h-12 rounded-[18px] border border-[#ddd6cb] bg-white px-4 text-sm text-brand-bark outline-none shadow-[0_10px_24px_rgba(55,43,46,0.06)]"
              />
            </label>
          </div>
          {isLoading ? (
            <div className="flex min-h-[180px] items-center justify-center"><LoadingSpinner className="h-9 w-9" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-[#ece5da] text-sm text-[#8d8a84]">
                    <th className="px-2 py-3 font-medium">Data</th>
                    <th className="px-2 py-3 font-medium">Produto</th>
                    <th className="px-2 py-3 font-medium">Movimento</th>
                    <th className="px-2 py-3 font-medium">Delta</th>
                    <th className="px-2 py-3 font-medium">Saldo</th>
                    <th className="px-2 py-3 font-medium">Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.map((movement) => (
                    <tr key={movement.id} className="border-b border-[#f2ece3] text-sm text-brand-bark">
                      <td className="px-2 py-3">{formatDateTime(movement.createdAt)}</td>
                      <td className="px-2 py-3">
                        <p className="font-semibold">{movement.product.name}</p>
                        <p className="text-xs text-[#8d8a84]">SKU {movement.product.sku}</p>
                      </td>
                      <td className="px-2 py-3">{movementLabels[movement.movementType]}</td>
                      <td className={`px-2 py-3 font-semibold ${movement.quantityDelta >= 0 ? 'text-[#3d8140]' : 'text-[#b53a64]'}`}>
                        {movement.quantityDelta >= 0 ? '+' : ''}{movement.quantityDelta}
                      </td>
                      <td className="px-2 py-3">{movement.previousQuantity} → {movement.nextQuantity}</td>
                      <td className="px-2 py-3 text-[#6f6a63]">{movement.note || 'Sem observação'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </section>

      <InventoryAdjustmentModal
        isOpen={Boolean(stockProduct)}
        product={stockProduct}
        direction={stockForm.direction}
        quantityMoved={stockForm.quantityMoved}
        newStockQuantity={stockForm.newStockQuantity}
        note={stockForm.note}
        isSubmitting={isSubmitting}
        onClose={() => setStockProduct(null)}
        onIncrease={() => handleStockStep(1)}
        onDecrease={() => handleStockStep(-1)}
        onQuantityMovedChange={handleStockQuantityMovedChange}
        onNewStockChange={handleStockNewQuantityChange}
        onNoteChange={(value) => setStockForm((current) => ({ ...current, note: value }))}
        onSubmit={handleAdjustStock}
      />
    </div>
  );
};
