'use client';

import { useState, useEffect } from 'react';
import { Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, ToggleSwitch } from '@/components/ui';
import { UniversalFormDialog, FormField } from '@/components/shared';
import { EXPENSE_CATEGORIES, INCOME_SOURCES, PAYMENT_METHODS } from '@/constants';
import type { RecurringTransaction } from '@/types';
import { toDate, stripHtml, safeDateInput, cn } from '@/utils/helpers';
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

export function RecurringRuleDialog({ open, onOpenChange, onSubmit, defaultValues }: RecurringRuleDialogProps) {
  const [form, setForm] = useState<FormState>(defaultForm(defaultValues));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) { setForm(defaultForm(defaultValues)); setErrors({}); }
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
        ...(form.type === 'expense' ? { category: stripHtml(form.category as any) } : {}),
        ...(form.type === 'income' ? { source: stripHtml(form.source as any) } : {}),
        description: stripHtml(form.description as string),
        ...(form.notes ? { notes: stripHtml(form.notes as string) } : {}),
        paymentMethod: form.paymentMethod as any,
        interval: form.interval as any,
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
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Type" htmlFor="type-select">
          <Select value={form.type as string} onValueChange={(v) => set('type', v)}>
            <SelectTrigger id="type-select"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Amount" htmlFor="amount" required error={errors.amount}>
          <Input id="amount" type="number" step="0.01" min="0" placeholder="0.00" value={form.amount as string} onChange={(e) => set('amount', e.target.value)}
            data-autofocus aria-invalid={!!errors.amount} className={cn(errors.amount && 'border-destructive')} />
        </FormField>
      </div>

      <FormField label="Description" htmlFor="description" required error={errors.description} charCount={{ current: (form.description as string).length, max: 200 }}>
        <Input id="description" placeholder="What is this for?" value={form.description as string} onChange={(e) => set('description', e.target.value)}
          aria-invalid={!!errors.description} className={cn(errors.description && 'border-destructive')} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        {form.type === 'expense' ? (
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

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Interval" htmlFor="interval-select">
          <Select value={form.interval as string} onValueChange={(v) => set('interval', v)}>
            <SelectTrigger id="interval-select"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Next Execution" htmlFor="nextExecution" required error={errors.nextExecution}>
          <Input id="nextExecution" type="date" value={form.nextExecution as string} onChange={(e) => set('nextExecution', e.target.value)}
            aria-invalid={!!errors.nextExecution} className={cn(errors.nextExecution && 'border-destructive')} />
        </FormField>
      </div>

      {form.interval === 'monthly' && (
        <FormField label="Day of Month" htmlFor="dayOfMonth">
          <Input id="dayOfMonth" type="number" min="1" max="31" placeholder="1-31" value={form.dayOfMonth as string} onChange={(e) => set('dayOfMonth', e.target.value)} />
        </FormField>
      )}

      <FormField label="Notes" htmlFor="notes" charCount={{ current: (form.notes as string).length, max: 500 }}>
        <Input id="notes" placeholder="Add a note..." value={form.notes as string} onChange={(e) => set('notes', e.target.value)} />
      </FormField>

      <ToggleSwitch
        id="isActive"
        checked={form.isActive as boolean}
        onChange={(v) => set('isActive', v)}
        label="Active"
      />
    </UniversalFormDialog>
  );
}
