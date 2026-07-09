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
    <div className="relative overflow-hidden rounded-[24px] gradient-balance px-6 py-6 shadow-2xl" style={{ boxShadow: '0 12px 48px rgba(106, 74, 232, 0.25), 0 4px 16px rgba(0, 0, 0, 0.15)' }}>
      <div className="absolute top-0 -right-12 w-56 h-56 bg-white/[0.04] rounded-full -translate-y-1/3 blur-3xl" />
      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-[#00d09c]/10 rounded-full blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="h-[14px] w-[14px] text-white/50" />
          <span className="text-[11px] font-semibold text-white/60 uppercase tracking-widest">Current Balance</span>
        </div>
        {loading ? (
          <div className="h-10 w-44 bg-white/10 rounded-xl animate-pulse mb-3" />
        ) : (
          <p className="text-[32px] font-extrabold text-white tracking-tight mb-3">
            <AnimatedCounter value={currentBalance} formatter={(v) => formatCurrency(v, currency)} />
          </p>
        )}
        <div className="flex items-center gap-6 pt-3 border-t border-white/10">
          {[
            { label: 'Income', value: totalIncome, color: 'text-emerald-300', icon: TrendingUp },
            { label: 'Expenses', value: totalExpenses, color: 'text-rose-300', icon: TrendingDown },
            { label: 'Savings', value: savings, color: 'text-amber-300', icon: PiggyBank },
          ].map((item) => (
            <div key={item.label} className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <item.icon className="h-3 w-3 text-white/40" />
                <span className="text-[9px] font-semibold text-white/50 uppercase tracking-wider">{item.label}</span>
              </div>
              <p className={`text-[13px] font-bold ${item.color}`}>
                {loading ? <span className="inline-block h-3.5 w-16 bg-white/10 rounded animate-pulse" /> : formatCurrency(item.value, currency)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
