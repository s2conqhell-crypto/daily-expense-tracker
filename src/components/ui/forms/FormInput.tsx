'use client';

import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers';
import { ValidationMessage } from './ValidationMessage';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  charCount?: { current: number; max: number };
  hideCharUntilTyping?: boolean;
  leftIcon?: React.ReactNode;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, label, error, helperText, charCount, hideCharUntilTyping = true, leftIcon, id, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-[13px] font-semibold text-white/80 mb-1.5 px-0.5">
            {label}
            {props.required && <span className="text-[#FF5A6E] ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={cn(
              'flex h-[56px] w-full rounded-[16px] border px-4 py-3 text-[16px] sm:text-[15px] text-white placeholder:text-white/25 transition-all duration-200 bg-[#1E2235]/80',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5cff]/40 focus-visible:border-[#7c5cff]/60',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error ? 'border-[#FF5A6E]/60' : 'border-white/[0.08] hover:border-white/[0.15]',
              leftIcon && 'pl-12',
              className
            )}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            {...props}
          />
          {focused && !error && (
            <motion.div
              layoutId={`focus-${id}`}
              className="absolute inset-0 rounded-[16px] ring-2 ring-[#7c5cff]/20 pointer-events-none"
              transition={{ duration: 0.15 }}
            />
          )}
        </div>
        <div className="flex items-center justify-between min-h-[20px]">
          <div className="flex-1">
            {error && <ValidationMessage message={error} show />}
            {!error && helperText && <p className="text-[11px] text-white/30 mt-1">{helperText}</p>}
          </div>
          {charCount && (!hideCharUntilTyping || charCount.current > 0) && (
            <span className={cn('text-[11px] shrink-0 ml-2 mt-1', charCount.current > charCount.max ? 'text-[#FF5A6E]' : 'text-white/30')}>
              {charCount.current}/{charCount.max}
            </span>
          )}
        </div>
      </div>
    );
  }
);
FormInput.displayName = 'FormInput';
