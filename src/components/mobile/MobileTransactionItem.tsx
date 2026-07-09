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
  const leftDrag = useTransform(x, [-100, 0], [0, 1]);
  const rightDrag = useTransform(x, [0, 100], [0, 1]);
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
    <div className="relative overflow-hidden rounded-xl">
      {/* Background actions */}
      <div className="absolute inset-0 flex">
        {onEdit && (
          <div className="flex-1 bg-[#8B6FFF] flex items-center justify-center rounded-l-xl">
            <Pencil className="h-5 w-5 text-white" />
          </div>
        )}
        {onDelete && (
          <div className="flex-1 bg-[#FF5A6E] flex items-center justify-center rounded-r-xl">
            <Trash2 className="h-5 w-5 text-white" />
          </div>
        )}
      </div>

      <motion.div
        className="relative bg-[#141822] border border-white/[0.06] rounded-xl px-4 py-3"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + '15' }}>
              {isIncome ? <TrendingUp className="h-4 w-4" style={{ color }} /> : <TrendingDown className="h-4 w-4" style={{ color }} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-white truncate">{description}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {category && (
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-white/5 text-[#8899AA]">{category}</span>
                )}
                <span className="text-[10px] text-[#5A6B7D]">{formatDate(toDate(date))}</span>
              </div>
            </div>
          </div>
          <span className={`text-[14px] font-extrabold shrink-0 ml-2 ${isIncome ? 'text-[#00D09C]' : 'text-[#FF5A6E]'}`}>
            {isIncome ? '+' : '-'}{formatCurrency(amount, currency)}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
