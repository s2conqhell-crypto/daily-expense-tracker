'use client';

import { useRef, useCallback } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose,
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose,
} from '@/components/ui';
import { Button } from '@/components/ui';
import { X } from 'lucide-react';

interface UniversalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit?: (e: React.FormEvent) => void;
  onCancel?: () => void;
  asForm?: boolean;
  size?: 'sm' | 'md' | 'lg';
  dirty?: boolean;
  confirmClose?: string;
}

const sizeClasses: Record<string, string> = {
  sm: 'sm:max-w-[480px]',
  md: 'sm:max-w-[600px]',
  lg: 'sm:max-w-[700px]',
};

export function UniversalFormDialog({
  open, onOpenChange, title, description, children, footer, loading, submitLabel, cancelLabel = 'Cancel', onSubmit, onCancel, asForm = true, size = 'md', dirty = false, confirmClose,
}: UniversalFormDialogProps) {
  const submittedRef = useRef(false);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen && dirty && confirmClose) {
      if (!window.confirm(confirmClose)) return;
    }
    submittedRef.current = false;
    onOpenChange(newOpen);
  }, [dirty, confirmClose, onOpenChange]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (submittedRef.current) return;
    submittedRef.current = true;
    onSubmit?.(e);
  }, [onSubmit]);

  const handleCancel = useCallback(() => {
    if (dirty && confirmClose) {
      if (!window.confirm(confirmClose)) return;
    }
    submittedRef.current = false;
    onCancel?.();
  }, [dirty, confirmClose, onCancel]);

  const body = (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-3 space-y-3">
        {children}
      </div>
    </div>
  );

  const defaultFooter = (
    <div className="flex items-center gap-3 w-full">
      <Button type="button" variant="outline" disabled={loading} onClick={handleCancel} className="flex-1 sm:flex-initial sm:min-w-[100px] h-[44px] rounded-[12px] touch-target">
        {cancelLabel}
      </Button>
      <Button type="submit" disabled={loading} className="flex-1 sm:flex-initial sm:min-w-[120px] h-[44px] rounded-[12px] touch-target">
        {loading ? 'Saving...' : (submitLabel || 'Save')}
      </Button>
    </div>
  );

  const submitFooter = (
    <div className="shrink-0 px-5 py-3 border-t border-white/[0.06] bg-background">
      {footer || defaultFooter}
    </div>
  );

  const content = asForm ? (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
      {body}
      {submitFooter}
    </form>
  ) : (
    <div className="flex flex-col flex-1 overflow-hidden">
      {body}
      {footer && (
        <div className="shrink-0 px-5 py-3 border-t border-white/[0.06] bg-background">
          {footer}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Sheet */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetContent
            side="bottom"
            className="flex flex-col p-0 shadow-2xl shadow-black/40 max-h-[92dvh]"
            style={{
              backgroundColor: 'rgba(22, 26, 39, 0.96)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '28px 28px 0 0',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
            }}
          >
            <SheetHeader className="flex flex-row items-start justify-between px-5 pt-5 pb-3 border-b border-white/[0.06] shrink-0 gap-4">
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-[17px] font-bold text-white leading-tight">{title}</SheetTitle>
                {description && <p className="text-[12px] text-[#6b7b8d] mt-1 leading-relaxed">{description}</p>}
              </div>
              <SheetClose asChild>
                <button
                  onPointerDown={(e) => e.currentTarget.blur()}
                  className="touch-target flex h-10 w-10 items-center justify-center rounded-[12px] text-[#6b7b8d] hover:bg-white/5 active:scale-90 transition-all shrink-0 -mr-1"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </SheetClose>
            </SheetHeader>
            {content}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Dialog */}
      <div className="hidden lg:block">
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent
            className={`${sizeClasses[size]} max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden`}
            onEscapeKeyDown={(e) => { if (dirty && confirmClose && !window.confirm(confirmClose)) e.preventDefault(); }}
            onPointerDownOutside={(e) => { if (dirty && confirmClose && !window.confirm(confirmClose)) e.preventDefault(); }}
            onOpenAutoFocus={(e) => { e.preventDefault(); document.querySelector<HTMLElement>('[data-autofocus]')?.focus(); }}
          >
            <DialogHeader className="shrink-0 flex flex-row items-start justify-between gap-4 px-6 py-4 border-b">
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-[17px] font-bold leading-tight">{title}</DialogTitle>
                {description && <DialogDescription className="text-[12px] mt-1 leading-relaxed">{description}</DialogDescription>}
              </div>
              <DialogClose asChild>
                <button
                  onPointerDown={(e) => e.currentTarget.blur()}
                  className="touch-target flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all shrink-0 -mr-1"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </DialogClose>
            </DialogHeader>
            {content}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
