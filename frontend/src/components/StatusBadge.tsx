import type { ProductStatus } from '@/models/types';

const toneMap: Record<ProductStatus, string> = {
  'Em estoque': 'bg-[#dff1dd] text-[#51814d]',
  'Estoque baixo': 'bg-[#f6e3a6] text-[#b77b10]',
  'Sem estoque': 'bg-[#f6d9e4] text-[#c45b7d]',
};

interface StatusBadgeProps {
  status: ProductStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneMap[status]}`}>{status}</span>;
};
