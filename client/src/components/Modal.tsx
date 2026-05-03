import type { PropsWithChildren, ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  action?: ReactNode;
  onClose: () => void;
  size?: 'md' | 'lg' | 'xl';
}

const sizeMap = {
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

export const Modal = ({
  isOpen,
  title,
  description,
  action,
  onClose,
  size = 'lg',
  children,
}: PropsWithChildren<ModalProps>) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f2434]/45 px-4 py-8 backdrop-blur-[2px]">
      <div className={`w-full ${sizeMap[size]} rounded-[28px] bg-white p-6 shadow-[0_32px_90px_rgba(35,20,48,0.24)]`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[28px] font-bold text-brand-bark">{title}</h2>
            {description ? <p className="mt-2 text-sm text-[#8e8a82]">{description}</p> : null}
          </div>
          <div className="flex items-center gap-3">
            {action}
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e3ddd3] text-[#7f786f] transition hover:bg-[#faf7f2]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
                <path d="M7 7l10 10M17 7 7 17" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
};
