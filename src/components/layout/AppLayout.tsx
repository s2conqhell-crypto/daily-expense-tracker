'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-dvh bg-background">
      <div className="hidden lg:block"><Sidebar /></div>
      <div className="hidden lg:block"><Header /></div>
      <div className="lg:hidden"><MobileHeader /></div>
      <div className="lg:hidden"><MobileBottomNav /></div>

      <div className="lg:ml-[240px] transition-all duration-300">
        <main className="lg:pt-6 min-h-dvh" style={{ paddingBottom: 'calc(90px + env(safe-area-inset-bottom, 0px))' }}>
          {mounted ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div>{children}</div>
          )}
        </main>
      </div>
    </div>
  );
}
