'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useAutomation() {
  const { user } = useAuth();
  const lastRunRef = useRef<string>('');
  const midnightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = useCallback(async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    if (lastRunRef.current === today) return;
    lastRunRef.current = today;

    try {
      const { runAutomation } = await import('@/utils/automationEngine');
      await runAutomation(user.uid);
    } catch (e) {
      console.warn('[useAutomation] Run failed', e);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    run();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const now = new Date().toISOString().split('T')[0];
        if (lastRunRef.current !== now) {
          run();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const msUntilMidnight = () => {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
      return midnight.getTime() - now.getTime() + 60000;
    };

    const scheduleMidnight = () => {
      midnightTimerRef.current = setTimeout(() => {
        run();
        scheduleMidnight();
      }, msUntilMidnight());
    };
    scheduleMidnight();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (midnightTimerRef.current) clearTimeout(midnightTimerRef.current);
    };
  }, [user, run]);
}
