'use client';
import { memo } from 'react';

interface FilterChip {
  key: string;
  label: string;
}

interface UniversalFilterChipProps {
  chips: FilterChip[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export const UniversalFilterChip = memo(function UniversalFilterChip({
  chips,
  activeKey,
  onChange,
  className = '',
}: UniversalFilterChipProps) {
  return (
    <div className={`overflow-x-auto no-scrollbar scroll-smooth ${className}`}>
      <div className="flex items-center gap-3 w-max px-1">
        {chips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => onChange(chip.key)}
            className={`h-10 px-4 rounded-[16px] text-[13px] font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
              activeKey === chip.key
                ? 'bg-gradient-to-r from-[#7c5cff] to-[#6b47e6] text-white shadow-md shadow-[#7c5cff]/20'
                : 'bg-[#161a27] text-[#6b7b8d] border border-white/[0.06] hover:bg-white/5 hover:text-white'
            }`}
            aria-pressed={activeKey === chip.key}
            aria-label={`Filter by ${chip.label}`}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
});
