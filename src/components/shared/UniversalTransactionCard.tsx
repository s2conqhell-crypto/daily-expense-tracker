'use client';
import { memo, type ReactNode } from 'react';
import { TransactionActionMenu, type ActionMenuItem } from './TransactionActionMenu';
import { formatCurrency } from '@/utils/format';

interface UniversalTransactionCardProps {
  icon: ReactNode;
  iconColor?: string;
  title: string;
  subtitle?: string;
  date?: string;
  amount: number;
  isIncome?: boolean;
  currency?: string;
  actions?: ActionMenuItem[];
  className?: string;
  onClick?: () => void;
}

export const UniversalTransactionCard = memo(function UniversalTransactionCard({
  icon,
  iconColor = '#7c5cff',
  title,
  subtitle,
  date,
  amount,
  isIncome = false,
  currency,
  actions,
  className = '',
  onClick,
}: UniversalTransactionCardProps) {
  return (
    <div
      className={`bg-[#161a27] rounded-[16px] border border-white/[0.06] p-4 ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <span style={{ color: iconColor }} className="h-[18px] w-[18px] flex items-center justify-center">
            {icon}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-white truncate">{title}</p>
          {subtitle && (
            <p className="text-[12px] text-[#6b7b8d] truncate mt-0.5">{subtitle}</p>
          )}
          {date && (
            <p className="text-[11px] text-[#5a6b7d] mt-0.5">{date}</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className={`text-[15px] font-bold whitespace-nowrap tabular-nums ${
            isIncome ? 'text-[#00d09c]' : 'text-[#ff5a7a]'
          }`}>
            {isIncome ? '+' : '-'}{formatCurrency(amount, currency)}
          </span>

          {actions && actions.length > 0 && (
            <div className="-mr-2">
              <TransactionActionMenu actions={actions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
