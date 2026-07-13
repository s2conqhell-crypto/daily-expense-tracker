'use client';

import { forwardRef, useRef, useEffect } from 'react';
import { cn } from '@/utils/helpers';
import { ValidationMessage } from './ValidationMessage';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  charCount?: { current: number; max: number };
  hideCharUntilTyping?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, label, error, charCount, hideCharUntilTyping = true, id, ...props }, forwardedRef) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const resolvedRef = (forwardedRef || internalRef) as React.RefObject<HTMLTextAreaElement>;

    useEffect(() => {
      if (resolvedRef.current) {
        resolvedRef.current.style.height = 'auto';
        resolvedRef.current.style.height = Math.min(resolvedRef.current.scrollHeight, 160) + 'px';
      }
    }, [props.value, resolvedRef]);

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-[13px] font-semibold text-white/80 mb-1.5 px-0.5">
            {label}
          </label>
        )}
        <textarea
          id={id}
          ref={resolvedRef}
          className={cn(
            'flex w-full rounded-[16px] border px-4 py-3.5 text-[16px] text-white placeholder:text-white/25 transition-all duration-200 bg-[#1E2235]/80 resize-none min-h-[52px] leading-relaxed',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5cff]/40 focus-visible:border-[#7c5cff]/60',
            error ? 'border-[#FF5A6E]/60' : 'border-white/[0.08] hover:border-white/[0.15]',
            className
          )}
          aria-invalid={!!error}
          rows={2}
          {...props}
        />
        <div className="flex items-center justify-between min-h-[20px]">
          {error && <ValidationMessage message={error} show />}
          {charCount && (!hideCharUntilTyping || charCount.current > 0) && (
            <span className={cn('text-[11px] shrink-0 ml-auto', charCount.current > charCount.max ? 'text-[#FF5A6E]' : 'text-white/30')}>
              {charCount.current}/{charCount.max}
            </span>
          )}
        </div>
      </div>
    );
  }
);
FormTextarea.displayName = 'FormTextarea';
