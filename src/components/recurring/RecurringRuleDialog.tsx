'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui';
import { MobileFormSheet } from '@/components/mobile/MobileFormSheet';
import { EXPENSE_CATEGORIES, INCOME_SOURCES, PAYMENT_METHODS } from '@/constants';
import type { RecurringTransaction } from '@/types';
import { toDate, stripHtml } from '@/utils/helpers';
import toast from 'react-hot-toast';

interface RecurringRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<RecurringTransaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  defaultValues?: RecurringTransaction;
}

const defaultForm = (defaults?: RecurringTransaction) => ({
  type: defaults?.type || 'expense',
  amount: defaults?.amount?.toString() || '',
  category: defaults?.category || 'Other',
  source: defaults?.source || 'Salary',
  description: defaults?.description || '',
  notes: defaults?.notes || '',
  paymentMethod: defaults?.paymentMethod || 'Cash',
  interval: defaults?.interval || 'monthly',
  dayOfMonth: defaults?.dayOfMonth?.toString() || new Date().getDate().toString(),
  nextExecution: defaults?.nextExecution ? toDate(defaults.nextExecution).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  isActive: defaults?.isActive ?? true,
});

export function RecurringRuleDialog({ open, onOpenChange, onSubmit, defaultValues }: RecurringRuleDialogProps) {
  const [form, setForm] = useState<Record<string, string | boolean>>(defaultForm(defaultValues));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setForm(defaultForm(defaultValues));
  }, [open, defaultValues]);

  const set = (field: string, value: string | boolean) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const amount = parseFloat(form.amount as string);
      if (isNaN(amount) || amount <= 0) throw new Error('Invalid amount');
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
    <MobileFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={defaultValues ? 'Edit Recurring Rule' : 'New Recurring Rule'}
      description="Set up an automatically repeating transaction."
      loading={loading}
      submitLabel={loading ? 'Saving...' : defaultValues ? 'Update' : 'Create Rule'}
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={form.type as string} onValueChange={(v) => set('type', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" type="number" step="0.01" min="0" placeholder="0.00" value={form.amount as string} onChange={(e) => set('amount', e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" placeholder="What is this for?" value={form.description as string} onChange={(e) => set('description', e.target.value)} required />
      </div>

      {form.type === 'expense' ? (
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={form.category as string} onValueChange={(v) => set('category', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Source</Label>
          <Select value={form.source as string} onValueChange={(v) => set('source', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {INCOME_SOURCES.map((src) => (<SelectItem key={src} value={src}>{src}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Payment Method</Label>
        <Select value={form.paymentMethod as string} onValueChange={(v) => set('paymentMethod', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((pm) => (<SelectItem key={pm} value={pm}>{pm}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Interval</Label>
          <Select value={form.interval as string} onValueChange={(v) => set('interval', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nextExecution">Next Execution</Label>
          <Input id="nextExecution" type="date" value={form.nextExecution as string} onChange={(e) => set('nextExecution', e.target.value)} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input id="notes" placeholder="Add a note..." value={form.notes as string} onChange={(e) => set('notes', e.target.value)} />
      </div>
    </MobileFormSheet>
  );
}