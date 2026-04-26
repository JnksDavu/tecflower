import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md';
}

const variants = {
  primary: 'bg-[#ff8b08] text-white border border-[#ff8b08] hover:bg-[#ea7f09]',
  secondary: 'bg-[#efefec] text-brand-bark border border-[#deded9] hover:bg-[#e7e7e2]',
  outline: 'bg-white text-brand-bark border border-[#d9d6cf] hover:bg-[#f7f6f2]',
  ghost: 'bg-transparent text-brand-bark border border-transparent hover:bg-[#f5f2ea]',
};

const sizes = {
  sm: 'h-11 px-4 text-sm',
  md: 'h-12 px-6 text-[15px]',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: PropsWithChildren<ButtonProps>) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full font-semibold transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
