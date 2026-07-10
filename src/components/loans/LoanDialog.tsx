'use client';

import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui';
import { UniversalFormDialog, FormField } from '@/components/shared';
import type { Loan } from '@/types';
import { toDate, stripHtml, safeDateInput, cn } from '@/utils/helpers';
import toast from 'react-hot-toast';

interface LoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Loan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  defaultValues?: Loan;
}

type FormState = Record<string, string>;

const defaultForm = (defaults?: Loan): FormState => ({
  name: defaults?.name || '',
  principalAmount: defaults?.principalAmount?.toString() || '',
  interestRate: defaults?.interestRate?.toString() || '0',
  emiAmount: defaults?.emiAmount?.toString() || '',
  totalEmi: defaults?.totalEmi?.toString() || '',
  outstandingBalance: defaults?.outstandingBalance?.toString() || '',
  startDate: safeDateInput(defaults?.startDate) || new Date().toISOString().split('T')[0],
  emiDay: defaults?.emiDay?.toString() || '',
  notes: defaults?.notes || '',
});

export function LoanDialog({ open, onOpenChange, onSubmit, defaultValues }: LoanDialogProps) {
  const [form, setForm] = useState<FormState>(defaultForm(defaultValues));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) { setForm(defaultForm(defaultValues)); setErrors({}); }
  }, [open, defaultValues]);

  const set = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const computedEMI = useMemo(() => {
    const p = parseFloat(form.principalAmount) || 0;
    const r = (parseFloat(form.interestRate) || 0) / 100 / 12;
    const n = parseFloat(form.totalEmi) || 1;
    if (p > 0 && r > 0 && n > 0) {
      const emi = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      return Math.round(emi * 100) / 100;
    }
    return 0;
  }, [form.principalAmount, form.interestRate, form.totalEmi]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Loan name is required';
    const principal = parseFloat(form.principalAmount);
    if (isNaN(principal) || principal <= 0) errs.principalAmount = 'Enter a valid amount';
    const totalEmi = parseInt(form.totalEmi);
    if (isNaN(totalEmi) || totalEmi <= 0) errs.totalEmi = 'Enter number of EMIs';
    if (!form.startDate) errs.startDate = 'Start date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const name = stripHtml(form.name).trim().slice(0, 100);
      const principal = parseFloat(form.principalAmount);
      const totalEmi = parseInt(form.totalEmi);
      const interestRate = parseFloat(form.interestRate) || 0;
      let emiAmount = parseFloat(form.emiAmount);
      if (isNaN(emiAmount) || emiAmount <= 0) {
        const computed = interestRate > 0 ? computedEMI : 0;
        if (computed > 0) {
          emiAmount = computed;
        } else {
          throw new Error(interestRate === 0
            ? 'Please enter an EMI amount or an interest rate to calculate it'
            : 'Please enter an EMI amount');
        }
      }
      const outstanding = parseFloat(form.outstandingBalance);
      const finalOutstanding = !isNaN(outstanding) && outstanding > 0 ? outstanding : principal;
      const startDate = new Date(form.startDate);
      const emiDay = parseInt(form.emiDay);
      const validEmiDay = emiDay >= 1 && emiDay <= 31 ? emiDay : 0;
      const nextEmiDate = new Date(startDate);
      if (validEmiDay) {
        nextEmiDate.setDate(validEmiDay);
        if (nextEmiDate < startDate) nextEmiDate.setMonth(nextEmiDate.getMonth() + 1);
      }
      if (!defaultValues) {
        while (nextEmiDate <= new Date()) nextEmiDate.setMonth(nextEmiDate.getMonth() + 1);
      }
      const notes = stripHtml(form.notes || '').trim().slice(0, 500);
      await onSubmit({
        name, principalAmount: principal, interestRate, emiAmount,
        paidEmi: defaultValues?.paidEmi ?? 0, totalEmi, outstandingBalance: finalOutstanding,
        startDate, status: defaultValues?.status ?? 'active',
        paymentHistory: defaultValues?.paymentHistory ?? [], nextEmiDate,
        ...(validEmiDay ? { emiDay: validEmiDay } : {}),
        ...(notes ? { notes } : {}),
      });
      onOpenChange(false);
      toast.success(defaultValues ? 'Loan updated' : 'Loan added');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save loan';
      console.error('[LoanDialog] Submit failed:', message, error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={defaultValues ? 'Edit Loan' : 'Add Loan / EMI'}
      description="Track your loans and EMIs."
      loading={loading}
      submitLabel={loading ? 'Saving...' : defaultValues ? 'Update' : 'Add Loan'}
      onSubmit={handleSubmit}
      onCancel={() => onOpenChange(false)}
    >
      <FormField label="Loan Name" htmlFor="name" required error={errors.name}>
        <Input id="name" placeholder="Home Loan, Car Loan, ..." value={form.name} onChange={(e) => set('name', e.target.value)}
          data-autofocus aria-invalid={!!errors.name} className={cn(errors.name && 'border-destructive')} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Principal Amount" htmlFor="principalAmount" required error={errors.principalAmount}>
          <Input id="principalAmount" type="number" step="0.01" min="0" placeholder="0.00" value={form.principalAmount} onChange={(e) => set('principalAmount', e.target.value)}
            aria-invalid={!!errors.principalAmount} className={cn(errors.principalAmount && 'border-destructive')} />
        </FormField>
        <FormField label="Interest Rate (%)" htmlFor="interestRate">
          <Input id="interestRate" type="number" step="0.01" min="0" placeholder="0" value={form.interestRate} onChange={(e) => set('interestRate', e.target.value)} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="EMI Amount" htmlFor="emiAmount" charCount={{ current: computedEMI > 0 && !form.emiAmount ? computedEMI.toFixed(2).length : 0, max: 0 }}>
          <Input id="emiAmount" type="number" step="0.01" min="0" placeholder={computedEMI ? computedEMI.toFixed(2) : '0.00'} value={form.emiAmount} onChange={(e) => set('emiAmount', e.target.value)} />
          {computedEMI > 0 && !form.emiAmount && (
            <p className="text-[10px] text-muted-foreground">Calculated: {computedEMI.toFixed(2)}</p>
          )}
        </FormField>
        <FormField label="Total EMI" htmlFor="totalEmi" required error={errors.totalEmi}>
          <Input id="totalEmi" type="number" min="1" placeholder="60" value={form.totalEmi} onChange={(e) => set('totalEmi', e.target.value)}
            aria-invalid={!!errors.totalEmi} className={cn(errors.totalEmi && 'border-destructive')} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Outstanding Balance" htmlFor="outstandingBalance">
          <Input id="outstandingBalance" type="number" step="0.01" min="0" placeholder="Same as principal" value={form.outstandingBalance} onChange={(e) => set('outstandingBalance', e.target.value)} />
        </FormField>
        <FormField label="Start Date" htmlFor="startDate" required error={errors.startDate}>
          <Input id="startDate" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)}
            aria-invalid={!!errors.startDate} className={cn(errors.startDate && 'border-destructive')} />
        </FormField>
      </div>

      <FormField label="EMI Due Day" htmlFor="emiDay">
        <Input id="emiDay" type="number" min="1" max="31" placeholder="Day of month (leave empty for start date day)" value={form.emiDay} onChange={(e) => set('emiDay', e.target.value)} />
      </FormField>

      <FormField label="Notes" htmlFor="notes" charCount={{ current: form.notes.length, max: 500 }}>
        <Input id="notes" placeholder="Add a note..." value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      </FormField>
    </UniversalFormDialog>
  );
}
