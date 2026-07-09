'use client';

import { TrendingUp, CreditCard, Landmark, Wallet } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { AnimatedCounter } from '@/components/shared';

interface MobileQuickStatsProps {
  totalIncome: number;
  monthlySpending: number;
  savingsRate: number;
  currentBalance: number;
  currency?: string;
  loading?: boolean;
}

export function MobileQuickStats({ totalIncome, monthlySpending, savingsRate, currentBalance, currency, loading }: MobileQuickStatsProps) {
  const stats = [
    { label: 'Income', value: totalIncome, icon: TrendingUp, color: '#00d09c', isCurrency: true },
    { label: 'Expenses', value: monthlySpending, icon: CreditCard, color: '#ff5a7a', isCurrency: true },
    { label: 'Savings Rate', value: savingsRate, icon: Landmark, color: '#ffb020', isCurrency: false },
    { label: 'Balance', value: currentBalance, icon: Wallet, color: '#7c5cff', isCurrency: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative overflow-hidden rounded-[20px] bg-[#161a27] border border-white/[0.06] p-4 card-shadow active:scale-[0.98] transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-semibold text-[#6b7b8d] uppercase tracking-widest">{stat.label}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] shrink-0" style={{ backgroundColor: stat.color + '15' }}>
              <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
            </div>
          </div>
          {loading ? (
            <div className="h-7 w-24 bg-white/5 rounded-lg animate-pulse" />
          ) : (
            <p className="text-[17px] font-bold text-white" style={{ color: stat.isCurrency ? '#fff' : stat.color }}>
              {stat.isCurrency ? (
                <AnimatedCounter value={stat.value} formatter={(v) => formatCurrency(v, currency)} />
              ) : (
                <span>{stat.value.toFixed(1)}<span className="text-[13px] font-medium text-white/60">%</span></span>
              )}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
