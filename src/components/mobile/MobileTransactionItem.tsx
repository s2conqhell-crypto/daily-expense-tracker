'use client';

import { useState, useRef } from 'react';
import {
  TrendingUp, TrendingDown, MoreVertical,
  Pencil, Trash2, Copy, Star, Share2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/format';
import { toDate } from '@/utils/helpers';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { motion } from 'framer-motion';

interface MobileTransactionItemProps {
  description: string;
  amount: number;
  date: any;
  type: 'expense' | 'income';
  category?: string;
  currency?: string;
  isFavorite?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onToggleFavorite?: () => void;
  onShare?: () => void;
}

export function MobileTransactionItem({
  description, amount, date, type, category, currency, isFavorite, onEdit, onDelete, onDuplicate, onToggleFavorite, onShare,
}: MobileTransactionItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isIncome = type === 'income';
  const color = isIncome ? '#00d09c' : '#ff5a7a';
  const constraintsRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={constraintsRef} className="relative overflow-hidden rounded-[16px]">
        {/* Swipe action backgrounds */}
        <div className="absolute inset-y-0 left-0 flex items-center justify-start pl-5 w-full bg-[#7c5cff] rounded-[16px]">
          <div className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-white" />
            <span className="text-[13px] font-semibold text-white">Edit</span>
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center justify-end pr-5 w-full bg-[#ff5a7a] rounded-[16px]">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-white">Delete</span>
            <Trash2 className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Card */}
        <motion.div
          drag="x"
          dragConstraints={constraintsRef}
          dragElastic={{ left: 0.3, right: 0.3 }}
          dragDirectionLock
          whileDrag={{ scale: 0.98 }}
          onDragEnd={(_, info) => {
            const offset = info.offset.x;
            if (offset > 50) {
              onEdit?.();
            } else if (offset < -50) {
              onDelete?.();
            }
          }}
          className="relative bg-[#161a27] border border-white/[0.06] px-4 py-[14px] card-shadow active:scale-[0.98] transition-all rounded-[16px]"
          style={{ touchAction: 'pan-y' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0" style={{ backgroundColor: color + '15' }}>
                {isIncome ? <TrendingUp className="h-[18px] w-[18px]" style={{ color }} /> : <TrendingDown className="h-[18px] w-[18px]" style={{ color }} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-white truncate">{description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {category && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-[#6b7b8d]">{category}</span>
                  )}
                  <span className="text-[10px] text-[#6b7b8d] font-medium">{formatDate(toDate(date))}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <span className={`text-[15px] font-bold ${isIncome ? 'text-[#00d09c]' : 'text-[#ff5a7a]'}`}>
                {isIncome ? '+' : '-'}{formatCurrency(amount, currency)}
              </span>
              <button
                onClick={() => setMenuOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-[#6b7b8d] hover:bg-white/5 active:scale-90 transition-all"
                aria-label="More actions"
              >
                <MoreVertical className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="bottom"
          className="bg-[#09090b] border-t border-white/[0.06] rounded-t-[28px] px-4 pt-5 shadow-2xl shadow-black/40"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
        >
          <div className="flex items-center gap-3.5 mb-4 pb-4 border-b border-white/[0.06]">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl shrink-0" style={{ backgroundColor: color + '15' }}>
              {isIncome ? <TrendingUp className="h-5 w-5" style={{ color }} /> : <TrendingDown className="h-5 w-5" style={{ color }} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold text-white truncate">{description}</p>
              <p className="text-[12px] text-[#6b7b8d]">{category} &middot; {formatDate(toDate(date))}</p>
            </div>
            <span className={`text-[17px] font-bold shrink-0 ${isIncome ? 'text-[#00d09c]' : 'text-[#ff5a7a]'}`}>
              {isIncome ? '+' : '-'}{formatCurrency(amount, currency)}
            </span>
          </div>
          <div className="space-y-1">
            {[
              { icon: Pencil, label: 'Edit', action: () => { setMenuOpen(false); setTimeout(() => onEdit?.(), 200); }, color: '#7c5cff' },
              { icon: Copy, label: 'Duplicate', action: () => { setMenuOpen(false); setTimeout(() => onDuplicate?.(), 200); }, color: '#3b82f6' },
              { icon: Star, label: isFavorite ? 'Remove from Favorites' : 'Mark as Favorite', action: () => { setMenuOpen(false); setTimeout(() => onToggleFavorite?.(), 200); }, color: '#ffb020' },
              { icon: Share2, label: 'Share', action: () => { setMenuOpen(false); setTimeout(() => onShare?.(), 200); }, color: '#00d09c' },
              { icon: Trash2, label: 'Delete', action: () => { setMenuOpen(false); setTimeout(() => onDelete?.(), 200); }, color: '#ff5a7a' },
            ].map(({ icon: Icon, label, action, color: iconColor }) => (
              <button
                key={label}
                onClick={action}
                className="flex w-full items-center gap-3.5 rounded-[14px] px-3.5 py-3.5 text-white hover:bg-white/5 active:scale-[0.98] transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] shrink-0" style={{ backgroundColor: iconColor + '15' }}>
                  <Icon className="h-[18px] w-[18px]" style={{ color: iconColor }} />
                </div>
                <span className="text-[14px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
