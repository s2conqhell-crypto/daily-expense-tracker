'use client';
import { useState, useEffect, useRef, memo } from 'react';
import { Search, X } from 'lucide-react';

interface UniversalSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  autoFocus?: boolean;
  className?: string;
}

export const UniversalSearchBar = memo(function UniversalSearchBar({
  value: externalValue,
  onChange,
  placeholder = 'Search transactions...',
  debounceMs = 300,
  autoFocus = false,
  className = '',
}: UniversalSearchBarProps) {
  const [localValue, setLocalValue] = useState(externalValue);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setLocalValue(externalValue);
  }, [externalValue]);

  useEffect(() => {
    if (debounceMs <= 0) {
      onChange(localValue);
      return;
    }
    const timer = setTimeout(() => {
      if (localValue !== externalValue) onChange(localValue);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange, externalValue]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#6b7b8d] pointer-events-none" aria-hidden="true" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        role="searchbox"
        aria-label={placeholder}
        className="w-full h-[56px] rounded-[18px] bg-[#161a27] border border-white/[0.06] pl-[44px] pr-12 text-[16px] text-white placeholder:text-[#6b7b8d] outline-none focus:border-[#7c5cff]/50 focus:bg-[#1a1e2e] transition-all duration-200"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-[#6b7b8d] hover:text-white hover:bg-white/5 rounded-xl transition-all"
          aria-label="Clear search"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      )}
    </div>
  );
});
