'use client';

import { useRef, useCallback } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose,
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose,
} from '@/components/ui';
import { X } from 'lucide-react';
import { FormFooter } from '@/components/ui/forms';

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

export function UniversalFormDialog({
  open, onOpenChange, title, description, children, footer, loading, submitLabel, cancelLabel = 'Cancel',
  onSubmit, onCancel, asForm = true, size = 'md', dirty = false, confirmClose,
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
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-4">
        {children}
      </div>
    </div>
  );

  const defaultFooter = footer || (
    <FormFooter
      loading={loading}
      submitLabel={submitLabel}
      cancelLabel={cancelLabel}
      onCancel={onCancel ? handleCancel : undefined}
    />
  );

  const submitFooter = (
    <div className="shrink-0 px-5 py-4 border-t border-white/[0.06] bg-[#0E1116]">
      {defaultFooter}
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
      {footer && submitFooter}
    </div>
  );

  return (
    <>
      {/* Mobile Sheet */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetContent
            side="bottom"
            className="flex flex-col p-0 max-h-[92dvh]"
            style={{
              backgroundColor: 'rgba(14, 17, 22, 0.98)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '32px 32px 0 0',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
              boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.4)',
            }}
          >
            <SheetHeader className="shrink-0 px-5 pt-5 pb-3 border-b border-white/[0.06]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <SheetTitle className="text-[18px] font-bold text-white leading-tight tracking-tight">{title}</SheetTitle>
                  {description && (
                    <p className="text-[12px] text-white/40 mt-1 leading-relaxed">{description}</p>
                  )}
                </div>
                <SheetClose asChild>
                  <button
                    className="touch-target flex h-9 w-9 items-center justify-center rounded-xl text-white/40 hover:bg-white/5 hover:text-white/70 active:scale-90 transition-all shrink-0 -mr-1"
                    aria-label="Close"
                  >
                    <X className="h-[18px] w-[18px]" />
                  </button>
                </SheetClose>
              </div>
              {/* Handle bar */}
              <div className="flex justify-center -mb-1 mt-1">
                <div className="h-[4px] w-[36px] rounded-full bg-white/[0.12]" />
              </div>
            </SheetHeader>
            {content}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Dialog */}
      <div className="hidden lg:block">
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent
            className="max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden border-white/[0.08] shadow-2xl shadow-black/40"
            style={{ maxWidth: size === 'sm' ? '480px' : size === 'lg' ? '700px' : '560px' }}
            onEscapeKeyDown={(e) => { if (dirty && confirmClose && !window.confirm(confirmClose)) e.preventDefault(); }}
            onPointerDownOutside={(e) => { if (dirty && confirmClose && !window.confirm(confirmClose)) e.preventDefault(); }}
            onOpenAutoFocus={(e) => { e.preventDefault(); document.querySelector<HTMLElement>('[data-autofocus]')?.focus(); }}
          >
            <DialogHeader className="shrink-0 px-6 py-4 border-b border-white/[0.08]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-[18px] font-bold leading-tight tracking-tight text-white">{title}</DialogTitle>
                  {description && (
                    <DialogDescription className="text-[12px] mt-1 leading-relaxed text-white/40">{description}</DialogDescription>
                  )}
                </div>
                <DialogClose asChild>
                  <button
                    className="touch-target flex h-9 w-9 items-center justify-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white/70 transition-all shrink-0 -mr-1"
                    aria-label="Close"
                  >
                    <X className="h-[18px] w-[18px]" />
                  </button>
                </DialogClose>
              </div>
            </DialogHeader>
            {content}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
