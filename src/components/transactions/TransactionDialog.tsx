'use client';

import { useState, useEffect } from 'react';
import { Input, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, ToggleSwitch } from '@/components/ui';
import { UniversalFormDialog, FormField } from '@/components/shared';
import { EXPENSE_CATEGORIES, INCOME_SOURCES, PAYMENT_METHODS, RECURRING_INTERVALS } from '@/constants';
import { stripHtml, cn } from '@/utils/helpers';
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) { setForm(defaultForm(type, defaultValues)); setErrors({}); }
  }, [open, type, defaultValues]);

  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!(form.amount as string) || isNaN(parseFloat(form.amount as string)) || parseFloat(form.amount as string) <= 0) errs.amount = 'Enter a valid amount';
    if (!(form.description as string).trim()) errs.description = 'Description is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const parsedAmount = parseFloat(form.amount as string);
      const description = stripHtml(String(form.description || '')).trim().slice(0, 200);
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
      setErrors({});
    } catch {
      toast.error('Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  return (
    <UniversalFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={defaultValues ? (type === 'expense' ? 'Edit Expense' : 'Edit Income') : (type === 'expense' ? 'Add Expense' : 'Add Income')}
      description={defaultValues ? 'Update the transaction details' : (type === 'expense' ? 'Record a new expense transaction' : 'Record a new income entry')}
      loading={loading}
      submitLabel={loading ? 'Saving...' : defaultValues ? 'Update' : (type === 'expense' ? 'Add Expense' : 'Add Income')}
      onSubmit={handleSubmit}
      onCancel={() => onOpenChange(false)}
    >
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Amount" htmlFor="amount" required error={errors.amount}>
          <Input
            id="amount" type="number" step="0.01" min="0" placeholder="0.00"
            value={form.amount as string} onChange={(e) => set('amount', e.target.value)}
            data-autofocus aria-invalid={!!errors.amount}
            className={cn(errors.amount && 'border-destructive')}
          />
        </FormField>
        <FormField label="Date" htmlFor="date" required>
          <Input
            id="date" type="date"
            value={type === 'expense' ? (form.expenseDate as string) : (form.incomeDate as string)}
            onChange={(e) => set(type === 'expense' ? 'expenseDate' : 'incomeDate', e.target.value)}
          />
        </FormField>
      </div>

      <FormField label="Description" htmlFor="description" required error={errors.description} charCount={{ current: (form.description as string).length, max: 200 }}>
        <Input
          id="description" placeholder="What was this for?"
          value={form.description as string} onChange={(e) => set('description', e.target.value)}
          aria-invalid={!!errors.description}
          className={cn(errors.description && 'border-destructive')}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        {type === 'expense' ? (
          <FormField label="Category" htmlFor="category-select">
            <Select value={form.category as string} onValueChange={(v) => set('category', v)}>
              <SelectTrigger id="category-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
              </SelectContent>
            </Select>
          </FormField>
        ) : (
          <FormField label="Source" htmlFor="source-select">
            <Select value={form.source as string} onValueChange={(v) => set('source', v)}>
              <SelectTrigger id="source-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                {INCOME_SOURCES.map((src) => (<SelectItem key={src} value={src}>{src}</SelectItem>))}
              </SelectContent>
            </Select>
          </FormField>
        )}
        <FormField label="Payment Method" htmlFor="payment-select">
          <Select value={form.paymentMethod as string} onValueChange={(v) => set('paymentMethod', v)}>
            <SelectTrigger id="payment-select"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((pm) => (<SelectItem key={pm} value={pm}>{pm}</SelectItem>))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField label="Notes" htmlFor="notes" charCount={{ current: (form.notes as string).length, max: 500 }}>
        <Input id="notes" placeholder="Add a note..." value={form.notes as string} onChange={(e) => set('notes', e.target.value)} />
      </FormField>

      <ToggleSwitch
        id="recurring"
        checked={form.isRecurring as boolean}
        onChange={(v) => set('isRecurring', v)}
        label="Recurring transaction"
      />

      {form.isRecurring && (
        <FormField label="Interval" htmlFor="interval-select">
          <Select value={form.recurringInterval as string} onValueChange={(v) => set('recurringInterval', v)}>
            <SelectTrigger id="interval-select"><SelectValue /></SelectTrigger>
            <SelectContent>
              {RECURRING_INTERVALS.map((ri) => (<SelectItem key={ri.value} value={ri.value}>{ri.label}</SelectItem>))}
            </SelectContent>
          </Select>
        </FormField>
      )}
    </UniversalFormDialog>
  );
}
