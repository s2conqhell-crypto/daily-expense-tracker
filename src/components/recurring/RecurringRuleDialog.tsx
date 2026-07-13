'use client';

import { useState, useEffect } from 'react';
import { UniversalFormDialog } from '@/components/shared';
import { CurrencyInput, FormInput, FormSelect, FormDatePicker, FormSwitch, FormTextarea } from '@/components/ui/forms';
import { EXPENSE_CATEGORIES, INCOME_SOURCES, PAYMENT_METHODS } from '@/constants';
import type { RecurringTransaction, PaymentMethod } from '@/types';
import { stripHtml, safeDateInput } from '@/utils/helpers';
import toast from 'react-hot-toast';

interface RecurringRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<RecurringTransaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  defaultValues?: RecurringTransaction;
}

type FormState = Record<string, string | boolean>;

const defaultForm = (defaults?: RecurringTransaction): FormState => ({
  type: defaults?.type || 'expense',
  amount: defaults?.amount?.toString() || '',
  category: defaults?.category || 'Other',
  source: defaults?.source || 'Salary',
  description: defaults?.description || '',
  notes: defaults?.notes || '',
  paymentMethod: defaults?.paymentMethod || 'Cash',
  interval: defaults?.interval || 'monthly',
  dayOfMonth: defaults?.dayOfMonth?.toString() || new Date().getDate().toString(),
  nextExecution: safeDateInput(defaults?.nextExecution) || new Date().toISOString().split('T')[0],
  isActive: defaults?.isActive ?? true,
});

const typeOptions = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
];

const intervalOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const paymentOptions = PAYMENT_METHODS.map((p) => ({ value: p, label: p }));
const catOptions = EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }));
const sourceOptions = INCOME_SOURCES.map((s) => ({ value: s, label: s }));

export function RecurringRuleDialog({ open, onOpenChange, onSubmit, defaultValues }: RecurringRuleDialogProps) {
  const [form, setForm] = useState<FormState>(defaultForm(defaultValues));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(defaultForm(defaultValues));
      setErrors({});
    }
  }, [open, defaultValues]);

  const set = (field: string, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const amount = parseFloat(form.amount as string);
    if (isNaN(amount) || amount <= 0) errs.amount = 'Enter a valid amount';
    if (!(form.description as string).trim()) errs.description = 'Description is required';
    if (!form.nextExecution) errs.nextExecution = 'Next execution date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const amount = parseFloat(form.amount as string);
      const dayOfMonth = parseInt(form.dayOfMonth as string);
      await onSubmit({
        type: form.type as 'expense' | 'income',
        amount,
        ...(form.type === 'expense' ? { category: stripHtml(form.category as string) } : {}),
        ...(form.type === 'income' ? { source: stripHtml(form.source as string) } : {}),
        description: stripHtml(form.description as string),
        ...(form.notes ? { notes: stripHtml(form.notes as string) } : {}),
        paymentMethod: form.paymentMethod as PaymentMethod,
        interval: form.interval as RecurringTransaction['interval'],
        ...(dayOfMonth >= 1 ? { dayOfMonth } : {}),
        nextExecution: new Date(form.nextExecution as string),
        isActive: form.isActive as boolean,
      });
      onOpenChange(false);
      toast.success(defaultValues ? 'Rule updated' : 'Rule created');
    } catch (error) {
      console.error('[RecurringRuleDialog] Submit failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save rule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={defaultValues ? 'Edit Recurring Rule' : 'New Recurring Rule'}
      description="Set up an automatically repeating transaction."
      loading={loading}
      submitLabel={loading ? 'Saving...' : defaultValues ? 'Update' : 'Create Rule'}
      onSubmit={handleSubmit}
      onCancel={() => onOpenChange(false)}
    >
      <FormSelect
        id="type-select"
        label="Type"
        value={form.type as string}
        onValueChange={(v) => set('type', v)}
        options={typeOptions}
      />

      <CurrencyInput
        id="amount"
        label="Amount"
        value={form.amount as string}
        onChange={(v) => set('amount', v)}
        error={errors.amount}
        required
        autoFocus
      />

      <FormInput
        id="description"
        label="Description"
        placeholder="What is this for?"
        value={form.description as string}
        onChange={(e) => set('description', e.target.value)}
        error={errors.description}
        required
        charCount={{ current: (form.description as string).length, max: 200 }}
        hideCharUntilTyping
      />

      <FormSelect
        id="category-select"
        label={form.type === 'expense' ? 'Category' : 'Source'}
        value={form.type === 'expense' ? (form.category as string) : (form.source as string)}
        onValueChange={(v) => set(form.type === 'expense' ? 'category' : 'source', v)}
        options={form.type === 'expense' ? catOptions : sourceOptions}
      />

      <FormSelect
        id="payment-select"
        label="Payment Method"
        value={form.paymentMethod as string}
        onValueChange={(v) => set('paymentMethod', v)}
        options={paymentOptions}
      />

      <FormSelect
        id="interval-select"
        label="Interval"
        value={form.interval as string}
        onValueChange={(v) => set('interval', v)}
        options={intervalOptions}
      />

      {form.interval === 'monthly' && (
        <FormInput
          id="dayOfMonth"
          label="Day of Month"
          type="number"
          min="1"
          max="31"
          placeholder="1-31"
          value={form.dayOfMonth as string}
          onChange={(e) => set('dayOfMonth', e.target.value)}
        />
      )}

      <FormDatePicker
        id="nextExecution"
        label="Next Execution"
        value={form.nextExecution as string}
        onChange={(v) => set('nextExecution', v)}
        error={errors.nextExecution}
        required
      />

      <FormTextarea
        id="notes"
        label="Notes"
        placeholder="Add a note..."
        value={form.notes as string}
        onChange={(e) => set('notes', e.target.value)}
        charCount={{ current: (form.notes as string).length, max: 500 }}
        hideCharUntilTyping
      />

      <FormSwitch
        id="isActive"
        checked={form.isActive as boolean}
        onChange={(v) => set('isActive', v)}
        label="Active"
        description="Enable this recurring rule."
      />
    </UniversalFormDialog>
  );
}
