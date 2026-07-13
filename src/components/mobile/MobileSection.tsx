'use client';
import { memo } from 'react';

interface MobileSectionProps {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const MobileSection = memo(function MobileSection({ title, action, children, className = '' }: MobileSectionProps) {
  return (
    <div className={`m-section ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-3">
          <h2 className="m-text-h2 text-white">{title}</h2>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
});
