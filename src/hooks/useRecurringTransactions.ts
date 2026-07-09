'use client';

import { useState, useEffect, useCallback } from 'react';
import { firebaseService } from '@/firebase/services';
import { useAuth } from '@/contexts/AuthContext';
import type { RecurringTransaction } from '@/types';

export function useRecurringTransactions() {
  const { user } = useAuth();
  const [rules, setRules] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const unsub = firebaseService.recurringTransactions.subscribe(user.uid, (data) => {
      setRules(data.filter((r) => r.isActive));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const addRule = useCallback(async (data: Omit<RecurringTransaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Not authenticated');
    await firebaseService.recurringTransactions.add(user.uid, data);
  }, [user]);

  const updateRule = useCallback(async (ruleId: string, data: Partial<RecurringTransaction>) => {
    await firebaseService.recurringTransactions.update(ruleId, data);
  }, []);

  const deleteRule = useCallback(async (ruleId: string) => {
    await firebaseService.recurringTransactions.delete(ruleId);
  }, []);

  const toggleRule = useCallback(async (ruleId: string, isActive: boolean) => {
    await firebaseService.recurringTransactions.update(ruleId, { isActive } as Partial<RecurringTransaction>);
  }, []);

  const skipNext = useCallback(async (rule: RecurringTransaction) => {
    const now = new Date();
    let next = new Date(rule.nextExecution);
    switch (rule.interval) {
      case 'daily': next.setDate(next.getDate() + 1); break;
      case 'weekly': next.setDate(next.getDate() + 7); break;
      case 'monthly': next.setMonth(next.getMonth() + 1); break;
      case 'yearly': next.setFullYear(next.getFullYear() + 1); break;
    }
    await firebaseService.recurringTransactions.update(rule.id, { nextExecution: next } as Partial<RecurringTransaction>);
  }, []);

  const processDueRules = useCallback(async () => {
    if (!user) return;
    const allRules = await firebaseService.recurringTransactions.getAll(user.uid);
    const now = new Date();
    const due = allRules.filter((r) => r.isActive && new Date(r.nextExecution) <= now);

    for (const rule of due) {
      try {
        if (rule.type === 'expense') {
          await firebaseService.expenses.add(user.uid, {
            amount: rule.amount,
            category: rule.category || 'Other',
            description: rule.description,
            notes: rule.notes,
            paymentMethod: rule.paymentMethod,
            expenseDate: now,
            tags: [],
            isRecurring: true,
            recurringInterval: rule.interval,
            isFavorite: false,
          } as any);
        } else {
          await firebaseService.income.add(user.uid, {
            amount: rule.amount,
            source: rule.source || 'Other',
            description: rule.description,
            notes: rule.notes,
            paymentMethod: rule.paymentMethod,
            incomeDate: now,
            tags: [],
            isRecurring: true,
            recurringInterval: rule.interval,
            isFavorite: false,
          } as any);
        }

        let next = new Date(rule.nextExecution);
        switch (rule.interval) {
          case 'daily': next.setDate(next.getDate() + 1); break;
          case 'weekly': next.setDate(next.getDate() + 7); break;
          case 'monthly': next.setMonth(next.getMonth() + 1); break;
          case 'yearly': next.setFullYear(next.getFullYear() + 1); break;
        }

        const nowMs = Date.now();
        while (next <= new Date(nowMs)) {
          switch (rule.interval) {
            case 'daily': next.setDate(next.getDate() + 1); break;
            case 'weekly': next.setDate(next.getDate() + 7); break;
            case 'monthly': next.setMonth(next.getMonth() + 1); break;
            case 'yearly': next.setFullYear(next.getFullYear() + 1); break;
          }
        }

        await firebaseService.recurringTransactions.update(rule.id, {
          nextExecution: next,
          lastExecuted: now,
        } as Partial<RecurringTransaction>);
      } catch (e) {
        console.error('Failed to process recurring rule', rule.id, e);
      }
    }
  }, [user]);

  const upcoming = rules
    .filter((r) => r.isActive)
    .sort((a, b) => new Date(a.nextExecution).getTime() - new Date(b.nextExecution).getTime())
    .slice(0, 5);

  return { rules, upcoming, loading, error, addRule, updateRule, deleteRule, toggleRule, skipNext, processDueRules };
}