'use client';
import { memo } from 'react';

interface MobileStatusChipProps {
  label: string;
  variant: 'active' | 'paused' | 'completed' | 'expired' | 'upcoming' | 'cancelled';
}

const variants = {
  active: 'bg-[#00d09c]/15 text-[#00d09c]',
  paused: 'bg-[#ffb020]/15 text-[#ffb020]',
  completed: 'bg-[#7c5cff]/15 text-[#7c5cff]',
  expired: 'bg-[#ff5a7a]/15 text-[#ff5a7a]',
  upcoming: 'bg-[#3b82f6]/15 text-[#3b82f6]',
  cancelled: 'bg-white/5 text-[#6b7b8d]',
};

export const MobileStatusChip = memo(function MobileStatusChip({ label, variant }: MobileStatusChipProps) {
  return (
    <span className={`m-text-tiny px-2 py-0.5 rounded-full font-semibold ${variants[variant]}`}>
      {label}
    </span>
  );
});
