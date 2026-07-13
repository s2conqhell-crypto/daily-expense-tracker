'use client';
import { memo } from 'react';

interface MobilePageProps {
  children: React.ReactNode;
  className?: string;
}

export const MobilePage = memo(function MobilePage({ children, className = '' }: MobilePageProps) {
  return (
    <div className={`px-5 pb-[calc(90px+env(safe-area-inset-bottom,0px))] pt-2 space-y-6 ${className}`}>
      {children}
    </div>
  );
});
