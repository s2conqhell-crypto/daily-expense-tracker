'use client';
import { memo } from 'react';
import { Search, X } from 'lucide-react';

interface MobileSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const MobileSearchBar = memo(function MobileSearchBar({
  value, onChange, placeholder = 'Search...',
}: MobileSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#6b7b8d]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-[52px] rounded-[16px] bg-[#161a27] border border-white/[0.06] pl-[44px] pr-11 text-[16px] text-white placeholder:text-[#6b7b8d] outline-none focus:border-[#7c5cff]/50 transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-[#6b7b8d] hover:text-white transition-colors"
          aria-label="Clear search"
        >
          <X className="h-[16px] w-[16px]" />
        </button>
      )}
    </div>
  );
});
