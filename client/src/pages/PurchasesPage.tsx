import type { ChangeEvent, FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { ClipboardCheck, ClipboardClock, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';
import { Panel } from '@/components/Panel';
import { SearchableFilter } from '@/features/products/productUi';
import type { FilterOption } from '@/features/products/productUi';
import { formatCurrency } from '@/utils/formatters';

type PurchaseStatus = 'requested' | 'delivered' | 'cancelled';
type SupplierMode = 'supplier' | 'no-supplier';

type PurchaseRecord = {
  id: string;
  name: string;
  purchaseDate: string;
  supplierMode: SupplierMode;
  supplierId: string;
  supplierName: string;
  expectedDeliveryDate: string;
  deliveryDate: string;
  description: string;
  notes: string;
  estimatedCost: number;
  status: PurchaseStatus;
  productIds: string[];
  customProducts: string;
};

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

const suppliers = [
  { value: 'flora-premium', label: 'Flora Premium Distribuidora' },
  { value: 'orquidea-hub', label: 'Orquídea Hub Atacado' },
  { value: 'verde-essencial', label: 'Verde Essencial Garden' },
];

const catalogProducts = [
  { id: 'adubo-organico', name: 'Adubo Orgânico Premium', sku: 'ADB-ORG-500' },
  { id: 'vaso-terracota', name: 'Vaso Cerâmico Terracota M', sku: 'VAS-TERRA-M' },
  { id: 'substrato-orquideas', name: 'Substrato para Orquídeas 1kg', sku: 'SUB-ORQ-1KG' },
  { id: 'flores-corte', name: 'Flores de corte premium', sku: 'FLR-CORTE-P' },
  { id: 'fitilho', name: 'Fitilho decorativo', sku: 'FIT-DEC' },
];

const purchasesSeed: PurchaseRecord[] = [
  {
    id: 'purchase-1',
    name: 'Reposição de insumos da semana',
    purchaseDate: '2026-05-14',
    supplierMode: 'supplier',
    supplierId: 'flora-premium',
    supplierName: 'Flora Premium Distribuidora',
    expectedDeliveryDate: '2026-05-18',
    deliveryDate: '',
    description: 'Adubo, embalagens e fitilhos para reposição rápida.',
    notes: 'Compra solicitada para normalizar o estoque antes do final de semana.',
    estimatedCost: 980.5,
    status: 'requested',
    productIds: ['adubo-organico', 'fitilho'],
    customProducts: 'Embalagens kraft para buquês',
  },
  {
    id: 'purchase-2',
    name: 'Compra de vasos terracota',
    purchaseDate: '2026-05-10',
    supplierMode: 'supplier',
    supplierId: 'verde-essencial',
    supplierName: 'Verde Essencial Garden',
    expectedDeliveryDate: '2026-05-12',
    deliveryDate: '2026-05-13',
    description: 'Lote para exposição da vitrine e reposição do catálogo.',
    notes: 'Já conferido e lançado no estoque.',
    estimatedCost: 1340,
    status: 'delivered',
    productIds: ['vaso-terracota'],
    customProducts: '',
  },
  {
    id: 'purchase-3',
    name: 'Reposição avulsa sem fornecedor',
    purchaseDate: '2026-05-09',
    supplierMode: 'no-supplier',
    supplierId: 'no-supplier',
    supplierName: 'Sem fornecedor',
    expectedDeliveryDate: '2026-05-09',
    deliveryDate: '2026-05-09',
    description: 'Entrada interna de itens de apoio para embalagem.',
    notes: 'Registro interno, sem parceiro vinculado.',
    estimatedCost: 220,
    status: 'cancelled',
    productIds: [],
    customProducts: 'Tesouras, etiquetas e itens de apoio',
  },
  {
    id: 'purchase-4',
    name: 'Flores de corte para kits premium',
    purchaseDate: '2026-05-16',
    supplierMode: 'supplier',
    supplierId: 'orquidea-hub',
    supplierName: 'Orquídea Hub Atacado',
    expectedDeliveryDate: '2026-05-19',
    deliveryDate: '',
    description: 'Seleção de flores para montagem de arranjos premium.',
    notes: 'Aguardando confirmação final da entrega.',
    estimatedCost: 1875.3,
    status: 'requested',
    productIds: ['flores-corte'],
    customProducts: 'Mix sazonal sob encomenda',
  },
];

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

const supplierOptions: FilterOption[] = [
  { label: 'Todos os fornecedores', value: 'all' },
  { label: 'Sem fornecedor', value: 'no-supplier' },
  ...suppliers.map((supplier) => ({ label: supplier.label, value: supplier.value })),
];

const statusOptions: FilterOption[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Solicitado', value: 'requested' },
  { label: 'Entregue', value: 'delivered' },
  { label: 'Cancelado', value: 'cancelled' },
];

const productOptions: FilterOption[] = [
  { label: 'Selecionar produto', value: 'none' },
  ...catalogProducts.map((product) => ({
    label: product.name,
    value: product.id,
    keywords: product.sku,
  })),
];

const createEmptyForm = (): PurchaseFormState => ({
  name: '',
  purchaseDate: '2026-05-17',
  supplierMode: 'supplier',
  supplierId: suppliers[0]?.value || '',
  expectedDeliveryDate: '',
  deliveryDate: '',
  description: '',
  notes: '',
  estimatedCost: '',
  productIds: [],
  customProducts: '',
});

const mapToForm = (purchase: PurchaseRecord): PurchaseFormState => ({
  name: purchase.name,
  purchaseDate: purchase.purchaseDate,
  supplierMode: purchase.supplierMode,
  supplierId: purchase.supplierMode === 'supplier' ? purchase.supplierId : suppliers[0]?.value || '',
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

const resolveSupplierName = (mode: SupplierMode, supplierId: string) => {
  if (mode === 'no-supplier') {
    return 'Sem fornecedor';
  }

  return suppliers.find((supplier) => supplier.value === supplierId)?.label || 'Fornecedor não informado';
};

export const PurchasesPage = () => {
  const [purchases, setPurchases] = useState<PurchaseRecord[]>(purchasesSeed);
  const [filters, setFilters] = useState({ supplierId: 'all', search: '', status: 'all', dateFrom: '', dateTo: '' });
  const [form, setForm] = useState<PurchaseFormState>(createEmptyForm());
  const [selectedProductId, setSelectedProductId] = useState('none');
  const [editingPurchase, setEditingPurchase] = useState<PurchaseRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const filteredPurchases = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    return purchases.filter((purchase) => {
      const matchesSupplier =
        filters.supplierId === 'all'
          ? true
          : filters.supplierId === 'no-supplier'
            ? purchase.supplierMode === 'no-supplier'
            : purchase.supplierId === filters.supplierId;
      const matchesStatus = filters.status === 'all' || purchase.status === filters.status;
      const purchaseDate = new Date(`${purchase.purchaseDate}T12:00:00`);
      const matchesDateFrom = !filters.dateFrom || purchaseDate >= new Date(`${filters.dateFrom}T00:00:00`);
      const matchesDateTo = !filters.dateTo || purchaseDate <= new Date(`${filters.dateTo}T23:59:59`);
      const matchesSearch = !normalizedSearch
        || `${purchase.name} ${purchase.description}`.toLowerCase().includes(normalizedSearch);

      return matchesSupplier && matchesStatus && matchesDateFrom && matchesDateTo && matchesSearch;
    });
  }, [filters, purchases]);

  const stats = useMemo(() => {
    const requested = purchases.filter((purchase) => purchase.status === 'requested').length;
    const delivered = purchases.filter((purchase) => purchase.status === 'delivered').length;
    const cancelled = purchases.filter((purchase) => purchase.status === 'cancelled').length;
    const totalCost = purchases.reduce((sum, purchase) => sum + purchase.estimatedCost, 0);

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
      supplierId: supplierMode === 'supplier' ? current.supplierId || suppliers[0]?.value || '' : current.supplierId,
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
    setForm(createEmptyForm());
    setSelectedProductId('none');
    setIsModalOpen(true);
  };

  const openEditModal = (purchase: PurchaseRecord) => {
    setEditingPurchase(purchase);
    setForm(mapToForm(purchase));
    setSelectedProductId('none');
    setIsModalOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const nextPurchase: PurchaseRecord = {
      id: editingPurchase?.id || `purchase-${Date.now()}`,
      name: form.name,
      purchaseDate: form.purchaseDate,
      supplierMode: form.supplierMode,
      supplierId: form.supplierMode === 'supplier' ? form.supplierId : 'no-supplier',
      supplierName: resolveSupplierName(form.supplierMode, form.supplierId),
      expectedDeliveryDate: form.expectedDeliveryDate,
      deliveryDate: form.deliveryDate,
      description: form.description,
      notes: form.notes,
      estimatedCost: Number(form.estimatedCost),
      status: editingPurchase?.status || 'requested',
      productIds: form.productIds,
      customProducts: form.customProducts,
    };

    setPurchases((current) =>
      editingPurchase
        ? current.map((purchase) => (purchase.id === editingPurchase.id ? nextPurchase : purchase))
        : [nextPurchase, ...current],
    );

    setSuccessMessage(editingPurchase ? 'Compra atualizada com sucesso.' : 'Compra cadastrada com sucesso.');
    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const handleStatusChange = (purchase: PurchaseRecord, status: PurchaseStatus) => {
    setPurchases((current) =>
      current.map((currentPurchase) =>
        currentPurchase.id === purchase.id ? { ...currentPurchase, status } : currentPurchase,
      ),
    );
    setSuccessMessage(`Status da compra "${purchase.name}" atualizado para ${statusMeta[status].label.toLowerCase()}.`);
  };

  const handleCancelPurchase = (purchase: PurchaseRecord) => {
    if (!window.confirm(`Cancelar a compra "${purchase.name}"?`)) {
      return;
    }

    setPurchases((current) =>
      current.map((currentPurchase) =>
        currentPurchase.id === purchase.id ? { ...currentPurchase, status: 'cancelled' } : currentPurchase,
      ),
    );
    setSuccessMessage('Compra cancelada com sucesso.');
  };

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

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-[18px] border border-[#e8e1d6] bg-white px-4 py-4">
            <p className="text-center font-semibold text-[#7f7a73]">{item.label}</p>
            <p className={`text-center mt-2 text-[28px] font-bold tracking-[0.03em] ${item.tone}`}>{item.value}</p>
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
            value={filters.supplierId}
            options={supplierOptions}
            searchPlaceholder="Buscar fornecedor"
            onSelect={(value) => setFilters((current) => ({ ...current, supplierId: value }))}
          />
          <SearchableFilter
            label="Status"
            value={filters.status}
            options={statusOptions}
            searchPlaceholder="Buscar status"
            onSelect={(value) => setFilters((current) => ({ ...current, status: value }))}
          />
        </div>

        

        <div className="mt-4 space-y-4">
          {filteredPurchases.length ? (
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
                        className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                          purchase.status === 'requested'
                            ? statusMeta.requested.button
                            : 'border-[#e4ddd3] bg-white text-[#8d8a84] hover:bg-[#faf7f2]'
                        }`}
                      >
                        <ClipboardClock className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        title="Marcar como entregue"
                        onClick={() => handleStatusChange(purchase, 'delivered')}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                          purchase.status === 'delivered'
                            ? statusMeta.delivered.button
                            : 'border-[#e4ddd3] bg-white text-[#8d8a84] hover:bg-[#faf7f2]'
                        }`}
                      >
                        <ClipboardCheck className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        title="Marcar como cancelado"
                        onClick={() => handleStatusChange(purchase, 'cancelled')}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                          purchase.status === 'cancelled'
                            ? statusMeta.cancelled.button
                            : 'border-[#e4ddd3] bg-white text-[#8d8a84] hover:bg-[#faf7f2]'
                        }`}
                      >
                        <ClipboardCheck className="h-5 w-5" />
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
                      <button
                        type="button"
                        onClick={() => handleCancelPurchase(purchase)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f0d7df] text-[#b45072] transition hover:bg-[#fff5f8]"
                      >
                        <Trash2 className="h-4 w-4" />
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
                options={supplierOptions.filter((option) => option.value !== 'all' && option.value !== 'no-supplier')}
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
                  const product = catalogProducts.find((catalogProduct) => catalogProduct.id === productId);

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
    </div>
  );
};
