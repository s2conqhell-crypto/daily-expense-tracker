'use client';

import { useState, useRef } from 'react';
import { TrendingUp, TrendingDown, Trash2, Pencil } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/format';
import { toDate } from '@/utils/helpers';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

interface MobileTransactionItemProps {
  description: string;
  amount: number;
  date: any;
  type: 'expense' | 'income';
  category?: string;
  currency?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MobileTransactionItem({
  description, amount, date, type, category, currency, onEdit, onDelete,
}: MobileTransactionItemProps) {
  const [swiped, setSwiped] = useState<'left' | 'right' | null>(null);
  const x = useMotionValue(0);
  const isIncome = type === 'income';
  const color = isIncome ? '#00D09C' : '#FF5A6E';

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < -80 && onDelete) {
      setSwiped('left');
      setTimeout(() => onDelete(), 200);
    } else if (info.offset.x > 80 && onEdit) {
      setSwiped('right');
      setTimeout(() => onEdit(), 200);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[16px]">
      <div className="absolute inset-0 flex">
        {onEdit && (
          <div className="flex-1 bg-[#8B6FFF] flex items-center justify-center rounded-l-[16px]">
            <Pencil className="h-5 w-5 text-white" />
          </div>
        )}
        {onDelete && (
          <div className="flex-1 bg-[#FF5A6E] flex items-center justify-center rounded-r-[16px]">
            <Trash2 className="h-5 w-5 text-white" />
          </div>
        )}
      </div>

      <motion.div
        className="relative bg-[#12142a] border border-white/[0.06] rounded-[16px] px-4 py-[14px] card-shadow"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.98 }}
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
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-[#8899AA]">{category}</span>
                )}
                <span className="text-[11px] text-[#5A6B7D]">{formatDate(toDate(date))}</span>
              </div>
            </div>
          </div>
          <span className={`text-[15px] font-bold shrink-0 ml-3 ${isIncome ? 'text-[#00D09C]' : 'text-[#FF5A6E]'}`}>
            {isIncome ? '+' : '-'}{formatCurrency(amount, currency)}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
