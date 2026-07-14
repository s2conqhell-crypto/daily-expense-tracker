'use client';

import { ValidationMessage } from './ValidationMessage';
import { BottomSheetPicker } from '@/components/shared/BottomSheetPicker';

interface FormSelectProps {
  id?: string;
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  searchable?: boolean;
}

export function FormSelect({ id, label, value, onValueChange, options, placeholder = 'Select...', error, required, searchable = false }: FormSelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-[13px] font-semibold text-white/80 mb-2 px-0.5">
          {label}
          {required && <span className="text-[#FF5A6E] ml-0.5">*</span>}
        </label>
      )}
      <BottomSheetPicker
        value={value}
        onValueChange={onValueChange}
        options={options}
        placeholder={placeholder}
        label={label}
        searchable={searchable}
      />
      {error && <ValidationMessage message={error} show />}
    </div>
  );
}
