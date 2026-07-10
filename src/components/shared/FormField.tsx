'use client';

import { useId } from 'react';
import { cn } from '@/utils/helpers';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  charCount?: { current: number; max: number };
}

export function FormField({ label, htmlFor, error, required, children, className, charCount }: FormFieldProps) {
  const errorId = useId();
  const countId = useId();

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
        {charCount && (
          <span id={countId} className={`text-[10px] ${charCount.current > charCount.max ? 'text-destructive' : 'text-muted-foreground'}`}>
            {charCount.current}/{charCount.max}
          </span>
        )}
      </div>
      {children}
      {error && (
        <p id={errorId} role="alert" className="text-[11px] text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}
