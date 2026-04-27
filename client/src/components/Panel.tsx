import type { PropsWithChildren, ReactNode } from 'react';

interface PanelProps {
  title?: string;
  description?: string;
  className?: string;
  action?: ReactNode;
}

export const Panel = ({ title, description, className = '', action, children }: PropsWithChildren<PanelProps>) => {
  return (
    <section className={`rounded-[18px] border border-[#e6e2da] bg-white p-4 ${className}`}>
      {title || description || action ? (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title ? <h2 className="text-[17px] font-bold text-brand-bark">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-[#8e8a82]">{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
};
