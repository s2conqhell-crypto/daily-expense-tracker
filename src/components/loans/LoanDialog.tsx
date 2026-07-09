'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { MobileFormSheet } from '@/components/mobile/MobileFormSheet';
import type { Loan } from '@/types';
import { toDate } from '@/utils/helpers';
import toast from 'react-hot-toast';

interface LoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Loan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  defaultValues?: Loan;
}

const defaultForm = (defaults?: Loan) => ({
  name: defaults?.name || '',
  principalAmount: defaults?.principalAmount?.toString() || '',
  interestRate: defaults?.interestRate?.toString() || '0',
  emiAmount: defaults?.emiAmount?.toString() || '',
  totalEmi: defaults?.totalEmi?.toString() || '',
  outstandingBalance: defaults?.outstandingBalance?.toString() || '',
  startDate: defaults?.startDate ? toDate(defaults.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  emiDay: defaults?.emiDay?.toString() || '',
  notes: defaults?.notes || '',
});

export function LoanDialog({ open, onOpenChange, onSubmit, defaultValues }: LoanDialogProps) {
  const [form, setForm] = useState<Record<string, string>>(defaultForm(defaultValues));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setForm(defaultForm(defaultValues));
  }, [open, defaultValues]);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const name = form.name.trim();
      if (!name) throw new Error('Please enter a loan name');

      const principal = parseFloat(form.principalAmount);
      if (isNaN(principal) || principal <= 0) throw new Error('Please enter a valid principal amount');

      const totalEmi = parseInt(form.totalEmi);
      if (isNaN(totalEmi) || totalEmi <= 0) throw new Error('Please enter a valid number of total EMIs');

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
      if (isNaN(startDate.getTime())) throw new Error('Please enter a valid start date');

      const emiDay = parseInt(form.emiDay);
      const validEmiDay = emiDay >= 1 && emiDay <= 31 ? emiDay : 0;

      const nextEmiDate = new Date(startDate);
      if (validEmiDay) {
        nextEmiDate.setDate(validEmiDay);
        if (nextEmiDate < startDate) {
          nextEmiDate.setMonth(nextEmiDate.getMonth() + 1);
        }
      }
      if (!defaultValues) {
        while (nextEmiDate <= new Date()) {
          nextEmiDate.setMonth(nextEmiDate.getMonth() + 1);
        }
      }

      await onSubmit({
        name,
        principalAmount: principal,
        interestRate,
        emiAmount,
        paidEmi: defaultValues?.paidEmi ?? 0,
        totalEmi,
        outstandingBalance: finalOutstanding,
        startDate,
        status: defaultValues?.status ?? 'active',
        paymentHistory: defaultValues?.paymentHistory ?? [],
        nextEmiDate,
        ...(validEmiDay ? { emiDay: validEmiDay } : {}),
        ...(form.notes ? { notes: form.notes } : {}),
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
    <MobileFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={defaultValues ? 'Edit Loan' : 'Add Loan / EMI'}
      description="Track your loans and EMIs."
      loading={loading}
      submitLabel={loading ? 'Saving...' : defaultValues ? 'Update' : 'Add Loan'}
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <Label htmlFor="name">Loan Name</Label>
        <Input id="name" placeholder="Home Loan, Car Loan, ..." value={form.name as string} onChange={(e) => set('name', e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="principalAmount">Principal Amount</Label>
          <Input id="principalAmount" type="number" step="0.01" min="0" placeholder="0.00" value={form.principalAmount as string} onChange={(e) => set('principalAmount', e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="interestRate">Interest Rate (%)</Label>
          <Input id="interestRate" type="number" step="0.01" min="0" placeholder="0" value={form.interestRate as string} onChange={(e) => set('interestRate', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="emiAmount">EMI Amount</Label>
          <Input id="emiAmount" type="number" step="0.01" min="0" placeholder={computedEMI ? computedEMI.toFixed(2) : '0.00'} value={form.emiAmount as string} onChange={(e) => set('emiAmount', e.target.value)} />
          {computedEMI > 0 && !form.emiAmount && (
            <p className="text-[10px] text-muted-foreground">Calculated: {computedEMI.toFixed(2)}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalEmi">Total EMI</Label>
          <Input id="totalEmi" type="number" min="1" placeholder="60" value={form.totalEmi as string} onChange={(e) => set('totalEmi', e.target.value)} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="outstandingBalance">Outstanding Balance</Label>
          <Input id="outstandingBalance" type="number" step="0.01" min="0" placeholder="Same as principal" value={form.outstandingBalance as string} onChange={(e) => set('outstandingBalance', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" type="date" value={form.startDate as string} onChange={(e) => set('startDate', e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emiDay">EMI Due Day</Label>
          <Input id="emiDay" type="number" min="1" max="31" placeholder="Day of month" value={form.emiDay as string} onChange={(e) => set('emiDay', e.target.value)} />
          <p className="text-[10px] text-muted-foreground">Leave empty to use start date day ({new Date(form.startDate).getDate() || '?'})</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input id="notes" placeholder="Add a note..." value={form.notes as string} onChange={(e) => set('notes', e.target.value)} />
      </div>
    </MobileFormSheet>
  );
}