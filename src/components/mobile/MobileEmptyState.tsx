'use client';
import { memo, ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface MobileEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const MobileEmptyState = memo(function MobileEmptyState({
  icon, title, description, action,
}: MobileEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 bg-[#161a27] rounded-[20px] border border-white/[0.06]">
      <div className="mb-3 text-white/10">
        {icon || <Inbox className="h-12 w-12" />}
      </div>
      <p className="m-text-body-bold text-white mb-1">{title}</p>
      {description && <p className="m-text-caption text-[#6b7b8d] mb-4 text-center max-w-[240px]">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
});
