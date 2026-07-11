'use client';

import { useState, useEffect } from 'react';
import { UniversalFormDialog } from '@/components/shared';
import { CurrencyInput, FormInput, FormSelect, FormDatePicker, FormSwitch, FormTextarea, FormSection } from '@/components/ui/forms';
import { SUBSCRIPTION_CATEGORIES } from '@/constants';
import type { Subscription } from '@/types';
import { stripHtml, safeDateInput } from '@/utils/helpers';
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

const catOptions = SUBSCRIPTION_CATEGORIES.map((c) => ({ value: c, label: c }));
const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'expired', label: 'Expired' },
];

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
      <FormInput
        id="name"
        label="Name"
        placeholder="Netflix, Spotify, ..."
        value={form.name as string}
        onChange={(e) => set('name', e.target.value)}
        error={errors.name}
        required
        data-autofocus
      />

      <FormSelect
        id="category-select"
        label="Category"
        value={form.category as string}
        onValueChange={(v) => set('category', v)}
        options={catOptions}
      />

      {form.category === 'Custom' && (
        <FormInput
          id="customCategory"
          label="Custom Category Name"
          placeholder="e.g. Adobe CC"
          value={form.customCategory as string}
          onChange={(e) => set('customCategory', e.target.value)}
          required
        />
      )}

      <FormSelect
        id="status-select"
        label="Status"
        value={form.status as string}
        onValueChange={(v) => set('status', v)}
        options={statusOptions}
      />

      <FormSection title="Pricing">
        <CurrencyInput
          id="monthlyCost"
          label="Monthly Cost"
          value={form.monthlyCost as string}
          onChange={(v) => set('monthlyCost', v)}
          error={errors.monthlyCost}
          required
        />

        <CurrencyInput
          id="yearlyCost"
          label="Yearly Cost"
          value={form.yearlyCost as string}
          onChange={(v) => set('yearlyCost', v)}
          placeholder="Auto-calculated as monthly × 12"
        />
      </FormSection>

      <FormDatePicker
        id="renewalDate"
        label="Renewal Date"
        value={form.renewalDate as string}
        onChange={(v) => set('renewalDate', v)}
        error={errors.renewalDate}
        required
      />

      <FormSwitch
        id="autoRenew"
        checked={form.autoRenew as boolean}
        onChange={(v) => set('autoRenew', v)}
        label="Auto Renew"
        description="Automatically renew this subscription."
      />

      <FormSwitch
        id="reminderEnabled"
        checked={form.reminderEnabled as boolean}
        onChange={(v) => set('reminderEnabled', v)}
        label="Renewal Reminder"
        description="Get notified before renewal."
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
    </UniversalFormDialog>
  );
}
