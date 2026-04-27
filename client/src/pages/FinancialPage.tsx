import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { PageHeader } from '@/components/PageHeader';
import { Panel } from '@/components/Panel';
import { financialController } from '@/controllers/financialController';
import type { FinanceEntry, FinancePaymentMethod, FinanceSummaryCard } from '@/models/types';
import { formatCurrency } from '@/utils/formatters';

const paymentToneMap = {
  sand: 'bg-[#faf1e5]',
  sage: 'bg-[#eef3e7]',
  blue: 'bg-[#ebeffc]',
  lilac: 'bg-[#f3eaf7]',
};

export const FinancialPage = () => {
  const [summary, setSummary] = useState<FinanceSummaryCard[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<FinancePaymentMethod[]>([]);
  const [entries, setEntries] = useState<FinanceEntry[]>([]);

  useEffect(() => {
    financialController.getSummary().then(setSummary);
    financialController.getPaymentMethods().then(setPaymentMethods);
    financialController.list().then(setEntries);
  }, []);

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Financeiro"
        titleColor="text-[#7B5CE6]"
        action={<span className="inline-flex h-10 items-center rounded-full bg-[#e4f2e2] px-5 text-sm font-semibold text-[#4a9a4c]">Hoje</span>}
      />

      <section className="mt-4 grid grid-cols-3 gap-3">
        {summary.map((item) => (
          <MetricCard key={item.id} item={item} />
        ))}
      </section>

      <section className="mt-4 grid grid-cols-[272px_1fr] gap-3">
        <Panel title="Formas de Pagamento" className="min-h-[506px]">
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className={`flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-semibold text-brand-bark ${paymentToneMap[method.tone]}`}>
                <span>{method.label}</span>
                <span>{formatCurrency(method.amount)}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Lancamentos do Dia"
          description="Tabela rapida para conferencia de caixa"
          className="min-h-[506px]"
        >
          <div className="overflow-hidden rounded-xl border border-[#f0ece5]">
            <div className="grid grid-cols-[120px_1fr_140px] bg-[#f8f2ea] px-5 py-3 text-sm font-semibold text-[#9b7b57]">
              <span>Horario</span>
              <span>Descricao</span>
              <span className="text-right">Valor</span>
            </div>
            {entries.map((entry) => (
              <div key={entry.id} className="grid grid-cols-[120px_1fr_140px] border-t border-[#efeae1] px-5 py-4 text-[15px] text-brand-bark">
                <span>{entry.time}</span>
                <span>{entry.description}</span>
                <span className={`text-right font-semibold ${entry.type === 'entrada' ? 'text-[#7B5CE6]' : 'text-[#4a9a4c]'}`}>
                  {entry.type === 'entrada' ? '+' : '-'} {formatCurrency(entry.amount)}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
};
