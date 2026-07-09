'use client';

import { useState, useEffect, useCallback } from 'react';
import { firebaseService } from '@/firebase/services';
import { useAuth } from '@/contexts/AuthContext';
import type { Income } from '@/types';

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
    return firebaseService.income.add(user.uid, data);
  }, [user]);

  const updateIncome = useCallback(async (incomeId: string, data: Partial<Income>) => {
    return firebaseService.income.update(incomeId, data);
  }, []);

  const deleteIncome = useCallback(async (incomeId: string) => {
    return firebaseService.income.delete(incomeId);
  }, []);

  return { incomes, loading, error, addIncome, updateIncome, deleteIncome };
}
