import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  titleColor?: string;
  action?: ReactNode;
}

export const PageHeader = ({ title, description, titleColor = 'text-brand-bark', action }: PageHeaderProps) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className={`text-[44px] font-bold leading-none tracking-[0.02em] ${titleColor}`}>{title}</h1>
        <p className="mt-2 text-[15px] text-[#8e8a82]">{description}</p>
      </div>
      {action}
    </div>
  );
};
