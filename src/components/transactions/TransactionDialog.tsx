'use client';

import { useState, useEffect } from 'react';
import { UniversalFormDialog } from '@/components/shared';
import { CurrencyInput, FormInput, FormSelect, FormDatePicker, FormSwitch, FormSection } from '@/components/ui/forms';
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

const catOptions = (type: TransactionType) =>
  type === 'expense'
    ? EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))
    : INCOME_SOURCES.map((s) => ({ value: s, label: s }));

const paymentOptions = PAYMENT_METHODS.map((p) => ({ value: p, label: p }));
const intervalOptions = RECURRING_INTERVALS.map((ri) => ({ value: ri.value, label: ri.label }));

export function TransactionDialog({ type, open, onOpenChange, onSubmit, defaultValues }: TransactionDialogProps) {
  const [form, setForm] = useState<FormState>(defaultForm(type, defaultValues));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) { setForm(defaultForm(type, defaultValues)); setErrors({}); }
  }, [open, type, defaultValues]);

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
      <CurrencyInput
        id="amount"
        label="Amount"
        value={form.amount as string}
        onChange={(v) => set('amount', v)}
        error={errors.amount}
        required
        autoFocus
      />

      <FormDatePicker
        id="date"
        label="Date"
        value={type === 'expense' ? (form.expenseDate as string) : (form.incomeDate as string)}
        onChange={(v) => set(type === 'expense' ? 'expenseDate' : 'incomeDate', v)}
        required
      />

      <FormInput
        id="description"
        label="Description"
        placeholder="What was this for?"
        value={form.description as string}
        onChange={(e) => set('description', e.target.value)}
        error={errors.description}
        required
        charCount={{ current: (form.description as string).length, max: 200 }}
        hideCharUntilTyping
      />

      <FormSelect
        id="category-select"
        label={type === 'expense' ? 'Category' : 'Source'}
        value={type === 'expense' ? (form.category as string) : (form.source as string)}
        onValueChange={(v) => set(type === 'expense' ? 'category' : 'source', v)}
        options={catOptions(type)}
      />

      <FormSelect
        id="payment-select"
        label="Payment Method"
        value={form.paymentMethod as string}
        onValueChange={(v) => set('paymentMethod', v)}
        options={paymentOptions}
      />

      <FormInput
        id="notes"
        label="Notes"
        placeholder="Add a note..."
        value={form.notes as string}
        onChange={(e) => set('notes', e.target.value)}
        charCount={{ current: (form.notes as string).length, max: 500 }}
        hideCharUntilTyping
      />

      <FormSwitch
        id="recurring"
        checked={form.isRecurring as boolean}
        onChange={(v) => set('isRecurring', v)}
        label="Recurring Transaction"
        description="Automatically repeat this transaction."
      />

      {form.isRecurring && (
        <FormSelect
          id="interval-select"
          label="Repeat Interval"
          value={form.recurringInterval as string}
          onValueChange={(v) => set('recurringInterval', v)}
          options={intervalOptions}
        />
      )}
    </UniversalFormDialog>
  );
}
