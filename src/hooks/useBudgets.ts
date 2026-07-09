'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { firebaseService } from '@/firebase/services';
import { useAuth } from '@/contexts/AuthContext';
import type { Budget, Expense } from '@/types';
import { calculateBudgetSpent } from '@/utils/budget';

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
    return firebaseService.budgets.create(user.uid, data);
  }, [user]);

  const updateBudget = useCallback(async (budgetId: string, data: Partial<Budget>) => {
    return firebaseService.budgets.update(budgetId, data);
  }, []);

  const deleteBudget = useCallback(async (budgetId: string) => {
    return firebaseService.budgets.delete(budgetId);
  }, []);

  return { budgets: budgetsWithSpent, loading, createBudget, updateBudget, deleteBudget };
}
