'use client';
import { memo } from 'react';

interface MobileBadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'primary';
}

const variants = {
  default: 'bg-white/5 text-[#6b7b8d]',
  success: 'bg-[#00d09c]/15 text-[#00d09c]',
  danger: 'bg-[#ff5a7a]/15 text-[#ff5a7a]',
  warning: 'bg-[#ffb020]/15 text-[#ffb020]',
  primary: 'bg-[#7c5cff]/15 text-[#7c5cff]',
};

export const MobileBadge = memo(function MobileBadge({ label, variant = 'default' }: MobileBadgeProps) {
  return (
    <span className={`m-text-tiny px-2 py-0.5 rounded-full font-semibold ${variants[variant]}`}>
      {label}
    </span>
  );
});
