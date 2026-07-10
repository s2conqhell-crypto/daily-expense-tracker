'use client';

import { useState, useEffect, useCallback } from 'react';
import { firebaseService } from '@/firebase/services';
import { useAuth } from '@/contexts/AuthContext';
import type { Income } from '@/types';
import toast from 'react-hot-toast';

export function useIncome() {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = firebaseService.income.subscribe(user.uid, (data) => {
      setIncomes(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const addIncome = useCallback(async (data: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Not authenticated');
    const id = await firebaseService.income.add(user.uid, data);
    toast.success('Income added');
    return id;
  }, [user]);

  const updateIncome = useCallback(async (incomeId: string, data: Partial<Income>) => {
    await firebaseService.income.update(incomeId, data);
    toast.success('Income updated');
  }, []);

  const deleteIncome = useCallback(async (incomeId: string) => {
    await firebaseService.income.delete(incomeId);
    toast.success('Income deleted');
  }, []);

  const duplicateIncome = useCallback(async (incomeId: string) => {
    await firebaseService.income.duplicate(incomeId);
    toast.success('Income duplicated');
  }, []);

  const toggleFavoriteIncome = useCallback(async (incomeId: string, isFavorite: boolean) => {
    await firebaseService.income.update(incomeId, { isFavorite });
    toast.success(isFavorite ? 'Marked as favorite' : 'Removed from favorites');
  }, []);

  return { incomes, loading, error, addIncome, updateIncome, deleteIncome, duplicateIncome, toggleFavoriteIncome };
}
