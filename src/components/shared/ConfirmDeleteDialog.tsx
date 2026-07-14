'use client';

import { UniversalFormDialog } from './UniversalFormDialog';
import { Trash2 } from 'lucide-react';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  loading?: boolean;
  itemName?: string;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = 'Delete Transaction',
  description,
  onConfirm,
  loading = false,
  itemName,
}: ConfirmDeleteDialogProps) {
  return (
    <UniversalFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={
        description ||
        (itemName
          ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
          : 'Are you sure you want to delete this item? This action cannot be undone.')
      }
      size="sm"
    >
      <div className="flex items-center justify-center py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF5A6E]/10">
          <Trash2 className="h-8 w-8 text-[#FF5A6E]" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          disabled={loading}
          className="flex-1 h-[56px] rounded-[16px] text-[15px] font-semibold bg-white/5 text-white/70 hover:bg-white/10 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 h-[56px] rounded-[16px] text-[15px] font-semibold text-white bg-gradient-to-br from-[#FF5A6E] to-[#e04a5c] hover:from-[#ff6b7d] hover:to-[#FF5A6E] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-[#FF5A6E]/20"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Deleting...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </span>
          )}
        </button>
      </div>
    </UniversalFormDialog>
  );
}
