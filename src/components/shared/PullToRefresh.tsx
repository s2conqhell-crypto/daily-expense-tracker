'use client';

import { useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
  threshold?: number;
}

export function PullToRefresh({
  onRefresh,
  children,
  className = '',
  threshold = 80,
}: PullToRefreshProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
      setPullDistance(0);
    }
  }, [refreshing, onRefresh]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence>
        {(pullDistance > 20 || refreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-center py-3"
          >
            {refreshing ? (
              <div className="flex items-center gap-2 text-[#7c5cff]">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-[13px] font-semibold">Refreshing...</span>
              </div>
            ) : (
              <div
                className="flex items-center gap-2 text-[#6b7b8d]"
                style={{ transform: `rotate(${Math.min(pullDistance / threshold * 180, 180)}deg)` }}
              >
                <ArrowDown className="h-5 w-5" />
                <span className="text-[13px] font-medium">
                  {pullDistance > threshold ? 'Release to refresh' : 'Pull to refresh'}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        drag="y"
        dragDirectionLock
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.15, bottom: 0 }}
        onDrag={(_, info) => {
          if (!refreshing) {
            setPullDistance(Math.max(0, info.offset.y));
          }
        }}
        onDragEnd={async (_, info) => {
          if (info.offset.y > threshold && !refreshing) {
            await handleRefresh();
          }
          setPullDistance(0);
        }}
        animate={{ y: refreshing ? 40 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ touchAction: 'pan-x' }}
      >
        {children}
      </motion.div>
    </div>
  );
}
