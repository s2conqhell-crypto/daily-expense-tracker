'use client';

import { Loader2 } from 'lucide-react';

interface FormFooterProps {
  loading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  disabled?: boolean;
}

export function FormFooter({ loading, submitLabel = 'Save', cancelLabel = 'Cancel', onCancel, disabled }: FormFooterProps) {
  return (
    <div className="flex gap-3 w-full">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 h-[52px] rounded-[16px] text-[15px] font-semibold bg-white/5 text-white/70 hover:bg-white/10 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {cancelLabel}
        </button>
      )}
      <button
        type="submit"
        disabled={loading || disabled}
        className="flex-1 h-[52px] rounded-[16px] text-[15px] font-semibold text-white bg-gradient-to-br from-[#7c5cff] to-[#6a4de6] hover:from-[#8d72ff] hover:to-[#7c5cff] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-[#7c5cff]/20"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Saving...
          </span>
        ) : submitLabel}
      </button>
    </div>
  );
}
