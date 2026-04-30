import type { SelectHTMLAttributes } from 'react';

interface SelectFieldProps {
  label: string;
  value: string;
  options?: Array<{
    label: string;
    value: string;
  }>;
  onChange?: SelectHTMLAttributes<HTMLSelectElement>['onChange'];
}

export const SelectField = ({ label, value, options = [], onChange }: SelectFieldProps) => {
  return (
    <label className="flex min-w-[160px] flex-col gap-2 text-sm font-medium text-brand-bark">
      <span>{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="h-12 w-full appearance-none rounded-full border border-[#d7d7d1] bg-[#f4f4f1] px-4 pr-10 text-sm text-[#7e7b75] outline-none transition focus:border-brand-sage focus:bg-white"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 20 20"
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a3a099]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="m5 8 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </label>
  );
};
