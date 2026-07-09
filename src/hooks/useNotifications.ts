'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { firebaseService } from '@/firebase/services';
import { useAuth } from '@/contexts/AuthContext';
import type { Notification } from '@/types';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const unsub = firebaseService.notifications.subscribe(user.uid, (data) => {
      setNotifications(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const markAsRead = useCallback(async (id: string) => {
    await firebaseService.notifications.markAsRead(id);
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    await firebaseService.notifications.markAllAsRead(user.uid);
  }, [user]);

  const deleteNotification = useCallback(async (id: string) => {
    await firebaseService.notifications.delete(id);
  }, []);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
