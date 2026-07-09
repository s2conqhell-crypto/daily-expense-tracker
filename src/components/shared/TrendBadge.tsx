'use client';

import { cn } from '@/utils/helpers';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendBadgeProps {
  value: number;
  inverse?: boolean;
  className?: string;
  showLabel?: boolean;
}

export function TrendBadge({ value, inverse = false, className, showLabel = true }: TrendBadgeProps) {
  const isUp = inverse ? value < 0 : value > 0;
  const isDown = inverse ? value > 0 : value < 0;
  const isNeutral = value === 0;

  if (isNeutral) {
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs font-medium text-muted-foreground', className)}>
        <Minus className="h-3 w-3" />
        {showLabel && '0%'}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium rounded-full px-1.5 py-0.5',
        isUp && 'text-emerald-500 bg-emerald-500/10',
        isDown && 'text-rose-500 bg-rose-500/10',
        className
      )}
    >
      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {showLabel && `${Math.abs(value).toFixed(1)}%`}
    </span>
  );
}
