import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, ClipboardClock, Pencil, Plus, ClipboardX } from 'lucide-react';
import { FullPagePurpleLoader, PurpleLoadingAnimation } from '@/components/AppLoaders';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';
import { Panel } from '@/components/Panel';
import { purchaseController } from '@/controllers/purchaseController';
import { LoadingSpinner, SearchableFilter } from '@/features/products/productUi';
import type { FilterOption } from '@/features/products/productUi';
import type {
  PurchaseFilters,
  PurchaseMetadata,
  PurchaseRecord,
  PurchaseStatus,
  PurchaseUpsertPayload,
  SupplierMode,
} from '@/models/types';
import { formatCurrency } from '@/utils/formatters';

type PurchaseFormState = {
  name: string;
  purchaseDate: string;
  supplierMode: SupplierMode;
  supplierId: string;
  expectedDeliveryDate: string;
  deliveryDate: string;
  description: string;
  notes: string;
  estimatedCost: string;
  productIds: string[];
  customProducts: string;
};

const statusMeta: Record<PurchaseStatus, { label: string; badge: string; button: string }> = {
  requested: {
    label: 'Solicitado',
    badge: 'bg-[#fff6e5] text-[#9a6a11]',
    button: 'border-[#f0dfab] bg-[#fffaf0] text-[#c79010]',
  },
  delivered: {
    label: 'Entregue',
    badge: 'bg-[#eaf7eb] text-[#2f7d32]',
    button: 'border-[#cde7cf] bg-[#f3fbf3] text-[#2f7d32]',
  },
  cancelled: {
    label: 'Cancelado',
    badge: 'bg-[#fff1f5] text-[#b53a64]',
    button: 'border-[#f0d7df] bg-[#fff7fa] text-[#b53a64]',
  },
};

const statusOptions: FilterOption[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Solicitado', value: 'requested' },
  { label: 'Entregue', value: 'delivered' },
  { label: 'Cancelado', value: 'cancelled' },
];

const cancellationReasonOptions: FilterOption[] = [
  { label: 'Pedido duplicado', value: 'Pedido duplicado' },
  { label: 'Erro no lançamento da compra', value: 'Erro no lançamento da compra' },
  { label: 'Compra devolvida ao fornecedor', value: 'Compra devolvida ao fornecedor' },
  { label: 'Fornecedor não conseguiu entregar', value: 'Fornecedor não conseguiu entregar' },
  { label: 'Divergência de preço ou quantidade', value: 'Divergência de preço ou quantidade' },
  { label: 'Outro', value: 'Outro' },
];

const createEmptyForm = (supplierId = ''): PurchaseFormState => ({
  name: '',
  purchaseDate: new Date().toISOString().slice(0, 10),
  supplierMode: supplierId ? 'supplier' : 'no-supplier',
  supplierId,
  expectedDeliveryDate: '',
  deliveryDate: '',
  description: '',
  notes: '',
  estimatedCost: '',
  productIds: [],
  customProducts: '',
});

const mapToForm = (purchase: PurchaseRecord, fallbackSupplierId = ''): PurchaseFormState => ({
  name: purchase.name,
  purchaseDate: purchase.purchaseDate,
  supplierMode: purchase.supplierMode,
  supplierId: purchase.supplierMode === 'supplier' ? purchase.supplierId : fallbackSupplierId,
  expectedDeliveryDate: purchase.expectedDeliveryDate,
  deliveryDate: purchase.deliveryDate,
  description: purchase.description,
  notes: purchase.notes,
  estimatedCost: String(purchase.estimatedCost),
  productIds: purchase.productIds,
  customProducts: purchase.customProducts,
});

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(`${value}T12:00:00`));

