'use client';

import { cn } from '@/utils/helpers';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function ToggleSwitch({ checked, onChange, id, label, description, disabled }: ToggleSwitchProps) {
  return (
    <div className={cn('flex items-center justify-between gap-3', disabled && 'opacity-50')}>
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && <label htmlFor={id} className="text-sm font-medium text-foreground cursor-pointer">{label}</label>}
          {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
        </div>
      )}
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => { if (!disabled) onChange(!checked); }}
        className={cn(
          'relative inline-flex h-[24px] w-[44px] shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer',
          checked ? 'bg-[#7c5cff]' : 'bg-white/10'
        )}
      >
        <span
          className={cn(
            'pointer-events-none block h-[20px] w-[20px] rounded-full bg-white shadow-md ring-0 transition-transform duration-200',
            checked ? 'translate-x-[20px]' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}
