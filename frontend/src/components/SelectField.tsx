interface SelectFieldProps {
  label: string;
  value: string;
}

export const SelectField = ({ label, value }: SelectFieldProps) => {
  return (
    <label className="flex min-w-[160px] flex-col gap-2 text-sm font-medium text-brand-bark">
      <span>{label}</span>
      <div className="flex h-12 items-center justify-between rounded-full border border-[#d7d7d1] bg-[#f4f4f1] px-4 text-sm text-[#7e7b75]">
        <span>{value}</span>
        <svg viewBox="0 0 20 20" className="h-4 w-4 text-[#a3a099]" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m5 8 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </label>
  );
};
