'use client';

import { useState, useEffect } from 'react';
import { Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, ToggleSwitch } from '@/components/ui';
import { UniversalFormDialog, FormField } from '@/components/shared';
import { SUBSCRIPTION_CATEGORIES } from '@/constants';
import type { Subscription } from '@/types';
import { stripHtml, safeDateInput, cn } from '@/utils/helpers';
import toast from 'react-hot-toast';

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  defaultValues?: Subscription;
}

type FormState = Record<string, string | boolean>;

const defaultForm = (defaults?: Subscription): FormState => ({
  name: defaults?.name || '',
  category: defaults?.category || 'Netflix',
  customCategory: defaults?.customCategory || '',
  monthlyCost: defaults?.monthlyCost?.toString() || '',
  yearlyCost: defaults?.yearlyCost?.toString() || '',
  renewalDate: safeDateInput(defaults?.renewalDate) || new Date().toISOString().split('T')[0],
  autoRenew: defaults?.autoRenew ?? true,
  reminderEnabled: defaults?.reminderEnabled ?? true,
  status: defaults?.status || 'active',
  notes: defaults?.notes || '',
});

export function SubscriptionDialog({ open, onOpenChange, onSubmit, defaultValues }: SubscriptionDialogProps) {
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
    if (!(form.name as string).trim()) errs.name = 'Name is required';
    const cost = parseFloat(form.monthlyCost as string);
    if (isNaN(cost) || cost <= 0) errs.monthlyCost = 'Enter a valid monthly cost';
    if (!form.renewalDate) errs.renewalDate = 'Renewal date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const monthlyCost = parseFloat(form.monthlyCost as string);
      const yearlyCost = parseFloat(form.yearlyCost as string);
      await onSubmit({
        name: stripHtml(form.name as string),
        category: stripHtml(form.category as any) as any,
        customCategory: form.category === 'Custom' ? stripHtml(form.customCategory as string) : undefined,
        monthlyCost,
        yearlyCost: isNaN(yearlyCost) ? monthlyCost * 12 : yearlyCost,
        renewalDate: new Date(form.renewalDate as string),
        autoRenew: form.autoRenew as boolean,
        reminderEnabled: form.reminderEnabled as boolean,
        status: form.status as 'active' | 'paused' | 'expired',
        notes: stripHtml(form.notes as string) || undefined,
      });
      onOpenChange(false);
      toast.success(defaultValues ? 'Subscription updated' : 'Subscription added');
    } catch {
      toast.error('Failed to save subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={defaultValues ? 'Edit Subscription' : 'Add Subscription'}
      description="Track your recurring subscriptions and bills."
      loading={loading}
      submitLabel={loading ? 'Saving...' : defaultValues ? 'Update' : 'Add Subscription'}
      onSubmit={handleSubmit}
      onCancel={() => onOpenChange(false)}
    >
      <FormField label="Name" htmlFor="name" required error={errors.name}>
        <Input id="name" placeholder="Netflix, Spotify, ..." value={form.name as string} onChange={(e) => set('name', e.target.value)}
          data-autofocus aria-invalid={!!errors.name} className={cn(errors.name && 'border-destructive')} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Category" htmlFor="category-select">
          <Select value={form.category as string} onValueChange={(v) => set('category', v)}>
            <SelectTrigger id="category-select"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SUBSCRIPTION_CATEGORIES.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Status" htmlFor="status-select">
          <Select value={form.status as string} onValueChange={(v) => set('status', v)}>
            <SelectTrigger id="status-select"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      {form.category === 'Custom' && (
        <FormField label="Custom Category Name" htmlFor="customCategory" required>
          <Input id="customCategory" placeholder="e.g. Adobe CC" value={form.customCategory as string} onChange={(e) => set('customCategory', e.target.value)} />
        </FormField>
      )}

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Monthly Cost" htmlFor="monthlyCost" required error={errors.monthlyCost}>
          <Input id="monthlyCost" type="number" step="0.01" min="0" placeholder="0.00" value={form.monthlyCost as string} onChange={(e) => set('monthlyCost', e.target.value)}
            aria-invalid={!!errors.monthlyCost} className={cn(errors.monthlyCost && 'border-destructive')} />
        </FormField>
        <FormField label="Yearly Cost" htmlFor="yearlyCost">
          <Input id="yearlyCost" type="number" step="0.01" min="0" placeholder="0.00" value={form.yearlyCost as string} onChange={(e) => set('yearlyCost', e.target.value)} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Renewal Date" htmlFor="renewalDate" required error={errors.renewalDate}>
          <Input id="renewalDate" type="date" value={form.renewalDate as string} onChange={(e) => set('renewalDate', e.target.value)}
            aria-invalid={!!errors.renewalDate} className={cn(errors.renewalDate && 'border-destructive')} />
        </FormField>
      </div>

      <ToggleSwitch
        id="autoRenew"
        checked={form.autoRenew as boolean}
        onChange={(v) => set('autoRenew', v)}
        label="Auto Renew"
      />

      <ToggleSwitch
        id="reminderEnabled"
        checked={form.reminderEnabled as boolean}
        onChange={(v) => set('reminderEnabled', v)}
        label="Reminder"
      />

      <FormField label="Notes" htmlFor="notes" charCount={{ current: (form.notes as string).length, max: 500 }}>
        <Input id="notes" placeholder="Add a note..." value={form.notes as string} onChange={(e) => set('notes', e.target.value)} />
      </FormField>
    </UniversalFormDialog>
  );
}
