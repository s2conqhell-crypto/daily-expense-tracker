'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { firebaseService } from '@/firebase/services';
import { useAuth } from '@/contexts/AuthContext';
import type { Subscription } from '@/types';
import toast from 'react-hot-toast';

export function useSubscriptions() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const unsub = firebaseService.subscriptions.subscribe(user.uid, (data) => {
      setSubscriptions(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const addSubscription = useCallback(async (data: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Not authenticated');
    await firebaseService.subscriptions.add(user.uid, data);
    toast.success('Subscription added');
  }, [user]);

  const updateSubscription = useCallback(async (subId: string, data: Partial<Subscription>) => {
    await firebaseService.subscriptions.update(subId, data);
    toast.success('Subscription updated');
  }, []);

  const deleteSubscription = useCallback(async (subId: string) => {
    await firebaseService.subscriptions.delete(subId);
    toast.success('Subscription deleted');
  }, []);

  const toggleStatus = useCallback(async (subId: string, status: 'active' | 'paused' | 'expired') => {
    await firebaseService.subscriptions.update(subId, { status });
    toast.success(`Status updated to ${status}`);
  }, []);

  const activeSubscriptions = useMemo(() => subscriptions.filter((s) => s.status === 'active'), [subscriptions]);
  const totalMonthlyCost = useMemo(() => activeSubscriptions.reduce((sum, s) => sum + s.monthlyCost, 0), [activeSubscriptions]);
  const totalYearlyCost = useMemo(() => activeSubscriptions.reduce((sum, s) => sum + s.yearlyCost, 0), [activeSubscriptions]);

  const upcomingRenewals = useMemo(() => {
    const now = new Date();
    const next30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return subscriptions
      .filter((s) => s.status === 'active' || s.status === 'paused')
      .filter((s) => {
        const renewal = new Date(s.renewalDate);
        return renewal >= now && renewal <= next30;
      })
      .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime());
  }, [subscriptions]);

  return {
    subscriptions, loading, error,
    activeSubscriptions, totalMonthlyCost, totalYearlyCost, upcomingRenewals,
    addSubscription, updateSubscription, deleteSubscription, toggleStatus,
  };
}