'use client';
import { memo } from 'react';

interface MobilePageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  right?: React.ReactNode;
}

export const MobilePageHeader = memo(function MobilePageHeader({ title, subtitle, action, right }: MobilePageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <h1 className="m-text-h1 text-white truncate">{title}</h1>
        {subtitle && <p className="m-text-tiny text-[#6b7b8d] mt-0.5">{subtitle}</p>}
      </div>
      {right ? (
        <div className="shrink-0 ml-3">{right}</div>
      ) : action ? (
        <div className="shrink-0 ml-3">{action}</div>
      ) : null}
    </div>
  );
});
