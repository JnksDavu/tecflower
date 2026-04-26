import type { FinanceSummaryCard } from '@/models/types';
import { formatCurrency } from '@/utils/formatters';

const toneClassMap = {
  neutral: 'text-brand-bark',
  positive: 'text-[#2d9b52]',
  negative: 'text-[#d95a2f]',
};

interface MetricCardProps {
  item: FinanceSummaryCard;
}

export const MetricCard = ({ item }: MetricCardProps) => {
  return (
    <div className="min-h-[148px] rounded-none border border-[#ded9d1] bg-white px-4 py-3">
      <p className="text-[14px] font-semibold text-[#6f6c66]">{item.title}</p>
      <p className={`mt-2 text-[27px] font-bold tracking-[0.06em] ${toneClassMap[item.tone]}`}>{formatCurrency(item.value)}</p>
      <p className="mt-1 text-sm text-[#8e8a82]">{item.caption}</p>
    </div>
  );
};
