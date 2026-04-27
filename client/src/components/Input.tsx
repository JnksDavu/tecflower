import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ label, className = '', ...props }: InputProps) => {
  return (
    <label className="flex w-full flex-col gap-2 text-sm font-medium text-brand-bark">
      {label ? <span>{label}</span> : null}
      <input
        className={`h-12 rounded-full border border-[#d7d7d1] bg-[#f4f4f1] px-4 text-sm text-brand-bark outline-none transition placeholder:text-[#9b9a94] focus:border-brand-sage focus:bg-white ${className}`}
        {...props}
      />
    </label>
  );
};