export const PurchasesPage = () => {
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [metadata, setMetadata] = useState<PurchaseMetadata>({ suppliers: [], products: [], statuses: [] });
  const [filters, setFilters] = useState<PurchaseFilters>({
    supplierId: 'all',
    search: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [form, setForm] = useState<PurchaseFormState>(createEmptyForm());
  const [selectedProductId, setSelectedProductId] = useState('none');
  const [editingPurchase, setEditingPurchase] = useState<PurchaseRecord | null>(null);
  const [cancellingPurchase, setCancellingPurchase] = useState<PurchaseRecord | null>(null);
  const [cancellationReason, setCancellationReason] = useState(cancellationReasonOptions[0].value);
  const [customCancellationReason, setCustomCancellationReason] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedPurchases, setHasLoadedPurchases] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const firstSupplierId = metadata.suppliers[0]?.id || '';

  const supplierOptions: FilterOption[] = useMemo(
    () => [
      { label: 'Todos os fornecedores', value: 'all' },
      { label: 'Sem fornecedor', value: 'no-supplier' },
      ...metadata.suppliers.map((supplier) => ({ label: supplier.name, value: supplier.id })),
    ],
    [metadata.suppliers],
  );

  const productOptions: FilterOption[] = useMemo(
    () => [
      { label: 'Selecionar produto', value: 'none' },
      ...metadata.products.map((product) => ({
        label: product.name,
        value: product.id,
        keywords: product.sku,
      })),
    ],
    [metadata.products],
  );

  const selectedSupplierOptions = useMemo(
    () => supplierOptions.filter((option) => option.value !== 'all' && option.value !== 'no-supplier'),
    [supplierOptions],
  );

  const loadPurchases = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await purchaseController.list(filters);
      setPurchases(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar as compras.');
    } finally {
      setIsLoading(false);
      setHasLoadedPurchases(true);
    }
  };

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const data = await purchaseController.getMetadata();
        setMetadata(data);
        setForm((current) => (current.supplierId ? current : createEmptyForm(data.suppliers[0]?.id || '')));
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar fornecedores e produtos.');
      }
    };

    loadMetadata();
  }, []);

  useEffect(() => {
    loadPurchases();
  }, [filters]);

  const filteredPurchases = purchases;

  const stats = useMemo(() => {
    const requested = purchases.filter((purchase) => purchase.status === 'requested').length;
    const delivered = purchases.filter((purchase) => purchase.status === 'delivered').length;
    const cancelled = purchases.filter((purchase) => purchase.status === 'cancelled').length;
    const totalCost = purchases
      .filter((purchase) => purchase.status !== 'cancelled')
      .reduce((sum, purchase) => sum + purchase.estimatedCost, 0);

    return [
      { label: 'Compras registradas', value: String(purchases.length), tone: 'text-brand-bark' },
      { label: 'Solicitadas', value: String(requested), tone: 'text-[#9a6a11]' },
      { label: 'Entregues', value: String(delivered), tone: 'text-[#2f7d32]' },
      { label: 'Custo total', value: formatCurrency(totalCost), tone: 'text-[#8e4d8c]' },
    ];
  }, [purchases]);

  const handleFormChange =
    (field: keyof PurchaseFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSupplierMode = (supplierMode: SupplierMode) => {
    setForm((current) => ({
      ...current,
      supplierMode,
      supplierId: supplierMode === 'supplier' ? current.supplierId || firstSupplierId : current.supplierId,
    }));
  };

  const toggleProduct = (productId: string) => {
    setForm((current) => ({
      ...current,
      productIds: current.productIds.includes(productId)
        ? current.productIds.filter((currentProductId) => currentProductId !== productId)
        : [...current.productIds, productId],
    }));
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);

    if (productId === 'none') {
      return;
    }

    setForm((current) => ({
      ...current,
      productIds: current.productIds.includes(productId) ? current.productIds : [...current.productIds, productId],
    }));
    setSelectedProductId('none');
  };

  const openCreateModal = () => {
    setEditingPurchase(null);
    setForm(createEmptyForm(firstSupplierId));
    setSelectedProductId('none');
    setIsModalOpen(true);
  };

  const openEditModal = (purchase: PurchaseRecord) => {
    setEditingPurchase(purchase);
    setForm(mapToForm(purchase, firstSupplierId));
    setSelectedProductId('none');
    setIsModalOpen(true);
  };

  const buildPayload = (): PurchaseUpsertPayload => ({
    name: form.name,
    purchaseDate: form.purchaseDate,
    supplierMode: form.supplierMode,
    supplierId: form.supplierMode === 'supplier' ? form.supplierId : undefined,
    expectedDeliveryDate: form.expectedDeliveryDate || undefined,
    deliveryDate: form.deliveryDate || undefined,
    description: form.description,
    notes: form.notes,
    estimatedCost: Number(form.estimatedCost || 0),
    productIds: form.productIds,
    customProducts: form.customProducts,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const nextPurchase = editingPurchase
        ? await purchaseController.update(editingPurchase.id, buildPayload())
        : await purchaseController.create(buildPayload());

      setPurchases((current) =>
        editingPurchase
          ? current.map((purchase) => (purchase.id === editingPurchase.id ? nextPurchase : purchase))
          : [nextPurchase, ...current],
      );
      setSuccessMessage(editingPurchase ? 'Compra atualizada com sucesso.' : 'Compra cadastrada com sucesso.');
      setIsModalOpen(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar a compra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (purchase: PurchaseRecord, status: PurchaseStatus) => {
    if (purchase.status === 'cancelled') {
      return;
    }

    if (status === 'cancelled') {
      openCancelModal(purchase);
      return;
    }

    if (purchase.status !== 'requested') {
      return;
    }

    setErrorMessage('');

    try {
      const updatedPurchase = status === 'delivered'
        ? await purchaseController.confirmEntry(purchase.id, purchase.deliveryDate || new Date().toISOString().slice(0, 10))
        : await purchaseController.updateStatus(purchase.id, status);

      setPurchases((current) =>
        current.map((currentPurchase) => (currentPurchase.id === purchase.id ? updatedPurchase : currentPurchase)),
      );
      setSuccessMessage(`Status da compra "${purchase.name}" atualizado para ${statusMeta[status].label.toLowerCase()}.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível atualizar o status da compra.');
    }
  };

  const handleCancelPurchase = async () => {
    if (!cancellingPurchase) {
      return;
    }

    setIsCancelling(true);
    setErrorMessage('');

    try {
      const reason = cancellationReason === 'Outro' ? customCancellationReason.trim() : cancellationReason;
      const updatedPurchase = await purchaseController.cancel(cancellingPurchase.id, reason);
      setPurchases((current) =>
        current.map((currentPurchase) => (currentPurchase.id === cancellingPurchase.id ? updatedPurchase : currentPurchase)),
      );
      setSuccessMessage('Compra cancelada com sucesso.');
      setCancellingPurchase(null);
      setCancellationReason(cancellationReasonOptions[0].value);
      setCustomCancellationReason('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível cancelar a compra.');
    } finally {
      setIsCancelling(false);
    }
  };

  const openCancelModal = (purchase: PurchaseRecord) => {
    setCancellingPurchase(purchase);
    setCancellationReason(cancellationReasonOptions[0].value);
    setCustomCancellationReason('');
  };

  const getStatusButtonClass = (purchase: PurchaseRecord, status: PurchaseStatus) => {
    const isSelected = purchase.status === status;
    const isCancellationAvailable = status === 'cancelled' && purchase.status !== 'cancelled';
    const isLocked = purchase.status !== 'requested' && !isCancellationAvailable;
    const baseClass = 'flex h-11 w-11 items-center justify-center rounded-full border transition';

    if (isLocked) {
      return `${baseClass} ${isSelected ? statusMeta[status].button : 'border-[#e7e1d8] bg-white text-[#c7c1b8]'} cursor-not-allowed opacity-45`;
    }

    if (isSelected) {
      return `${baseClass} ${statusMeta[status].button} hover:brightness-95 hover:shadow-[0_10px_22px_rgba(55,43,46,0.10)]`;
    }

    if (isCancellationAvailable) {
      return `${baseClass} border-[#f0d7df] bg-white text-[#b45072] hover:-translate-y-0.5 hover:bg-[#fff5f8] hover:shadow-[0_10px_22px_rgba(180,80,114,0.14)]`;
    }

    return `${baseClass} border-[#e4ddd3] bg-white text-[#8d8a84] hover:-translate-y-0.5 hover:border-[#cfc5b8] hover:bg-[#faf7f2] hover:text-brand-bark hover:shadow-[0_10px_22px_rgba(55,43,46,0.10)]`;
  };

  if (isLoading && !hasLoadedPurchases) {
    return <FullPagePurpleLoader />;
  }

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Compras"
        description="Histórico de compras com filtros, status clicáveis e modal para criação ou edição."
        titleColor="text-[#7B5CE6]"
        action={
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova compra
          </Button>
        }
      />

      {successMessage ? (
        <div className="mt-4 rounded-2xl border border-[#d9f0df] bg-[#f4fbf6] px-4 py-3 text-sm text-[#27633a]">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-[#f1d4dc] bg-[#fff5f8] px-4 py-3 text-sm text-[#9b3155]">
          {errorMessage}
        </div>
      ) : null}

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-[18px] border border-[#e8e1d6] bg-white px-4 py-4">
            <p className="text-center font-semibold text-[#7f7a73]">{item.label}</p>
            <div className="mt-2 flex min-h-[42px] items-center justify-center">
              {isLoading ? (
                <PurpleLoadingAnimation className="w-full max-w-[72px]" />
              ) : (
                <p className={`text-center text-[28px] font-bold tracking-[0.03em] ${item.tone}`}>{item.value}</p>
              )}
            </div>
          </div>
        ))}
      </section>

      <Panel
        title="Histórico de compras"
        className="mt-4"  
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(160px,0.75fr)_160px_160px_minmax(240px,1.1fr)_150px]">
          <div className="px-1">
            <Input
              label="Descrição da compra"
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Pesquise por nome ou descrição"
            />
          </div>
          <label className="flex flex-col gap-2 px-1 text-sm font-medium text-brand-bark">
            <span className="pl-1">De</span>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))}
              className="h-12 rounded-[18px] border border-[#ddd6cb] bg-white px-4 text-sm text-brand-bark outline-none shadow-[0_10px_24px_rgba(55,43,46,0.06)]"
            />
          </label>
          <label className="flex flex-col gap-2 px-1 text-sm font-medium text-brand-bark">
            <span className="pl-1">Até</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))}
              className="h-12 rounded-[18px] border border-[#ddd6cb] bg-white px-4 text-sm text-brand-bark outline-none shadow-[0_10px_24px_rgba(55,43,46,0.06)]"
            />
          </label>
          <SearchableFilter
            label="Fornecedor"
            value={filters.supplierId || 'all'}
            options={supplierOptions}
            searchPlaceholder="Buscar fornecedor"
            onSelect={(value) => setFilters((current) => ({ ...current, supplierId: value }))}
          />
          <SearchableFilter
            label="Status"
            value={filters.status || 'all'}
            options={statusOptions}
            searchPlaceholder="Buscar status"
            onSelect={(value) => setFilters((current) => ({ ...current, status: value }))}
          />
        </div>

        

        <div className="mt-4 space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Panel key={index} className="flex min-h-[190px] items-center justify-center rounded-[24px] border border-[#e7e0d5] bg-white shadow-[0_18px_38px_rgba(55,43,46,0.08)]">
                <div className="flex flex-col items-center gap-3 text-[#8d8a84]">
                  <LoadingSpinner className="h-9 w-9" />
                  <p className="text-sm">Buscando compras...</p>
                </div>
              </Panel>
            ))
          ) : filteredPurchases.length ? (
            filteredPurchases.map((purchase) => (
              <article
                key={purchase.id}
                className="rounded-[24px] border border-[#e7e0d5] bg-white p-5 shadow-[0_18px_38px_rgba(55,43,46,0.08)]"
              >
                <div className="grid gap-5 xl:grid-cols-[150px_minmax(180px,1fr)_115px_minmax(140px,0.8fr)_115px_minmax(190px,0.9fr)]">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#ad8c58]">Status</p>
                    <div className="mt-3 flex justify-center gap-2">
                      <button
                        type="button"
                        title="Marcar como solicitado"
                        onClick={() => handleStatusChange(purchase, 'requested')}
                        disabled={purchase.status !== 'requested'}
                        className={getStatusButtonClass(purchase, 'requested')}
                      >
                        <ClipboardClock className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        title="Marcar como entregue"
                        onClick={() => handleStatusChange(purchase, 'delivered')}
                        disabled={purchase.status !== 'requested'}
                        className={getStatusButtonClass(purchase, 'delivered')}
                      >
                        <ClipboardCheck className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        title={purchase.status === 'delivered' ? 'Cancelar compra entregue' : 'Cancelar compra'}
                        onClick={() => handleStatusChange(purchase, 'cancelled')}
                        disabled={purchase.status === 'cancelled'}
                        className={getStatusButtonClass(purchase, 'cancelled')}
                      >
                        <ClipboardX className="h-5 w-5" />
                      </button>
                    </div>
                    <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusMeta[purchase.status].badge}`}>
                      {statusMeta[purchase.status].label}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#ad8c58]">Nome da compra</p>
                    <h2 className="mt-3 text-[22px] font-bold text-brand-bark">{purchase.name}</h2>
                  </div>

                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#ad8c58]">Preço</p>
                    <p className="mt-3 text-[18px] font-bold text-[#8e4d8c]">{formatCurrency(purchase.estimatedCost)}</p>
                  </div>

                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#ad8c58]">Fornecedor</p>
                    <p className="mt-3 text-[16px] font-semibold text-brand-bark">{purchase.supplierName}</p>
                    <p className="mt-2 text-sm text-[#8d8a84]">{purchase.supplierMode === 'supplier' ? 'Compra vinculada' : 'Registro interno'}</p>
                  </div>

                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#ad8c58]">Compra</p>
                    <p className="mt-3 text-[16px] font-semibold text-brand-bark">{formatDate(purchase.purchaseDate)}</p>
                    <p className="mt-2 text-sm text-[#8d8a84]">Data do pedido</p>
                  </div>

                  <div className="flex h-full items-start justify-between gap-3">
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#ad8c58]">Entrega</p>
                      <p className="mt-3 text-[16px] font-semibold text-brand-bark">{purchase.deliveryDate ? formatDate(purchase.deliveryDate) : 'Pendente'}</p>
                      <p className="mt-2 text-sm text-[#8d8a84]">Data confirmada</p>
                    </div>
                    <div className="mt-6 flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(purchase)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ded8cf] text-[#7e756c] transition hover:bg-[#faf7f2]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[22px] border border-dashed border-[#ddd5ca] bg-[#fcfaf6] px-5 py-10 text-center">
              <p className="text-lg font-semibold text-brand-bark">Nenhuma compra encontrada</p>
              <p className="mt-2 text-sm text-[#8d8a84]">Ajuste os filtros ou cadastre uma nova compra para começar o histórico.</p>
            </div>
          )}
        </div>
      </Panel>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPurchase ? 'Editar compra' : 'Nova compra'}
        description="Cadastre ou ajuste uma compra com fornecedor opcional, datas e dados de acompanhamento."
        size="xl"
      >
        <form className="max-h-[calc(100vh-220px)] space-y-4 overflow-y-auto pr-2" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Nome da compra" value={form.name} onChange={handleFormChange('name')} required />
            <Input label="Custo estimado" type="number" min="0" step="0.01" value={form.estimatedCost} onChange={handleFormChange('estimatedCost')} required />
          </div>

          <div className="rounded-[22px] border border-[#e8e1d6] bg-[#faf8f3] p-4">
            <p className="text-sm font-medium text-brand-bark">Fornecedor</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleSupplierMode('supplier')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  form.supplierMode === 'supplier' ? 'bg-[#7B5CE6] text-white' : 'bg-white text-brand-bark ring-1 ring-[#ddd5c9]'
                }`}
              >
                Com fornecedor
              </button>
              <button
                type="button"
                onClick={() => handleSupplierMode('no-supplier')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  form.supplierMode === 'no-supplier' ? 'bg-[#4a9a4c] text-white' : 'bg-white text-brand-bark ring-1 ring-[#ddd5c9]'
                }`}
              >
                Sem fornecedor
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {form.supplierMode === 'supplier' ? (
              <SearchableFilter
                label="Fornecedor"
                value={form.supplierId}
                options={selectedSupplierOptions}
                searchPlaceholder="Buscar fornecedor"
                onSelect={(value) => setForm((current) => ({ ...current, supplierId: value }))}
              />
            ) : (
              <Input label="Fornecedor" value="Sem fornecedor" disabled />
            )}
            <Input label="Data da compra" type="date" value={form.purchaseDate} onChange={handleFormChange('purchaseDate')} required />
            <Input label="Data prevista para entrega" type="date" value={form.expectedDeliveryDate} onChange={handleFormChange('expectedDeliveryDate')} />
            <Input label="Data de entrega" type="date" value={form.deliveryDate} onChange={handleFormChange('deliveryDate')} />
          </div>

          <div className="space-y-3 rounded-[22px] border border-[#e8e1d6] bg-[#faf8f3] p-4">
            <SearchableFilter
              label="Adicionar produto"
              value={selectedProductId}
              options={productOptions}
              searchPlaceholder="Buscar produto"
              onSelect={handleProductSelect}
            />
            <div className="flex flex-wrap gap-2">
              {form.productIds.length ? (
                form.productIds.map((productId) => {
                  const product = metadata.products.find((catalogProduct) => catalogProduct.id === productId);

                  return product ? (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggleProduct(product.id)}
                      className="rounded-full bg-[#6f3fe4] px-3 py-2 text-sm font-medium text-white shadow-[0_12px_24px_rgba(111,63,228,0.18)] transition hover:bg-[#5f34ca]"
                    >
                      {product.name}
                    </button>
                  ) : null;
                })
              ) : (
                <span className="rounded-full border border-dashed border-[#ddd5ca] px-3 py-2 text-sm text-[#8d8a84]">
                  Sem produtos vinculados
                </span>
              )}
            </div>
          </div>

          <label className="flex w-full flex-col gap-2 text-sm font-medium text-brand-bark">
            <span>Produtos não cadastrados</span>
            <textarea
              value={form.customProducts}
              onChange={handleFormChange('customProducts')}
              rows={2}
              className="w-full rounded-[20px] border border-[#d7d7d1] bg-[#f4f4f1] px-4 py-3 text-sm text-brand-bark outline-none transition placeholder:text-[#9b9a94] focus:border-brand-sage focus:bg-white"
              placeholder="Ex.: itens avulsos, materiais de apoio ou produtos que ainda entrarão no catálogo."
            />
          </label>

          <label className="flex w-full flex-col gap-2 text-sm font-medium text-brand-bark">
            <span>Descrição da compra</span>
            <textarea
              value={form.description}
              onChange={handleFormChange('description')}
              rows={4}
              className="w-full rounded-[20px] border border-[#d7d7d1] bg-[#f4f4f1] px-4 py-3 text-sm text-brand-bark outline-none transition placeholder:text-[#9b9a94] focus:border-brand-sage focus:bg-white"
              placeholder="Descreva o objetivo da compra, os itens esperados e o contexto operacional."
              required
            />
          </label>

          <label className="flex w-full flex-col gap-2 text-sm font-medium text-brand-bark">
            <span>Observações</span>
            <textarea
              value={form.notes}
              onChange={handleFormChange('notes')}
              rows={3}
              className="w-full rounded-[20px] border border-[#d7d7d1] bg-[#f4f4f1] px-4 py-3 text-sm text-brand-bark outline-none transition placeholder:text-[#9b9a94] focus:border-brand-sage focus:bg-white"
              placeholder="Ex.: compra sem contato direto pelo sistema, pendências de entrega, informações internas."
            />
          </label>

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : editingPurchase ? 'Salvar alterações' : 'Cadastrar compra'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(cancellingPurchase)}
        onClose={() => setCancellingPurchase(null)}
        title="Cancelar compra"
        description="Confirme o cancelamento e informe um motivo opcional para o histórico."
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-[22px] border border-[#f0d7df] bg-[#fff7fa] px-4 py-4">
            <p className="text-sm font-medium text-brand-bark">
              Deseja cancelar a compra "{cancellingPurchase?.name}"?
            </p>
            <p className="mt-2 text-sm text-[#8d8a84]">
              {cancellingPurchase?.status === 'delivered'
                ? 'Esta compra já teve entrada confirmada. Ao cancelar, o sistema retornará a compra do fornecedor, cancelará o financeiro e reduzirá do estoque o que foi adicionado, sem deixar produtos com estoque negativo.'
                : 'Depois de cancelada, ela ficará bloqueada para mudanças de status e o lançamento financeiro será cancelado.'}
            </p>
          </div>

          <SearchableFilter
            label="Motivo do cancelamento"
            value={cancellationReason}
            options={cancellationReasonOptions}
            searchPlaceholder="Buscar motivo"
            onSelect={setCancellationReason}
          />

          {cancellationReason === 'Outro' ? (
            <label className="flex w-full flex-col gap-2 text-sm font-medium text-brand-bark">
              <span>Descreva o motivo</span>
              <textarea
                value={customCancellationReason}
                onChange={(event) => setCustomCancellationReason(event.target.value)}
                rows={3}
                className="w-full rounded-[20px] border border-[#d7d7d1] bg-[#f4f4f1] px-4 py-3 text-sm text-brand-bark outline-none transition placeholder:text-[#9b9a94] focus:border-brand-sage focus:bg-white"
                placeholder="Motivo opcional do cancelamento."
              />
            </label>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setCancellingPurchase(null)}>
              Voltar
            </Button>
            <Button type="button" onClick={handleCancelPurchase} disabled={isCancelling}>
              {isCancelling ? 'Cancelando...' : 'Cancelar compra'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
