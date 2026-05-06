import { useEffect, useMemo, useState } from 'react';
import { BadgePercent } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';
import { Panel } from '@/components/Panel';
import { saleController } from '@/controllers/saleController';
import type { DiscountMode, SaleCartItem, SalesCatalogProduct, SalesCustomer, SalesPaymentMethodOption, SalesView } from '@/models/types';
import { formatCurrency } from '@/utils/formatters';

type SalesStep = 'product' | 'customer' | 'payment';
type CustomerMode = 'new' | 'existing';

const steps: Array<{ id: SalesStep; number: number; label: string; description?: string }> = [
  { id: 'product', number: 1, label: 'Produto' },
  { id: 'customer', number: 2, label: 'Cliente' },
  { id: 'payment', number: 3, label: 'Pagamento' },
];

const stockTone: Record<SalesCatalogProduct['status'], string> = {
  'Em estoque': 'text-[#2f7d32] bg-[#eaf7eb] border-[#cae6cc]',
  'Estoque baixo': 'text-[#9a6a11] bg-[#fff8e6] border-[#f0dfab]',
  'Sem estoque': 'text-[#a23358] bg-[#fff1f5] border-[#f2d3df]',
};

const parseMoney = (value: string) => {
  const normalized = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatMoneyInput = (value: number) => value.toFixed(2).replace('.', ',');

const applyDiscount = (baseAmount: number, discountMode: DiscountMode, discountValue: number) => {
  if (discountValue <= 0 || baseAmount <= 0) {
    return 0;
  }

  if (discountMode === 'percent') {
    return Math.min(baseAmount, (baseAmount * discountValue) / 100);
  }

  return Math.min(baseAmount, discountValue);
};

const QuantityButton = ({ onClick, children }: { onClick: () => void; children: string }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ddd5c9] bg-white text-lg font-semibold text-brand-bark transition hover:bg-[#f8f5ef]"
  >
    {children}
  </button>
);

const StepButton = ({
  step,
  active,
  disabled,
  onClick,
}: {
  step: (typeof steps)[number];
  active: boolean;
  disabled: boolean;
  onClick: (step: SalesStep) => void;
}) => (
  <button
    type="button"
    onClick={() => onClick(step.id)}
    disabled={disabled}
    className={`flex min-w-0 flex-1 items-center gap-3 rounded-[20px] border px-4 py-3 text-left transition ${
      active
        ? 'border-[#4a9a4c] bg-[#edf8ee]'
        : 'border-[#e5dfd4] bg-white hover:bg-[#fbfaf7]'
    } ${disabled ? 'cursor-not-allowed opacity-55 hover:bg-white' : ''}`}
  >
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${active ? 'bg-[#4a9a4c] text-white' : 'bg-[#f5f2ea] text-brand-bark'}`}>
      {step.number}
    </div>
    <div className="min-w-0">
      <p className="truncate text-[15px] font-semibold text-brand-bark">{step.label}</p>
      <p className="truncate text-xs text-[#8d8a84]">{step.description}</p>
    </div>
  </button>
);

const StepChevron = () => (
  <div className="hidden items-center justify-center text-[26px] font-bold text-[#4a9a4c] md:flex">
    {'>'}
  </div>
);

const DiscountModeButton = ({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
      active ? 'bg-[#4a9a4c] text-white' : 'bg-[#f5f2ea] text-brand-bark'
    }`}
  >
    {label}
  </button>
);

