'use client';
import { memo, ReactNode } from 'react';
import { MobileActionMenu, ActionItem } from './MobileActionMenu';
import { MobileAmountDisplay } from './MobileAmountDisplay';
import { MobileBadge } from './MobileBadge';
import { MobileStatusChip } from './MobileStatusChip';

export interface MobileCardProps {
  icon?: ReactNode;
  iconColor?: string;
  title: string;
  subtitle?: string;
  subtitleIcon?: ReactNode;
  amount?: number;
  amountColor?: 'success' | 'danger' | 'warning' | 'default';
  amountPrefix?: string;
  currency?: string;
  badge?: { label: string; variant?: 'default' | 'success' | 'danger' | 'warning' | 'primary' };
  status?: { label: string; variant: 'active' | 'paused' | 'completed' | 'expired' | 'upcoming' | 'cancelled' };
  nextDate?: string;
  nextDateLabel?: string;
  progress?: { current: number; max: number; color?: string };
  tags?: string[];
  metadata?: { label: string; value: string; valueColor?: string }[];
  actions?: ActionItem[];
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export const MobileCard = memo(function MobileCard({
  icon, iconColor, title, subtitle, subtitleIcon,
  amount, amountColor = 'default', amountPrefix = '', currency,
  badge, status, nextDate, nextDateLabel,
  progress, tags, metadata,
  actions, onClick, className = '', children,
}: MobileCardProps) {
  const amountClass = amountColor === 'success' ? 'text-[#00d09c]'
    : amountColor === 'danger' ? 'text-[#ff5a7a]'
    : amountColor === 'warning' ? 'text-[#ffb020]'
    : 'text-white';

  return (
    <div
      className={`m-card ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {icon && (
            <div
              className="m-icon-container-md shrink-0"
              style={{ backgroundColor: (iconColor || '#7c5cff') + '15' }}
            >
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="m-text-body-bold text-white truncate">{title}</span>
              {badge && <MobileBadge {...badge} />}
              {status && <MobileStatusChip {...status} />}
            </div>
            {subtitle && (
              <div className="flex items-center gap-1 mt-0.5">
                {subtitleIcon && <span className="shrink-0">{subtitleIcon}</span>}
                <span className="m-text-caption text-[#6b7b8d] truncate">{subtitle}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {amount !== undefined && (
            <span className={`m-text-amount whitespace-nowrap ${amountClass}`}>
              {amountPrefix}
              <MobileAmountDisplay value={amount} currency={currency} />
            </span>
          )}
          {actions && actions.length > 0 && (
            <MobileActionMenu actions={actions} />
          )}
        </div>
      </div>

      {nextDate && (
        <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-white/[0.06]">
          <span className="m-text-tiny text-[#6b7b8d]">{nextDateLabel || 'Next'}:</span>
          <span className="m-text-tiny text-white font-medium">{nextDate}</span>
        </div>
      )}

      {progress && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="m-text-tiny text-[#6b7b8d]">
              {progress.current} / {progress.max}
            </span>
            <span className="m-text-tiny text-white font-medium">
              {progress.max > 0 ? ((progress.current / progress.max) * 100).toFixed(0) : 0}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress.max > 0 ? Math.min((progress.current / progress.max) * 100, 100) : 0}%`,
                backgroundColor: progress.color || '#7c5cff',
              }}
            />
          </div>
        </div>
      )}

      {tags && tags.length > 0 && (
        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
          {tags.map((tag) => (
            <span key={tag} className="m-text-tiny px-2 py-0.5 rounded-full bg-white/5 text-[#6b7b8d]">
              {tag}
            </span>
          ))}
        </div>
      )}

      {metadata && metadata.length > 0 && (
        <div className="mt-2.5 space-y-1">
          {metadata.map((m) => (
            <div key={m.label} className="flex items-center justify-between">
              <span className="m-text-tiny text-[#6b7b8d]">{m.label}</span>
              <span className={`m-text-tiny font-medium ${m.valueColor || 'text-white'}`}>{m.value}</span>
            </div>
          ))}
        </div>
      )}

      {children}
    </div>
  );
});
