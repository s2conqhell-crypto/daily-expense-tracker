'use client';

import { cn } from '@/utils/helpers';

interface FormSwitchProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function FormSwitch({ id, checked, onChange, label, description, disabled }: FormSwitchProps) {
  return (
    <div className={cn(
      'rounded-[16px] border border-white/[0.08] bg-[#1E2235]/50 p-4 transition-all duration-200',
      'hover:border-white/[0.12]',
      disabled && 'opacity-50',
    )}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <label htmlFor={id} className="block text-[14px] font-medium text-white cursor-pointer leading-snug">{label}</label>
          {description && <p className="text-[12px] text-white/40 mt-0.5 leading-relaxed">{description}</p>}
        </div>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => { if (!disabled) onChange(!checked); }}
          className={cn(
            'relative inline-flex h-[26px] w-[50px] shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5cff]/40',
            checked ? 'bg-[#7c5cff]' : 'bg-white/10'
          )}
        >
          <span
            className={cn(
              'pointer-events-none block h-[22px] w-[22px] rounded-full bg-white shadow-lg ring-0 transition-transform duration-200',
              checked ? 'translate-x-[24px]' : 'translate-x-0'
            )}
          />
        </button>
      </div>
    </div>
  );
}
