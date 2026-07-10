'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, TrendingDown, ArrowUpFromLine, PiggyBank, Repeat, Target, Wallet, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';

interface FABAction {
  id: string;
  label: string;
  icon: typeof TrendingDown;
  color: string;
  onClick: () => void;
}

interface MobileFABProps {
  actions: FABAction[];
}

export function MobileFAB({ actions }: MobileFABProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.button
            key="fab"
            className="fixed z-50 flex h-16 w-16 items-center justify-center rounded-full gradient-primary text-white active:scale-90"
            style={{
              bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))',
              right: '20px',
              boxShadow: '0 8px 32px rgba(124, 92, 255, 0.35), 0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Quick actions"
          >
            <Plus className="h-7 w-7 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
 
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="px-4 pt-5 shadow-2xl shadow-black/40"
          style={{
            backgroundColor: 'rgba(9, 9, 11, 0.95)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '28px 28px 0 0',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
          }}
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-[17px] font-bold text-white text-center">Quick Actions</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-4 gap-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <SheetClose asChild key={action.id}>
                  <button
                    onClick={action.onClick}
                    className="touch-target flex-col gap-2 rounded-2xl py-4 px-1 bg-white/5 hover:bg-white/10 transition-all active:scale-95"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl mx-auto" style={{ backgroundColor: action.color + '18' }}>
                      <Icon className="h-5 w-5" style={{ color: action.color }} />
                    </div>
                    <span className="text-[10px] font-medium text-[#6b7b8d] text-center leading-tight">{action.label}</span>
                  </button>
                </SheetClose>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
