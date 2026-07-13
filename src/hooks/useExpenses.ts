'use client';

import { useState, useEffect, useCallback } from 'react';
import { firebaseService } from '@/firebase/services';
import { useAuth } from '@/contexts/AuthContext';
import type { Expense, ExpenseFilters, SortOption } from '@/types';
import toast from 'react-hot-toast';

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async (
    filters?: ExpenseFilters,
    sort?: SortOption,
    pageSize?: number
  ) => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await firebaseService.expenses.getAll(user.uid, filters, sort, pageSize);
      setExpenses(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = firebaseService.expenses.subscribe(user.uid, (data) => {
      setExpenses(data);
      setLoading(false);
    }, 100);
    return unsubscribe;
  }, [user]);

  const addExpense = useCallback(async (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Not authenticated');
    const expenseId = await firebaseService.expenses.add(user.uid, data);
    try {
      const { checkBudgetAlerts } = await import('@/utils/budgetAlerts');
      const budgets = await firebaseService.budgets.getAll(user.uid);
      const currentExpenses = [...expenses, { ...data, id: expenseId } as Expense];
      const created = await checkBudgetAlerts(user.uid, budgets, currentExpenses);
      created.forEach((title) => toast(title, { icon: '⚠️', duration: 5000 }));
    } catch (e) { console.warn('[useExpenses] Budget alert check failed', e); }
    return expenseId;
  }, [user, expenses]);

  const updateExpense = useCallback(async (expenseId: string, data: Partial<Expense>) => {
    return firebaseService.expenses.update(expenseId, data);
  }, []);

  const deleteExpense = useCallback(async (expenseId: string) => {
    return firebaseService.expenses.delete(expenseId);
  }, []);

  const duplicateExpense = useCallback(async (expenseId: string) => {
    await firebaseService.expenses.duplicate(expenseId);
    toast.success('Expense duplicated');
  }, []);

  const toggleFavoriteExpense = useCallback(async (expenseId: string, isFavorite: boolean) => {
    await firebaseService.expenses.update(expenseId, { isFavorite });
    toast.success(isFavorite ? 'Marked as favorite' : 'Removed from favorites');
  }, []);

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    duplicateExpense,
    toggleFavoriteExpense,
  };
}
