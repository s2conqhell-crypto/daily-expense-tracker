'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { firebaseService } from '@/firebase/services';
import { useAuth } from '@/contexts/AuthContext';
import type { Loan, LoanPayment } from '@/types';
import toast from 'react-hot-toast';

export function useLoans() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const unsub = firebaseService.loans.subscribe(user.uid, (data) => {
      setLoans(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const addLoan = useCallback(async (data: Omit<Loan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Not authenticated');
    await firebaseService.loans.add(user.uid, data);
    toast.success('Loan added');
  }, [user]);

  const updateLoan = useCallback(async (loanId: string, data: Partial<Loan>) => {
    await firebaseService.loans.update(loanId, data);
    toast.success('Loan updated');
  }, []);

  const deleteLoan = useCallback(async (loanId: string) => {
    await firebaseService.loans.delete(loanId);
    toast.success('Loan deleted');
  }, []);

  const recordPayment = useCallback(async (loanId: string, payment: LoanPayment) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) throw new Error('Loan not found');

    const newPaidEmi = loan.paidEmi + 1;
    const newOutstanding = Math.max(0, loan.outstandingBalance - payment.amount);
    const newHistory = [...loan.paymentHistory, payment];
    const isCompleted = newPaidEmi >= loan.totalEmi || newOutstanding <= 0;

    const nextEmi = new Date(loan.nextEmiDate || loan.startDate);
    const targetDay = loan.emiDay || nextEmi.getDate();
    nextEmi.setMonth(nextEmi.getMonth() + 1);
    const lastDay = new Date(nextEmi.getFullYear(), nextEmi.getMonth() + 1, 0).getDate();
    nextEmi.setDate(Math.min(targetDay, lastDay));

    await firebaseService.loans.update(loanId, {
      paidEmi: newPaidEmi,
      outstandingBalance: newOutstanding,
      paymentHistory: newHistory,
      status: isCompleted ? 'completed' : 'active',
      ...(isCompleted ? {} : { nextEmiDate: nextEmi }),
      ...(isCompleted ? { endDate: new Date() } : {}),
    } as Partial<Loan>);
    toast.success('Payment recorded');
  }, [loans]);

  const activeLoans = useMemo(() => loans.filter((l) => l.status === 'active'), [loans]);

  const totalOutstanding = useMemo(() =>
    activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0),
  [activeLoans]);

  const upcomingEmis = useMemo(() => {
    const now = new Date();
    const next30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return activeLoans
      .filter((l) => l.nextEmiDate && new Date(l.nextEmiDate) >= now && new Date(l.nextEmiDate) <= next30)
      .sort((a, b) => new Date(a.nextEmiDate!).getTime() - new Date(b.nextEmiDate!).getTime());
  }, [activeLoans]);

  const totalEmiPerMonth = useMemo(() =>
    activeLoans.reduce((sum, l) => sum + l.emiAmount, 0),
  [activeLoans]);

  return {
    loans, loading, error,
    activeLoans, totalOutstanding, upcomingEmis, totalEmiPerMonth,
    addLoan, updateLoan, deleteLoan, recordPayment,
  };
}