'use client';

import { useState, useRef, useEffect } from 'react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { MoreVertical, type LucideIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export interface ActionMenuItem {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  color?: string;
  destructive?: boolean;
  disabled?: boolean;
}

interface TransactionActionMenuProps {
  actions: ActionMenuItem[];
  align?: 'left' | 'right';
  trigger?: React.ReactNode;
  sheetTitle?: string;
  sheetSubtitle?: string;
  className?: string;
}

export function TransactionActionMenu({
  actions,
  align = 'right',
  trigger,
  sheetTitle,
  sheetSubtitle,
  className,
}: TransactionActionMenuProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  if (isMobile) {
    return (
      <>
        {trigger ? (
          <div onClick={() => setOpen(true)}>{trigger}</div>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-[#6b7b8d] hover:bg-white/5 active:scale-90 transition-all"
            aria-label="More actions"
          >
            <MoreVertical className="h-[18px] w-[18px]" />
          </button>
        )}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="bottom"
            className="bg-[#09090b] border-t border-white/[0.06] rounded-t-[28px] px-4 pt-5 shadow-2xl shadow-black/40"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
          >
            {sheetTitle && (
              <SheetHeader className="mb-4 pb-4 border-b border-white/[0.06]">
                <SheetTitle className="text-[15px] font-bold text-white">{sheetTitle}</SheetTitle>
                {sheetSubtitle && <p className="text-[12px] text-[#6b7b8d]">{sheetSubtitle}</p>}
              </SheetHeader>
            )}
            <div className="space-y-1">
              {actions.map(({ icon: Icon, label, onClick, color = '#7c5cff', destructive, disabled }) => (
                <button
                  key={label}
                  onClick={() => {
                    if (!disabled) {
                      setOpen(false);
                      setTimeout(() => onClick(), 200);
                    }
                  }}
                  disabled={disabled}
                  className={`flex w-full items-center gap-3.5 rounded-[14px] px-3.5 py-3.5 hover:bg-white/5 active:scale-[0.98] transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-[12px] shrink-0"
                    style={{ backgroundColor: (destructive ? '#ff5a7a' : color) + '15' }}
                  >
                    <Icon className="h-[18px] w-[18px]" style={{ color: destructive ? '#ff5a7a' : color }} />
                  </div>
                  <span className={`text-[14px] font-medium ${destructive ? 'text-[#ff5a7a]' : 'text-white'}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <div className={`relative ${className || ''}`} ref={dropdownRef}>
      {trigger ? (
        <div onClick={() => setDropdownOpen(!dropdownOpen)}>{trigger}</div>
      ) : (
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6b7b8d] hover:bg-white/5 hover:text-white transition-all"
          aria-label="More actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      )}
      {dropdownOpen && (
        <div
          className={`absolute top-full mt-1 z-50 min-w-[180px] bg-[#141822] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/40 py-1.5 ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {actions.map(({ icon: Icon, label, onClick, color = '#7c5cff', destructive, disabled }) => (
            <button
              key={label}
              onClick={() => {
                if (!disabled) {
                  setDropdownOpen(false);
                  onClick();
                }
              }}
              disabled={disabled}
              className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium transition-all hover:bg-white/5 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${destructive ? 'text-[#ff5a7a]' : 'text-white'}`}
            >
              <Icon className="h-4 w-4 shrink-0" style={{ color: destructive ? '#ff5a7a' : color }} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
