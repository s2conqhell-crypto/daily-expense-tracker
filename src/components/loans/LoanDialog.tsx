'use client';

import { useState, useEffect, useMemo } from 'react';
import { UniversalFormDialog } from '@/components/shared';
import { CurrencyInput, FormInput, FormDatePicker, FormTextarea, FormSection } from '@/components/ui/forms';
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
      <FormInput
        id="name"
        label="Loan Name"
        placeholder="Home Loan, Car Loan, ..."
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
        error={errors.name}
        required
        data-autofocus
      />

      <CurrencyInput
        id="principalAmount"
        label="Principal Amount"
        value={form.principalAmount}
        onChange={(v) => set('principalAmount', v)}
        error={errors.principalAmount}
        required
      />

      <FormInput
        id="interestRate"
        label="Interest Rate (%)"
        type="number"
        step="0.01"
        min="0"
        placeholder="0"
        value={form.interestRate}
        onChange={(e) => set('interestRate', e.target.value)}
        helperText="Leave at 0 if unknown. EMI can be entered manually."
      />

      <FormSection title="Repayment Details">
        <CurrencyInput
          id="emiAmount"
          label="EMI Amount"
          value={form.emiAmount}
          onChange={(v) => set('emiAmount', v)}
          placeholder={computedEMI ? computedEMI.toFixed(2) : '0.00'}
        />
        {computedEMI > 0 && !form.emiAmount && (
          <p className="text-[12px] text-[#7c5cff] -mt-2">Calculated EMI: {computedEMI.toFixed(2)}</p>
        )}

        <FormInput
          id="totalEmi"
          label="Total Number of EMIs"
          type="number"
          min="1"
          placeholder="60"
          value={form.totalEmi}
          onChange={(e) => set('totalEmi', e.target.value)}
          error={errors.totalEmi}
          required
        />

        <CurrencyInput
          id="outstandingBalance"
          label="Outstanding Balance"
          value={form.outstandingBalance}
          onChange={(v) => set('outstandingBalance', v)}
          placeholder="Same as principal"
        />
      </FormSection>

      <FormSection title="Schedule">
        <FormDatePicker
          id="startDate"
          label="Start Date"
          value={form.startDate}
          onChange={(v) => set('startDate', v)}
          error={errors.startDate}
          required
        />

        <FormInput
          id="emiDay"
          label="EMI Due Day"
          type="number"
          min="1"
          max="31"
          placeholder="Day of month (leave empty for start date day)"
          value={form.emiDay}
          onChange={(e) => set('emiDay', e.target.value)}
        />
      </FormSection>

      <FormTextarea
        id="notes"
        label="Notes"
        placeholder="Add a note..."
        value={form.notes}
        onChange={(e) => set('notes', e.target.value)}
        charCount={{ current: form.notes.length, max: 500 }}
        hideCharUntilTyping
      />
    </UniversalFormDialog>
  );
}
