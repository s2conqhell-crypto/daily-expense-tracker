'use client';
import { memo } from 'react';

interface MobileLoadingSkeletonProps {
  count?: number;
  type?: 'card' | 'stat' | 'list' | 'chart';
}

export const MobileLoadingSkeleton = memo(function MobileLoadingSkeleton({
  count = 3, type = 'card',
}: MobileLoadingSkeletonProps) {
  if (type === 'stat') {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-4">
            <div className="h-8 w-8 bg-white/5 rounded-lg animate-pulse mb-2" />
            <div className="h-6 w-20 bg-white/5 rounded animate-pulse mb-1" />
            <div className="h-3 w-14 bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-5">
        <div className="h-5 w-32 bg-white/5 rounded animate-pulse mb-4" />
        <div className="h-[140px] bg-white/5 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 bg-[#161a27] rounded-[16px] border border-white/[0.06] p-4">
            <div className="h-10 w-10 rounded-xl bg-white/5 shrink-0 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/5 bg-white/5 rounded animate-pulse" />
              <div className="h-3 w-2/5 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="h-5 w-16 bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[#161a27] rounded-[16px] border border-white/[0.06] p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/5 shrink-0 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/5 bg-white/5 rounded animate-pulse" />
              <div className="h-3 w-2/5 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="h-5 w-16 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
});
