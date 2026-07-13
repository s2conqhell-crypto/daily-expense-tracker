'use client';
import { memo } from 'react';

interface FilterChip {
  key: string;
  label: string;
}

interface MobileFilterBarProps {
  chips: FilterChip[];
  activeKey: string;
  onChange: (key: string) => void;
}

export const MobileFilterBar = memo(function MobileFilterBar({ chips, activeKey, onChange }: MobileFilterBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={() => onChange(chip.key)}
          className={`m-touch rounded-[16px] px-4 text-[13px] font-semibold whitespace-nowrap transition-all ${
            activeKey === chip.key
              ? 'bg-[#7c5cff] text-white'
              : 'bg-[#161a27] text-[#6b7b8d] border border-white/[0.06]'
          }`}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
});
