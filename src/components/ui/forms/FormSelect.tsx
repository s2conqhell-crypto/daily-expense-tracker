'use client';

import { cn } from '@/utils/helpers';
import { ValidationMessage } from './ValidationMessage';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';

interface FormSelectProps {
  id?: string;
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function FormSelect({ id, label, value, onValueChange, options, placeholder = 'Select...', error, required, className }: FormSelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-[13px] font-semibold text-white/80 mb-1.5 px-0.5">
          {label}
          {required && <span className="text-[#FF5A6E] ml-0.5">*</span>}
        </label>
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          className={cn(
            'flex h-[52px] w-full rounded-[16px] border px-4 text-[15px] text-white transition-all duration-200 bg-[#1E2235]/80',
            'focus:outline-none focus:ring-2 focus:ring-[#7c5cff]/40 focus:border-[#7c5cff]/60',
            error ? 'border-[#FF5A6E]/60' : 'border-white/[0.08] hover:border-white/[0.15]',
            'data-[state=open]:border-[#7c5cff]/60',
            className
          )}
          aria-invalid={!!error}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-[#1E2235] border border-white/[0.08] rounded-[16px] shadow-2xl shadow-black/40">
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="text-[14px] text-white/80 py-3 px-4 focus:bg-white/5 focus:text-white data-[highlighted]:bg-white/5 data-[state=checked]:text-[#7c5cff] cursor-pointer"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <ValidationMessage message={error} show />}
    </div>
  );
}
