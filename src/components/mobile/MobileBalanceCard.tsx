'use client';

import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { AnimatedCounter } from '@/components/shared';
import { formatCurrency } from '@/utils/format';

interface MobileBalanceCardProps {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  currency?: string;
  loading?: boolean;
}

export function MobileBalanceCard({ currentBalance, totalIncome, totalExpenses, savings, currency, loading }: MobileBalanceCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#6B4FF5] via-[#7C5CFF] to-[#00D09C]/40 px-5 py-4 shadow-lg shadow-[#7C5CFF]/10">
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.03] rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#00D09C]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Wallet className="h-3.5 w-3.5 text-white/50" />
          <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wider">Current Balance</span>
        </div>
        {loading ? (
          <div className="h-8 w-36 bg-white/10 rounded-lg animate-pulse" />
        ) : (
          <p className="text-[26px] font-extrabold text-white tracking-tight">
            <AnimatedCounter value={currentBalance} formatter={(v) => formatCurrency(v, currency)} />
          </p>
        )}
        <div className="flex items-center gap-5 mt-2.5">
          {[
            { label: 'Income', value: totalIncome, color: 'text-emerald-300', icon: TrendingUp },
            { label: 'Expenses', value: totalExpenses, color: 'text-rose-300', icon: TrendingDown },
            { label: 'Savings', value: savings, color: 'text-amber-300', icon: PiggyBank },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-center gap-1 mb-0.5">
                <item.icon className="h-2.5 w-2.5 text-white/40" />
                <span className="text-[8px] font-semibold text-white/50 uppercase tracking-wider">{item.label}</span>
              </div>
              <p className={`text-[11px] font-bold ${item.color}`}>
                {loading ? <span className="inline-block h-3 w-14 bg-white/10 rounded animate-pulse" /> : formatCurrency(item.value, currency)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
