'use client';

import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description || (itemName
              ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
              : 'Are you sure you want to delete this item? This action cannot be undone.')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 sm:gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={loading} className="flex-1 h-[44px] touch-target">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-[44px] touch-target gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Deleting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
