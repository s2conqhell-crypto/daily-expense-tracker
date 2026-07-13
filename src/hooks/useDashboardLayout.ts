'use client';

import { useState, useEffect, useCallback } from 'react';
import { firebaseService } from '@/firebase/services';
import { useAuth } from '@/contexts/AuthContext';
import type { DashboardLayout, DashboardWidget } from '@/types';
import { WIDGET_IDS } from '@/constants';

const defaultWidgets: DashboardWidget[] = WIDGET_IDS.map((id, i) => ({
  id,
  visible: true,
  order: i,
  pinned: false,
}));

export function useDashboardLayout() {
  const { user } = useAuth();
  const [layout, setLayout] = useState<DashboardLayout>({ widgets: defaultWidgets });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!user) { setLoading(false); return; }
    setLoading(true);
    firebaseService.dashboardLayout.get(user.uid).then((data) => {
      if (data) {
        const merged = defaultWidgets.map((dw) => {
          const existing = data.widgets.find((w: DashboardWidget) => w.id === dw.id);
          return existing || dw;
        });
        setLayout({ widgets: merged });
      }
      setLoading(false);
    });
  }, [user]);

  const saveLayout = useCallback(async (newLayout: DashboardLayout) => {
    setLayout(newLayout);
    if (user) {
      await firebaseService.dashboardLayout.update(user.uid, newLayout);
    }
  }, [user]);

  const toggleWidget = useCallback((widgetId: string) => {
    setLayout((prev) => {
      const updated = prev.widgets.map((w) =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      );
      const newLayout = { widgets: updated };
      if (user) firebaseService.dashboardLayout.update(user.uid, newLayout);
      return newLayout;
    });
  }, [user]);

  const reorderWidgets = useCallback((widgetIds: string[]) => {
    setLayout((prev) => {
      const updated = widgetIds.map((id, i) => {
        const existing = prev.widgets.find((w) => w.id === id);
        return existing ? { ...existing, order: i } : { id, visible: true, order: i, pinned: false };
      });
      const newLayout = { widgets: updated };
      if (user) firebaseService.dashboardLayout.update(user.uid, newLayout);
      return newLayout;
    });
  }, [user]);

  const togglePin = useCallback((widgetId: string) => {
    setLayout((prev) => {
      const updated = prev.widgets.map((w) =>
        w.id === widgetId ? { ...w, pinned: !w.pinned } : w
      );
      const newLayout = { widgets: updated };
      if (user) firebaseService.dashboardLayout.update(user.uid, newLayout);
      return newLayout;
    });
  }, [user]);

  const visibleWidgets = layout.widgets
    .filter((w) => w.visible)
    .sort((a, b) => a.order - b.order);

  return { layout, loading, visibleWidgets, saveLayout, toggleWidget, reorderWidgets, togglePin };
}