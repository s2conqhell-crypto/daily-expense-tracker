'use client';

import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { useIsMobile } from '@/hooks/useMediaQuery';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar />
      <Header />
      <div className={`${!isMobile ? 'ml-[240px]' : ''} transition-all duration-300`}>
        <main className={`${isMobile ? 'pb-[calc(64px+env(safe-area-inset-bottom,0px))] pt-[calc(56px+env(safe-area-inset-top,0px))]' : 'pt-6'} min-h-dvh`}>
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
        </main>
      </div>
      {isMobile && <BottomNav />}
    </div>
  );
}
