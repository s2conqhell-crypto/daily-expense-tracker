'use client';
import { memo, ReactNode } from 'react';
import { MobileAmountDisplay } from './MobileAmountDisplay';

interface MobileStatCardProps {
  icon?: ReactNode;
  iconColor?: string;
  label: string;
  value: number | string;
  currency?: string;
  isCurrency?: boolean;
  suffix?: string;
  trend?: { value: number; isUp: boolean };
  loading?: boolean;
  onClick?: () => void;
}

export const MobileStatCard = memo(function MobileStatCard({
  icon, iconColor = '#7c5cff', label, value, currency,
  isCurrency, suffix, trend, loading, onClick,
}: MobileStatCardProps) {
  return (
    <div
      className={`m-stat-card ${onClick ? 'cursor-pointer active:scale-[0.98] transition-all' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between mb-1.5">
        {icon && (
          <div className="m-icon-container" style={{ backgroundColor: iconColor + '15' }}>
            {icon}
          </div>
        )}
        {trend !== undefined && (
          <span className={`m-text-tiny font-semibold ${trend.isUp ? 'text-[#00d09c]' : 'text-[#ff5a7a]'}`}>
            {trend.isUp ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      {loading ? (
        <div className="h-6 w-20 bg-white/5 rounded animate-pulse mt-1" />
      ) : (
        <p className="m-text-amount-lg text-white mt-0.5">
          {isCurrency ? <MobileAmountDisplay value={Number(value)} currency={currency} /> : value}
          {suffix && <span className="m-text-caption text-[#6b7b8d] ml-0.5">{suffix}</span>}
        </p>
      )}
      <p className="m-text-tiny text-[#6b7b8d] mt-0.5">{label}</p>
    </div>
  );
});
