import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { PageHeader } from '@/components/PageHeader';
import { Panel } from '@/components/Panel';
import { saleController } from '@/controllers/saleController';
import { storeStatus } from '@/mocks/data';
import type { SalesView } from '@/models/types';
import { formatCurrency } from '@/utils/formatters';

export const SalesPage = () => {
  const [view, setView] = useState<SalesView | null>(null);

  useEffect(() => {
    saleController.getView().then(setView);
  }, []);

  if (!view) {
    return null;
  }

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Vendas"
        titleColor="text-[#4a9a4c]"
        action={
          <span className="inline-flex h-10 items-center gap-2 rounded-full bg-[#fce9a8] px-5 text-sm font-medium text-[#a8781c]">
            <span className="h-2 w-2 rounded-full bg-[#f1b62d]" />
            {storeStatus}
          </span>
        }
      />

      <section className="mt-4 grid grid-cols-[1.6fr_1fr] gap-4">
        <div className="space-y-3">
          <Panel title="Fluxo rapido de venda" className="border-[#f6d6df]">
            <div className="space-y-3">
              <div className="text-[15px] font-semibold text-brand-bark">Buscar produto</div>
              <Input placeholder="Ex: Buque Primavera, Rosa avulsa, Vaso" />
              <div className="flex gap-3">
                <Button className="min-w-[170px]">+ Adicionar item</Button>
                <Button variant="secondary" className="min-w-[156px]">+ Venda rapida</Button>
              </div>
            </div>
          </Panel>

          <section>
            <h2 className="text-[17px] font-bold text-[#4a9a4c]">Produtos populares</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {view.popularProducts.map((product) => (
                <button
                  key={product.id}
                  className="flex h-10 items-center justify-center rounded-full bg-[#efefec] px-4 text-[15px] font-semibold text-brand-bark"
                >
                  + {product.name} - {formatCurrency(product.price)}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-3">
          <Panel title="Pedido atual" className="border-[#dceccf]">
            <div className="space-y-1 text-[15px] text-[#66645f]">
              {view.cartItems.map((item) => (
                <p key={item.id}>
                  {item.quantity}x {item.name}
                </p>
              ))}
            </div>
            <p className="mt-4 text-[18px] font-bold text-[#d24f83]">Total: {formatCurrency(view.total)}</p>
            <Button className="mt-4 w-full">+ Fechar venda</Button>
          </Panel>

          <Panel title="Cliente" className="border-[#f6d6df]">
            <div className="space-y-3">
              <Input placeholder="Nome ou telefone" defaultValue={view.customerName} />
              <Input placeholder="CPF (opcional)" defaultValue={view.customerCpf} />
            </div>
          </Panel>

          <Panel title="Pagamento" className="border-[#f8e2ad]">
            <div className="space-y-3 text-[15px] text-[#6b6a64]">
              {['PIX', 'Cartao de credito', 'Dinheiro'].map((method) => (
                <label key={method} className="flex items-center gap-3">
                  <input type="radio" name="payment" defaultChecked={method === view.selectedPayment} className="h-4 w-4 accent-brand-bark" />
                  <span>{method}{method === 'PIX' ? ' (aprovado em segundos)' : ''}</span>
                </label>
              ))}
              <Input defaultValue={formatCurrency(view.paidAmount)} />
            </div>
          </Panel>

          <div className="rounded-none bg-[#e3eee2] px-5 py-4 text-[#36714b]">
            <p className="text-[17px] font-bold">✓ {view.statusTitle}</p>
            <p className="mt-2 text-[15px]">{view.statusMessage}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
