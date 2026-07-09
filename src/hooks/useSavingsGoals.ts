'use client';

import { useState, useEffect, useCallback } from 'react';
import { firebaseService } from '@/firebase/services';
import { useAuth } from '@/contexts/AuthContext';
import type { SavingGoal } from '@/types';

export function useSavingsGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = firebaseService.savingGoals.subscribe(user.uid, (data) => {
      setGoals(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const createGoal = useCallback(async (data: Omit<SavingGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Not authenticated');
    return firebaseService.savingGoals.create(user.uid, data);
  }, [user]);

  const updateGoal = useCallback(async (goalId: string, data: Partial<SavingGoal>) => {
    return firebaseService.savingGoals.update(goalId, data);
  }, []);

  const deleteGoal = useCallback(async (goalId: string) => {
    return firebaseService.savingGoals.delete(goalId);
  }, []);

  return { goals, loading, createGoal, updateGoal, deleteGoal };
}
