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
        className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-2xl bg-gradient-to-br from-[#8B6FFF] to-[#00D09C] shadow-xl shadow-[#8B6FFF]/30 flex items-center justify-center"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Quick actions"
      >
        <Plus className="h-6 w-6 text-white" />
      </motion.button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="bg-[#141822] border-t border-white/[0.08] rounded-t-2xl px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-5 shadow-2xl shadow-black/40">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-white text-center text-base font-bold">Quick Actions</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-4 gap-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => { setOpen(false); action.onClick(); }}
                  className="touch-target flex-col gap-2 rounded-2xl py-4 px-2 bg-white/5 hover:bg-white/10 transition-all active:scale-95"
                >
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: action.color + '20' }}>
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
