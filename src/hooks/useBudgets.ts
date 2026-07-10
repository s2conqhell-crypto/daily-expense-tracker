'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { firebaseService } from '@/firebase/services';
import { useAuth } from '@/contexts/AuthContext';
import type { Budget, Expense } from '@/types';
import { calculateBudgetSpent } from '@/utils/budget';
import toast from 'react-hot-toast';

export function useBudgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const unsubBudgets = firebaseService.budgets.subscribe(user.uid, (data) => {
      setBudgets(data.filter((b) => b.month === currentMonth && b.year === currentYear));
      setLoading(false);
    });

    const unsubExpenses = firebaseService.expenses.subscribe(user.uid, (data) => {
      setExpenses(data);
    });

    return () => { unsubBudgets(); unsubExpenses(); };
  }, [user]);

  const budgetsWithSpent = useMemo(() =>
    budgets.map((budget) => ({
      ...budget,
      spent: calculateBudgetSpent(budget, expenses),
    })),
    [budgets, expenses]
  );

  const createBudget = useCallback(async (data: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Not authenticated');
    const id = await firebaseService.budgets.create(user.uid, data);
    toast.success('Budget created');
    return id;
  }, [user]);

  const updateBudget = useCallback(async (budgetId: string, data: Partial<Budget>) => {
    await firebaseService.budgets.update(budgetId, data);
    toast.success('Budget updated');
  }, []);

  const deleteBudget = useCallback(async (budgetId: string) => {
    await firebaseService.budgets.delete(budgetId);
    toast.success('Budget deleted');
  }, []);

  return { budgets: budgetsWithSpent, loading, createBudget, updateBudget, deleteBudget };
}
