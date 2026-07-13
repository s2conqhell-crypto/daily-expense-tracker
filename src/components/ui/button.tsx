import * as React from 'react';
import { cn } from '@/utils/helpers';

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
  }
>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const variants: Record<string, string> = {
    default: 'bg-gradient-to-br from-[#7c5cff] to-[#6a4de6] text-white hover:from-[#8d72ff] hover:to-[#7c5cff] shadow-lg shadow-[#7c5cff]/20 active:shadow-inner',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-white/[0.08] bg-transparent text-white/70 hover:bg-white/5 hover:text-white',
    secondary: 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white',
    ghost: 'hover:bg-white/5 hover:text-white',
    link: 'text-[#7c5cff] underline-offset-4 hover:underline',
  };
  const sizes: Record<string, string> = {
    default: 'h-[52px] px-6 py-2 text-[16px] rounded-[16px]',
    sm: 'h-9 rounded-[12px] px-3 text-sm',
    lg: 'h-11 rounded-[14px] px-8',
    icon: 'h-10 w-10 rounded-[12px]',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap text-[15px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5cff]/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button };