export const SalesPage = () => {
  const [view, setView] = useState<SalesView | null>(null);
  const [activeStep, setActiveStep] = useState<SalesStep>('product');
  const [customerMode, setCustomerMode] = useState<CustomerMode>('new');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [cartItems, setCartItems] = useState<SaleCartItem[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<SalesPaymentMethodOption['id']>('PIX');
  const [discountMode, setDiscountMode] = useState<DiscountMode>('fixed');
  const [discountInput, setDiscountInput] = useState('0,00');
  const [paidAmountInput, setPaidAmountInput] = useState('0,00');
  const [orderNotes, setOrderNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [itemDiscountTarget, setItemDiscountTarget] = useState<string | null>(null);
  const [itemDiscountDraftMode, setItemDiscountDraftMode] = useState<DiscountMode>('fixed');
  const [itemDiscountDraftValue, setItemDiscountDraftValue] = useState('0,00');
  const [isOrderDiscountModalOpen, setIsOrderDiscountModalOpen] = useState(false);
  const [orderDiscountDraftMode, setOrderDiscountDraftMode] = useState<DiscountMode>('fixed');
  const [orderDiscountDraftValue, setOrderDiscountDraftValue] = useState('0,00');

  useEffect(() => {
    saleController.getView().then((response) => {
      setView(response);
      setCartItems(response.cartItems);
      setCustomerName(response.customerName);
      setCustomerPhone(response.customerPhone);
      setCustomerCpf(response.customerCpf);
      setCustomerNotes(response.customerNotes);
      setSelectedPayment(response.selectedPayment || 'PIX');
      setDiscountMode('fixed');
      setDiscountInput(formatMoneyInput(response.discountAmount));
      setPaidAmountInput(formatMoneyInput(response.paidAmount));
    });
  }, []);

  const categories = useMemo(() => {
    if (!view) {
      return ['Todos'];
    }

    return ['Todos', ...new Set(view.catalogProducts.map((product) => product.categoryName))];
  }, [view]);

  const productMap = useMemo(() => {
    if (!view) {
      return new Map<string, SalesCatalogProduct>();
    }

    return new Map(view.catalogProducts.map((product) => [product.id, product]));
  }, [view]);

  const searchableProducts = useMemo(() => {
    if (!view) {
      return [];
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    return view.catalogProducts.filter((product) => {
      const matchesCategory = selectedCategory === 'Todos' || product.categoryName === selectedCategory;
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.categoryName.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory, view]);

  const filteredCustomers = useMemo(() => {
    if (!view) {
      return [];
    }

    const normalizedSearch = customerSearch.trim().toLowerCase();

    return view.customerSuggestions.filter((customer) => {
      if (!normalizedSearch) {
        return true;
      }

      return customer.name.toLowerCase().includes(normalizedSearch) || customer.phone.toLowerCase().includes(normalizedSearch);
    });
  }, [customerSearch, view]);

  const cartDetails = useMemo(
    () =>
      cartItems
        .map((item) => {
          const product = productMap.get(item.productId);
          if (!product) {
            return null;
          }

          return {
            ...item,
            product,
            grossLineTotal: product.price * item.quantity,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [cartItems, productMap],
  );

  const cartPricing = useMemo(
    () =>
      cartDetails.map((item) => {
        const discountValue = item.discountValue ?? 0;
        const itemDiscountMode = item.discountMode ?? 'fixed';
        const lineDiscount = applyDiscount(item.grossLineTotal, itemDiscountMode, discountValue);

        return {
          ...item,
          itemDiscountMode,
          lineDiscount,
          lineTotal: Math.max(0, item.grossLineTotal - lineDiscount),
        };
      }),
    [cartDetails],
  );

  const subtotal = useMemo(() => cartPricing.reduce((sum, item) => sum + item.grossLineTotal, 0), [cartPricing]);
  const itemsDiscountTotal = useMemo(() => cartPricing.reduce((sum, item) => sum + item.lineDiscount, 0), [cartPricing]);
  const subtotalAfterItemsDiscount = Math.max(0, subtotal - itemsDiscountTotal);
  const orderDiscountValue = parseMoney(discountInput);
  const orderDiscountAmount = applyDiscount(subtotalAfterItemsDiscount, discountMode, orderDiscountValue);
  const total = Math.max(0, subtotalAfterItemsDiscount - orderDiscountAmount);
  const paidAmount = parseMoney(paidAmountInput);
  const changeAmount = Math.max(0, paidAmount - total);
  const remainingAmount = Math.max(0, total - paidAmount);

  const productStepComplete = cartItems.length > 0;
  const customerStepComplete = customerName.trim().length > 0 && customerPhone.trim().length > 0;

  const addProductToCart = (productId: string) => {
    setCartItems((current) => {
      const existingItem = current.find((item) => item.productId === productId);
      if (existingItem) {
        return current.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item));
      }

      return [...current, { productId, quantity: 1 }];
    });
    setStatusMessage('');
  };

  const updateCartQuantity = (productId: string, nextQuantity: number) => {
    setCartItems((current) =>
      current.flatMap((item) => {
        if (item.productId !== productId) {
          return [item];
        }

        if (nextQuantity <= 0) {
          return [];
        }

        return [{ ...item, quantity: nextQuantity }];
      }),
    );
    setStatusMessage('');
  };

  const updateItemDiscountMode = (productId: string, nextMode: DiscountMode) => {
    setCartItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, discountMode: nextMode }
          : item,
      ),
    );
  };

  const updateItemDiscountValue = (productId: string, nextValue: string) => {
    const parsed = parseMoney(nextValue);

    setCartItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, discountValue: parsed }
          : item,
      ),
    );
  };

  const openItemDiscountModal = (productId: string) => {
    const target = cartItems.find((item) => item.productId === productId);
    setItemDiscountTarget(productId);
    setItemDiscountDraftMode(target?.discountMode ?? 'fixed');
    setItemDiscountDraftValue(
      target?.discountValue ? formatMoneyInput(target.discountValue) : '0,00',
    );
  };

  const closeItemDiscountModal = () => {
    setItemDiscountTarget(null);
    setItemDiscountDraftMode('fixed');
    setItemDiscountDraftValue('0,00');
  };

  const applyItemDiscountDraft = () => {
    if (!itemDiscountTarget) {
      return;
    }

    updateItemDiscountMode(itemDiscountTarget, itemDiscountDraftMode);
    updateItemDiscountValue(itemDiscountTarget, itemDiscountDraftValue);
    closeItemDiscountModal();
  };

  const openOrderDiscountModal = () => {
    setOrderDiscountDraftMode(discountMode);
    setOrderDiscountDraftValue(discountInput);
    setIsOrderDiscountModalOpen(true);
  };

  const closeOrderDiscountModal = () => {
    setIsOrderDiscountModalOpen(false);
    setOrderDiscountDraftMode('fixed');
    setOrderDiscountDraftValue('0,00');
  };

  const applyOrderDiscountDraft = () => {
    setDiscountMode(orderDiscountDraftMode);
    setDiscountInput(orderDiscountDraftValue);
    setIsOrderDiscountModalOpen(false);
  };

  const applyCustomer = (customer: SalesCustomer) => {
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setCustomerCpf(customer.cpf ?? '');
    setCustomerMode('existing');
    setStatusMessage('');
  };

  const clearSale = () => {
    if (!view) {
      return;
    }

    setCartItems([]);
    setActiveStep('product');
    setCustomerMode('new');
    setCustomerSearch('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerCpf('');
    setCustomerNotes('');
    setDiscountMode('fixed');
    setDiscountInput('0,00');
    setPaidAmountInput('0,00');
    setSelectedPayment(view.selectedPayment || 'PIX');
    setOrderNotes('');
    setStatusMessage('');
  };

  const canOpenStep = (step: SalesStep) => {
    if (step === 'product') {
      return true;
    }

    if (step === 'customer') {
      return productStepComplete;
    }

    return productStepComplete && customerStepComplete;
  };

  const handleStepChange = (step: SalesStep) => {
    if (!canOpenStep(step)) {
      return;
    }

    setActiveStep(step);
  };

  const handlePrimaryAction = () => {
    if (activeStep === 'product') {
      if (!productStepComplete) {
        setStatusMessage('Adicione pelo menos um produto para continuar.');
        return;
      }

      setStatusMessage('');
      setActiveStep('customer');
      return;
    }

    if (activeStep === 'customer') {
      if (!customerStepComplete) {
        setStatusMessage('Informe nome e telefone para seguir ao pagamento.');
        return;
      }

      setStatusMessage('');
      setActiveStep('payment');
      return;
    }

    if (!productStepComplete) {
      setStatusMessage('Adicione produtos antes de finalizar.');
      setActiveStep('product');
      return;
    }

    if (!customerStepComplete) {
      setStatusMessage('Informe o cliente antes de finalizar.');
      setActiveStep('customer');
      return;
    }

    setStatusMessage('Venda pronta para integração com o back-end.');
  };

  if (!view) {
    return null;
  }

  const itemDiscountProduct = itemDiscountTarget ? productMap.get(itemDiscountTarget) : null;
  const itemDiscountBase = itemDiscountProduct
    ? itemDiscountProduct.price * (cartItems.find((item) => item.productId === itemDiscountTarget)?.quantity ?? 0)
    : 0;
  const itemDiscountPreview = applyDiscount(
    itemDiscountBase,
    itemDiscountDraftMode,
    parseMoney(itemDiscountDraftValue),
  );
  const itemFinalPreview = Math.max(0, itemDiscountBase - itemDiscountPreview);
  const orderDiscountPreview = applyDiscount(
    subtotalAfterItemsDiscount,
    orderDiscountDraftMode,
    parseMoney(orderDiscountDraftValue),
  );
  const orderFinalPreview = Math.max(0, subtotalAfterItemsDiscount - orderDiscountPreview);

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Vendas"
        titleColor="text-[#7B5CE6]"
        action={<div className="inline-flex h-11 items-center rounded-full border border-[#e8e1d6] bg-white px-5 text-sm font-medium text-brand-bark">Modo venda rápida</div>}
      />

      {statusMessage ? (
        <div className="mt-4 rounded-2xl border border-[#eadfbe] bg-[#fffaf0] px-4 py-3 text-sm text-[#7d5a10]">
          {statusMessage}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_380px]">
        <div className="min-w-0 space-y-5">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
            {steps.map((step, index) => (
              <div key={step.id} className="contents">
                <StepButton
                  step={step}
                  active={activeStep === step.id}
                  disabled={!canOpenStep(step.id)}
                  onClick={handleStepChange}
                />
                {index < steps.length - 1 ? <StepChevron /> : null}
              </div>
            ))}
          </div>

          {activeStep === 'product' ? (
            <Panel title="Etapa 1 · Produtos" description="Pesquise para adicionar produtos ao pedido. Os atalhos servem para acelerar os itens mais vendidos.">
              <div className="space-y-5">
                <Input
                  label="Busca rápida"
                  placeholder="Ex: buquê, orquídea, girassol"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />

                <div className="rounded-[22px] border border-[#e8e1d6] bg-[#fcfbf8] p-4">
                  <p className="text-sm font-semibold text-brand-bark">Atalhos de venda</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {view.popularProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addProductToCart(product.id)}
                        className="rounded-full border border-[#ddd5c9] bg-white px-4 py-2 text-sm font-semibold text-brand-bark transition hover:bg-[#f7f4ee]"
                      >
                        + {product.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        selectedCategory === category ? 'bg-[#4a9a4c] text-white' : 'border border-[#ddd5c9] bg-[#f8f5ef] text-brand-bark hover:bg-white'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="h-[430px] overflow-y-auto rounded-[22px] border border-[#ddd5c9] bg-[#fcfaf5] p-3">
                  {searchableProducts.length ? (
                    <div className="grid gap-4">
                      {searchableProducts.map((product) => (
                        <div key={product.id} className="rounded-[22px] border border-[#e8e1d6] bg-white p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-[16px] font-semibold text-brand-bark">{product.name}</p>
                              <p className="mt-1 text-sm text-[#8d8a84]">{product.categoryName}</p>
                            </div>
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${stockTone[product.status]}`}>
                              {product.stockQuantity} un.
                            </span>
                          </div>
                          <div className="mt-5 flex items-end justify-between gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-[0.16em] text-[#8d8a84]">Preço</p>
                              <p className="text-[21px] font-bold text-[#d24f83]">{formatCurrency(product.price)}</p>
                            </div>
                            <Button onClick={() => addProductToCart(product.id)} disabled={product.status === 'Sem estoque'}>
                              {product.status === 'Sem estoque' ? 'Sem estoque' : 'Adicionar'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-[18px] border border-dashed border-[#ddd5c9] bg-white px-6 py-8 text-sm text-[#8d8a84]">
                      Nenhum produto encontrado para essa busca ou categoria.
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          ) : null}

          {activeStep === 'customer' ? (
            <Panel title="Etapa 2 · Cliente" description="Escolha entre buscar um cliente já cadastrado ou criar um novo com nome e telefone.">
              <div className="space-y-5">
                <div className="rounded-[28px] bg-[#f3f1eb] p-5">
                  <h3 className="text-[18px] font-bold text-brand-bark">Cliente</h3>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setCustomerMode('existing')}
                      className={`rounded-[18px] px-5 py-4 text-base font-semibold transition ${
                        customerMode === 'existing' ? 'bg-[#e9e4da] text-brand-bark' : 'bg-white text-[#7d7a73]'
                      }`}
                    >
                      Selecionar existente
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerMode('new')}
                      className={`rounded-[18px] px-5 py-4 text-base font-semibold transition ${
                        customerMode === 'new' ? 'bg-[#4a9a4c] text-white' : 'bg-white text-[#4a9a4c]'
                      }`}
                    >
                      Adicionar novo
                    </button>
                  </div>

                  {customerMode === 'existing' ? (
                    <div className="mt-4 space-y-3">
                      <Input
                        label="Buscar cliente"
                        placeholder="Nome ou telefone"
                        value={customerSearch}
                        onChange={(event) => setCustomerSearch(event.target.value)}
                      />
                      <div className="grid gap-3">
                        {filteredCustomers.map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => applyCustomer(customer)}
                            className="rounded-[20px] border border-[#e8e1d6] bg-white p-4 text-left transition hover:bg-[#fcfbf8]"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="font-semibold text-brand-bark">{customer.name}</p>
                                <p className="mt-1 text-sm text-[#8d8a84]">{customer.phone}</p>
                              </div>
                              {customer.lastOrderLabel ? (
                                <span className="rounded-full bg-[#efe9fe] px-3 py-1 text-xs font-semibold text-[#7B5CE6]">
                                  {customer.lastOrderLabel}
                                </span>
                              ) : null}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-3">
                      <Input
                        label="Nome do cliente *"
                        placeholder="Nome do cliente"
                        value={customerName}
                        onChange={(event) => setCustomerName(event.target.value)}
                      />
                      <Input
                        label="Telefone *"
                        placeholder="Telefone"
                        value={customerPhone}
                        onChange={(event) => setCustomerPhone(event.target.value)}
                      />
                      <Input
                        label="CPF"
                        placeholder="Opcional"
                        value={customerCpf}
                        onChange={(event) => setCustomerCpf(event.target.value)}
                      />
                    </div>
                  )}
                </div>

                <label className="flex flex-col gap-2 text-sm font-medium text-brand-bark">
                  <span>Observações do cliente</span>
                  <textarea
                    className="min-h-[120px] rounded-[20px] border border-[#d7d7d1] bg-white px-4 py-3 text-sm text-brand-bark outline-none transition placeholder:text-[#9b9a94] focus:border-brand-sage"
                    placeholder="Ex: prefere WhatsApp, vai retirar na loja, quer incluir mensagem..."
                    value={customerNotes}
                    onChange={(event) => setCustomerNotes(event.target.value)}
                  />
                </label>
              </div>
            </Panel>
          ) : null}

          {activeStep === 'payment' ? (
            <Panel title="Etapa 3 · Pagamento" description="Ajuste o desconto, escolha a forma de pagamento e confira as observações finais da venda.">
              <div className="space-y-5">
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    label="Valor recebido"
                    value={paidAmountInput}
                    onChange={(event) => setPaidAmountInput(event.target.value)}
                    placeholder="0,00"
                  />
                  <div className="flex flex-col gap-2 text-sm font-medium text-brand-bark">
                    <span>Valor faltante</span>
                    <div className="flex h-12 items-center rounded-full border border-[#d7d7d1] bg-[#f4f4f1] px-4 text-sm font-semibold text-brand-bark">
                      {formatCurrency(remainingAmount)}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {view.paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPayment(method.id)}
                      className={`rounded-[18px] border px-4 py-4 text-left transition ${
                        selectedPayment === method.id ? 'border-[#7B5CE6] bg-[#f3efff]' : 'border-[#e8e1d6] bg-white hover:bg-[#fcfbf8]'
                      }`}
                    >
                      <p className="font-semibold text-brand-bark">{method.label}</p>
                      <p className="mt-1 text-xs text-[#8d8a84]">{method.helper}</p>
                    </button>
                  ))}
                </div>

                <label className="flex flex-col gap-2 text-sm font-medium text-brand-bark">
                  <span>Observações da venda</span>
                  <textarea
                    className="min-h-[140px] rounded-[20px] border border-[#d7d7d1] bg-white px-4 py-3 text-sm text-brand-bark outline-none transition placeholder:text-[#9b9a94] focus:border-brand-sage"
                    placeholder="Ex: entrega para hoje, separar no balcão, incluir cartão escrito à mão..."
                    value={orderNotes}
                    onChange={(event) => setOrderNotes(event.target.value)}
                  />
                </label>
              </div>
            </Panel>
          ) : null}
        </div>

        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <Panel title="Resumo do pedido" className="sticky top-6 border-[#e4ddf6]">
            <div className="space-y-4">
              <div className="rounded-[20px] border border-[#ece6db] bg-[#fcfbf8] p-4">
                <p className="text-sm font-semibold text-brand-bark">Cliente</p>
                <p className="mt-3 text-sm font-semibold text-brand-bark">{customerName || 'Nenhum cliente selecionado'}</p>
                <p className="mt-1 text-sm text-[#8d8a84]">{customerPhone || 'Telefone pendente'}</p>
              </div>

              <div className="rounded-[20px] border border-[#ece6db] bg-white p-4">
                <p className="text-sm font-semibold text-brand-bark">Itens no pedido</p>
                <div className="mt-3 space-y-3">
                  {cartPricing.length ? (
                    cartPricing.map((item) => (
                      <div key={item.product.id} className="rounded-[18px] bg-[#faf8f4] p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-brand-bark">{item.quantity}x {item.product.name}</p>
                            <p className="mt-1 text-xs text-[#8d8a84]">{item.product.categoryName}</p>
                          </div>
                          <p className="text-sm font-semibold text-brand-bark">{formatCurrency(item.lineTotal)}</p>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 rounded-[16px] border border-[#e8e1d6] bg-white p-3">
                          <div className="flex items-center gap-2">
                            <QuantityButton onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}>-</QuantityButton>
                            <span className="min-w-[24px] text-center text-sm font-semibold text-brand-bark">{item.quantity}</span>
                            <QuantityButton onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}>+</QuantityButton>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openItemDiscountModal(item.product.id)}
                            className="gap-2 border-[#cae6cc] text-[#2f7d32] hover:bg-[#edf8ee]"
                          >
                            <BadgePercent className="h-4 w-4" />
                            Aplicar desconto
                          </Button>
                          <p className="text-xs font-semibold text-[#8d8a84]">
                            {item.lineDiscount > 0 ? `- ${formatCurrency(item.lineDiscount)}` : 'Sem desconto'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#8d8a84]">Nenhum item adicionado.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[20px] border border-[#ece6db] bg-white p-4">
                <div className="flex items-center justify-between text-sm text-[#716f69]">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-[#716f69]">
                  <span>Descontos nos itens</span>
                  <span>- {formatCurrency(itemsDiscountTotal)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-[#716f69]">
                  <span>Desconto geral</span>
                  <span>- {formatCurrency(orderDiscountAmount)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[28px] font-bold text-[#4a9a4c]">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 rounded-[16px] border border-[#e8e1d6] bg-[#fcfbf8] p-3">
                  <div>
                    <p className="text-sm font-semibold text-brand-bark">Desconto geral</p>
                    <p className="mt-1 text-xs text-[#8d8a84]">
                      {orderDiscountAmount > 0
                        ? `${discountMode === 'percent' ? `${orderDiscountValue}%` : formatCurrency(orderDiscountValue)} aplicado`
                        : 'Não aplicado'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openOrderDiscountModal}
                    className="gap-2 border-[#cae6cc] text-[#2f7d32] hover:bg-[#edf8ee]"
                  >
                    <BadgePercent className="h-4 w-4" />
                    Aplicar desconto
                  </Button>
                </div>
              </div>

              <div className="rounded-[20px] border border-[#ece6db] bg-white p-4">
                <p className="text-sm font-semibold text-brand-bark">Pagamento rápido</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {view.paymentMethods.slice(0, 3).map((method) => (
                    <div
                      key={method.id}
                      className={`rounded-[14px] px-3 py-3 text-center text-sm font-semibold ${
                        selectedPayment === method.id ? 'bg-[#f3efff] text-[#7B5CE6]' : 'bg-[#f5f2ea] text-brand-bark'
                      }`}
                    >
                      {method.label.replace('Cartão de ', '')}
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-1 text-sm text-[#716f69]">
                  <div className="flex items-center justify-between">
                    <span>Recebido</span>
                    <span>{formatCurrency(paidAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Falta receber</span>
                    <span>{formatCurrency(remainingAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-[#2f7d32]">
                    <span>Troco</span>
                    <span>{formatCurrency(changeAmount)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePrimaryAction}
                className={`w-full rounded-[18px] px-5 py-4 text-base font-bold transition ${
                  (activeStep === 'product' && productStepComplete) ||
                  (activeStep === 'customer' && customerStepComplete) ||
                  activeStep === 'payment'
                    ? 'bg-[#4a9a4c] text-white hover:bg-[#418a43]'
                    : 'bg-[#ece7dc] text-[#8d8a84]'
                }`}
              >
                {activeStep === 'product' ? 'Ir para cliente' : activeStep === 'customer' ? 'Ir para pagamento' : 'Fechar venda'}
              </button>

              <div className="flex items-center justify-between text-sm text-[#8d8a84]">
                <span>Carrinhos retidos: 3</span>
                <button type="button" onClick={clearSale} className="font-semibold text-[#7B5CE6]">
                  Limpar venda
                </button>
              </div>
            </div>
          </Panel>
        </aside>
      </div>

      <Modal
        isOpen={Boolean(itemDiscountTarget)}
        onClose={closeItemDiscountModal}
        title="Aplicar desconto no item"
        description="Escolha desconto em reais ou percentual e confira o valor final antes de aplicar."
        action={
          <Button onClick={applyItemDiscountDraft}>Aplicar desconto</Button>
        }
      >
        <div className="grid gap-5">
          <div className="grid gap-3 md:grid-cols-[auto_auto_minmax(0,1fr)]">
            <DiscountModeButton
              active={itemDiscountDraftMode === 'fixed'}
              label="R$"
              onClick={() => setItemDiscountDraftMode('fixed')}
            />
            <DiscountModeButton
              active={itemDiscountDraftMode === 'percent'}
              label="%"
              onClick={() => setItemDiscountDraftMode('percent')}
            />
            <input
              className="h-12 rounded-full border border-[#d7d7d1] bg-[#f4f4f1] px-4 text-sm text-brand-bark outline-none transition placeholder:text-[#9b9a94] focus:border-brand-sage focus:bg-white"
              value={itemDiscountDraftValue}
              onChange={(event) => setItemDiscountDraftValue(event.target.value)}
              placeholder={itemDiscountDraftMode === 'fixed' ? '0,00' : '0'}
            />
          </div>
          <div className="grid gap-3 rounded-[22px] bg-[#f8faf8] p-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[#8d8a84]">Valor original</p>
              <p className="mt-2 text-2xl font-bold text-brand-bark">{formatCurrency(itemDiscountBase)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[#8d8a84]">Valor final</p>
              <p className="mt-2 text-2xl font-bold text-[#4a9a4c]">{formatCurrency(itemFinalPreview)}</p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isOrderDiscountModalOpen}
        onClose={closeOrderDiscountModal}
        title="Aplicar desconto no total"
        description="Escolha desconto em reais ou percentual sobre o total atual do pedido."
        action={
          <Button onClick={applyOrderDiscountDraft}>Aplicar desconto</Button>
        }
      >
        <div className="grid gap-5">
          <div className="grid gap-3 md:grid-cols-[auto_auto_minmax(0,1fr)]">
            <DiscountModeButton
              active={orderDiscountDraftMode === 'fixed'}
              label="R$"
              onClick={() => setOrderDiscountDraftMode('fixed')}
            />
            <DiscountModeButton
              active={orderDiscountDraftMode === 'percent'}
              label="%"
              onClick={() => setOrderDiscountDraftMode('percent')}
            />
            <input
              className="h-12 rounded-full border border-[#d7d7d1] bg-[#f4f4f1] px-4 text-sm text-brand-bark outline-none transition placeholder:text-[#9b9a94] focus:border-brand-sage focus:bg-white"
              value={orderDiscountDraftValue}
              onChange={(event) => setOrderDiscountDraftValue(event.target.value)}
              placeholder={orderDiscountDraftMode === 'fixed' ? '0,00' : '0'}
            />
          </div>
          <div className="grid gap-3 rounded-[22px] bg-[#f8faf8] p-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[#8d8a84]">Valor original</p>
              <p className="mt-2 text-2xl font-bold text-brand-bark">{formatCurrency(subtotalAfterItemsDiscount)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[#8d8a84]">Valor final</p>
              <p className="mt-2 text-2xl font-bold text-[#4a9a4c]">{formatCurrency(orderFinalPreview)}</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
