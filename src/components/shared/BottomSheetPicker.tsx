'use client';

import { useState, useMemo } from 'react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { cn } from '@/utils/helpers';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { Search, Check, X } from 'lucide-react';

interface BottomSheetPickerOption {
  value: string;
  label: string;
}

interface BottomSheetPickerProps {
  value: string;
  onValueChange: (value: string) => void;
  options: BottomSheetPickerOption[];
  placeholder?: string;
  label?: string;
  searchable?: boolean;
}

export function BottomSheetPicker({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  label,
  searchable = false,
}: BottomSheetPickerProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectedLabel = options.find((o) => o.value === value)?.label;

  const filtered = useMemo(() => {
    if (!searchQuery) return options;
    const q = searchQuery.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, searchQuery]);

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setSearchQuery(''); }}
        className="flex h-[56px] w-full items-center justify-between rounded-[16px] border border-white/[0.08] bg-[#1E2235]/80 px-4 text-[15px] text-white transition-all duration-200 hover:border-white/[0.15]"
        aria-label={label || placeholder}
      >
        <span className={value ? 'text-white' : 'text-white/25'}>{selectedLabel || placeholder}</span>
        <svg className="h-[18px] w-[18px] text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="flex flex-col p-0"
          style={{
            backgroundColor: 'rgba(14, 17, 22, 0.98)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '32px 32px 0 0',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
            boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.4)',
            maxHeight: '70dvh',
          }}
        >
          <SheetHeader className="shrink-0 px-5 pt-7 pb-2 border-b border-white/[0.06]">
            <div className="flex justify-center -mt-5 mb-3">
              <div className="h-[4px] w-[36px] rounded-full bg-white/[0.12]" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <SheetTitle className="text-[17px] font-bold text-white">{label || placeholder}</SheetTitle>
              <SheetClose asChild>
                <button className="flex h-11 w-11 items-center justify-center rounded-xl text-white/40 hover:bg-white/5 active:scale-90 transition-all shrink-0 -mr-2" aria-label="Close">
                  <X className="h-[18px] w-[18px]" />
                </button>
              </SheetClose>
            </div>
            {searchable && (
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full h-[44px] rounded-[12px] border border-white/[0.08] bg-[#1E2235]/80 pl-10 pr-4 text-[14px] text-white placeholder:text-white/25 outline-none focus:ring-2 focus:ring-[#7c5cff]/40 transition-all"
                  autoFocus
                />
              </div>
            )}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto overscroll-contain py-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-white/30">
                <Search className="h-8 w-8 mb-2" />
                <p className="text-[13px]">No options found</p>
              </div>
            ) : (
              filtered.map((opt) => (
                <SheetClose asChild key={opt.value}>
                  <button
                    onClick={() => onValueChange(opt.value)}
                    className={cn(
                      'flex w-full items-center justify-between px-5 py-3.5 text-[14px] transition-all active:bg-white/5',
                      opt.value === value ? 'text-[#7c5cff] font-semibold bg-[#7c5cff]/5' : 'text-white/80 hover:bg-white/5'
                    )}
                  >
                    <span>{opt.label}</span>
                    {opt.value === value && <Check className="h-[18px] w-[18px] text-[#7c5cff]" />}
                  </button>
                </SheetClose>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
