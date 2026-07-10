'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui';
import { MobileFormSheet } from '@/components/mobile/MobileFormSheet';
import { EXPENSE_CATEGORIES, INCOME_SOURCES, PAYMENT_METHODS, RECURRING_INTERVALS } from '@/constants';
import { stripHtml } from '@/utils/helpers';
import toast from 'react-hot-toast';

type TransactionType = 'expense' | 'income';

interface TransactionDialogProps {
  type: TransactionType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  defaultValues?: Record<string, unknown>;
}

type FormState = Record<string, string | boolean>;

const defaultForm = (type: TransactionType, defaults?: Record<string, unknown>): FormState => ({
  amount: (defaults?.amount as string) || '',
  description: (defaults?.description as string) || '',
  notes: (defaults?.notes as string) || '',
  paymentMethod: (defaults?.paymentMethod as string) || 'Cash',
  isRecurring: (defaults?.isRecurring as boolean) || false,
  recurringInterval: (defaults?.recurringInterval as string) || 'monthly',
  ...(type === 'expense'
    ? { category: (defaults?.category as string) || 'Food', expenseDate: (defaults?.expenseDate as string) || new Date().toISOString().split('T')[0] }
    : { source: (defaults?.source as string) || 'Salary', incomeDate: (defaults?.incomeDate as string) || new Date().toISOString().split('T')[0] }),
});

export function TransactionDialog({ type, open, onOpenChange, onSubmit, defaultValues }: TransactionDialogProps) {
  const [form, setForm] = useState<FormState>(defaultForm(type, defaultValues));

  useEffect(() => {
    if (open) setForm(defaultForm(type, defaultValues));
  }, [open, type, defaultValues]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const parsedAmount = parseFloat(form.amount as string);
      if (isNaN(parsedAmount)) throw new Error('Invalid amount');
      const description = stripHtml(String(form.description || '')).trim().slice(0, 200);
      if (!description) { toast.error('Description is required'); setLoading(false); return; }
      const notes = stripHtml(String(form.notes || '')).trim().slice(0, 500);
      const data: Record<string, unknown> = {
        amount: parsedAmount,
        description,
        ...(notes ? { notes } : {}),
        paymentMethod: form.paymentMethod,
        isRecurring: form.isRecurring,
        ...(form.isRecurring ? { recurringInterval: form.recurringInterval } : {}),
      };
      if (type === 'expense') {
        data.category = form.category;
        data.expenseDate = form.expenseDate;
        data.tags = [];
        data.isFavorite = false;
      } else {
        data.source = form.source;
        data.incomeDate = form.incomeDate;
        data.isFavorite = false;
      }
      await onSubmit(data);
      onOpenChange(false);
      setForm(defaultForm(type));
    } catch {
      toast.error('Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string, value: string | boolean) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <MobileFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={defaultValues ? (type === 'expense' ? 'Edit Expense' : 'Edit Income') : (type === 'expense' ? 'Add Expense' : 'Add Income')}
      description={defaultValues ? 'Update the transaction details' : (type === 'expense' ? 'Record a new expense transaction' : 'Record a new income entry')}
      loading={loading}
      submitLabel={loading ? 'Saving...' : defaultValues ? 'Update' : (type === 'expense' ? 'Add Expense' : 'Add Income')}
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={form.amount as string}
          onChange={(e) => set('amount', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="What was this for?"
          value={form.description as string}
          onChange={(e) => set('description', e.target.value)}
          required
        />
      </div>

      {type === 'expense' ? (
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={form.category as string} onValueChange={(v) => set('category', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Source</Label>
          <Select value={form.source as string} onValueChange={(v) => set('source', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INCOME_SOURCES.map((src) => (
                <SelectItem key={src} value={src}>{src}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={type === 'expense' ? (form.expenseDate as string) : (form.incomeDate as string)}
          onChange={(e) => set(type === 'expense' ? 'expenseDate' : 'incomeDate', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Payment Method</Label>
        <Select value={form.paymentMethod as string} onValueChange={(v) => set('paymentMethod', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((pm) => (
              <SelectItem key={pm} value={pm}>{pm}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input
          id="notes"
          placeholder="Add a note..."
          value={form.notes as string}
          onChange={(e) => set('notes', e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="recurring"
          checked={form.isRecurring as boolean}
          onChange={(e) => set('isRecurring', e.target.checked)}
          className="rounded border-gray-300 text-primary focus:ring-primary"
        />
        <Label htmlFor="recurring" className="cursor-pointer">Recurring transaction</Label>
      </div>

      {form.isRecurring && (
        <div className="space-y-2">
          <Label>Interval</Label>
          <Select value={form.recurringInterval as string} onValueChange={(v) => set('recurringInterval', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RECURRING_INTERVALS.map((ri) => (
                <SelectItem key={ri.value} value={ri.value}>{ri.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </MobileFormSheet>
  );
}
