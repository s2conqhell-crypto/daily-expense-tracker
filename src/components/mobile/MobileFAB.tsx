'use client';

import { useState } from 'react';
import { Plus, TrendingDown, ArrowUpFromLine, PiggyBank, Repeat, Target, Wallet, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

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

  return (
    <>
      <motion.button
        className="fixed z-50 flex h-16 w-16 items-center justify-center rounded-[20px] gradient-primary text-white shadow-2xl active:scale-90"
        style={{
          bottom: 'calc(100px + env(safe-area-inset-bottom, 0px))',
          right: '20px',
          boxShadow: '0 8px 32px rgba(139, 111, 255, 0.35), 0 2px 8px rgba(0, 0, 0, 0.2)',
        }}
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Quick actions"
      >
        <Plus className="h-7 w-7 text-white" />
      </motion.button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="bg-[#0A0C10] border-t border-white/[0.06] rounded-t-3xl px-4 pt-5 pb-0 shadow-2xl shadow-black/40" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
          <SheetHeader className="mb-4">
            <SheetTitle className="text-[17px] font-bold text-white text-center">Quick Actions</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-4 gap-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => { setOpen(false); action.onClick(); }}
                  className="touch-target flex-col gap-2 rounded-2xl py-4 px-1 bg-white/5 hover:bg-white/10 transition-all active:scale-95"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl mx-auto" style={{ backgroundColor: action.color + '18' }}>
                    <Icon className="h-5 w-5" style={{ color: action.color }} />
                  </div>
                  <span className="text-[10px] font-medium text-[#8899AA] text-center leading-tight">{action.label}</span>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
