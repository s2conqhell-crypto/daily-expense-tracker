'use client';

import { useState, useEffect, useCallback } from 'react';
import { firebaseService } from '@/firebase/services';
import { useAuth } from '@/contexts/AuthContext';
import type { SavingGoal } from '@/types';
import toast from 'react-hot-toast';

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
    const id = await firebaseService.savingGoals.create(user.uid, data);
    toast.success('Goal created');
    return id;
  }, [user]);

  const updateGoal = useCallback(async (goalId: string, data: Partial<SavingGoal>) => {
    await firebaseService.savingGoals.update(goalId, data);
    toast.success('Goal updated');
  }, []);

  const deleteGoal = useCallback(async (goalId: string) => {
    await firebaseService.savingGoals.delete(goalId);
    toast.success('Goal deleted');
  }, []);

  return { goals, loading, createGoal, updateGoal, deleteGoal };
}
