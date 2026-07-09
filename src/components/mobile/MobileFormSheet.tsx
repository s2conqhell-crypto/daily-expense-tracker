'use client';

import { useIsMobile } from '@/hooks/useMediaQuery';
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose,
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui';
import { Button } from '@/components/ui';
import { X } from 'lucide-react';

interface MobileFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
  submitLabel?: string;
  onSubmit?: (e: React.FormEvent) => void;
  asForm?: boolean;
}

export function MobileFormSheet({
  open, onOpenChange, title, description, children, footer, loading, submitLabel, onSubmit, asForm = true,
}: MobileFormSheetProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="bg-[#0A0C10] border-t border-white/[0.06] rounded-t-3xl p-0 shadow-2xl shadow-black/40 flex flex-col max-h-[90dvh]" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
          <SheetHeader className="flex flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-white/[0.06] shrink-0">
            <SheetTitle className="text-[17px] font-bold text-white">{title}</SheetTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="touch-target flex h-9 w-9 items-center justify-center rounded-xl text-[#8899AA] hover:bg-white/5 active:scale-90 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </SheetHeader>
          {asForm ? (
            <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {children}
              </div>
              <div className="shrink-0 px-5 pt-4 pb-3 border-t border-white/[0.06]">
                {footer || (
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="flex-1 h-[52px] text-[14px] font-semibold rounded-[16px]" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit" disabled={loading} className="flex-1 h-[52px] text-[14px] font-semibold rounded-[16px] gradient-primary text-white shadow-lg shadow-[#8B6FFF]/20">
                      {loading ? 'Saving...' : (submitLabel || 'Save')}
                    </Button>
                  </div>
                )}
              </div>
            </form>
          ) : (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {children}
              </div>
              {footer && (
                <div className="shrink-0 px-5 pt-4 pb-3 border-t border-white/[0.06]">
                  {footer}
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
