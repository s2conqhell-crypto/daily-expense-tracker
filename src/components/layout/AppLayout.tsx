'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  TrendingDown, ArrowUpFromLine, Target, PiggyBank,
  Repeat, Clock, Landmark,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { MobileFAB } from '@/components/mobile/MobileFAB';
import { ROUTES } from '@/constants';

const fabActions = [
  { id: 'expense', label: 'Add Expense', icon: TrendingDown, color: '#ff5a7a', action: (router: ReturnType<typeof useRouter>) => router.push(ROUTES.EXPENSES + '?add=1') },
  { id: 'income', label: 'Add Income', icon: ArrowUpFromLine, color: '#00d09c', action: (router: ReturnType<typeof useRouter>) => router.push(ROUTES.INCOME + '?add=1') },
  { id: 'budget', label: 'Add Budget', icon: Target, color: '#ffb020', action: (router: ReturnType<typeof useRouter>) => router.push(ROUTES.BUDGETS + '?add=1') },
  { id: 'savings', label: 'Add Savings Goal', icon: PiggyBank, color: '#3b82f6', action: (router: ReturnType<typeof useRouter>) => router.push(ROUTES.SAVINGS + '?add=1') },
  { id: 'loan', label: 'Add Loan', icon: Landmark, color: '#ff5a7a', action: (router: ReturnType<typeof useRouter>) => router.push(ROUTES.LOANS + '?add=1') },
  { id: 'subscription', label: 'Add Subscription', icon: Repeat, color: '#7c5cff', action: (router: ReturnType<typeof useRouter>) => router.push(ROUTES.SUBSCRIPTIONS + '?add=1') },
  { id: 'recurring', label: 'Add Recurring', icon: Clock, color: '#00d09c', action: (router: ReturnType<typeof useRouter>) => router.push(ROUTES.RECURRING + '?add=1') },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
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
      <div className="lg:hidden">
        <MobileFAB actions={fabActions.map(a => ({ ...a, onClick: () => a.action(router) }))} />
      </div>

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
