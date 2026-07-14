import * as React from 'react';
import { cn } from '@/utils/helpers';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-[56px] w-full rounded-[16px] border border-white/[0.08] bg-[#1E2235]/80 px-4 py-2 text-[16px] text-white placeholder:text-white/25 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5cff]/40 focus-visible:border-[#7c5cff]/60 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-white/[0.15]',
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export { Input };
