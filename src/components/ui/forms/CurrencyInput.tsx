'use client';

import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers';
import { ValidationMessage } from './ValidationMessage';

interface CurrencyInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  currencySymbol?: string;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ id, label, value, onChange, error, required, placeholder = '0.00', autoFocus, currencySymbol = '₹' }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-[13px] font-semibold text-white/80 mb-2 px-0.5">
            {label}
            {required && <span className="text-[#FF5A6E] ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <div className={cn(
            'flex h-[56px] w-full rounded-[16px] border bg-[#1E2235]/80 transition-all duration-200 overflow-hidden',
            error ? 'border-[#FF5A6E]/60' : focused ? 'border-[#7c5cff]/60' : 'border-white/[0.08] hover:border-white/[0.15]',
          )}>
            <div className="flex items-center justify-center w-[56px] shrink-0 bg-white/[0.04] border-r border-white/[0.06]">
              <span className="text-[18px] font-bold text-white/60">{currencySymbol}</span>
            </div>
            <input
              id={id}
              ref={ref}
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              autoFocus={autoFocus}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1 h-full bg-transparent px-4 text-[20px] font-semibold text-white placeholder:text-white/15 focus-visible:outline-none leading-none tracking-tight"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
            />
          </div>
          {focused && !error && (
            <motion.div
              layoutId={`focus-${id}`}
              className="absolute inset-0 rounded-[16px] ring-2 ring-[#7c5cff]/20 pointer-events-none"
              transition={{ duration: 0.15 }}
            />
          )}
        </div>
        {error && <ValidationMessage message={error} show />}
      </div>
    );
  }
);
CurrencyInput.displayName = 'CurrencyInput';
