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
        <SheetContent side="bottom" className="bg-[#141822] border-t border-white/[0.08] rounded-t-2xl p-0 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] shadow-2xl shadow-black/40 flex flex-col max-h-[90dvh]">
          <SheetHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-2 border-b border-white/[0.06] shrink-0">
            <SheetTitle className="text-[16px] font-bold text-white">{title}</SheetTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="touch-target rounded-xl text-[#8899AA] hover:text-white hover:bg-white/5 h-9 w-9 flex items-center justify-center"
            >
              <X className="h-5 w-5" />
            </button>
          </SheetHeader>
          {asForm ? (
            <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                {children}
              </div>
              <div className="shrink-0 px-4 pt-3 pb-2 border-t border-white/[0.06]">
                {footer || (
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1 h-11 text-sm" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit" disabled={loading} className="flex-1 h-11 text-sm">
                      {loading ? 'Saving...' : (submitLabel || 'Save')}
                    </Button>
                  </div>
                )}
              </div>
            </form>
          ) : (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                {children}
              </div>
              {footer && (
                <div className="shrink-0 px-4 pt-3 pb-2 border-t border-white/[0.06]">
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
