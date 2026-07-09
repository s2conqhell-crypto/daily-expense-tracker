'use client';

import { TrendingUp, CreditCard, Landmark, Wallet } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

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
    { label: 'Income', value: formatCurrency(totalIncome, currency), icon: TrendingUp, color: '#00D09C' },
    { label: 'Expenses', value: formatCurrency(monthlySpending, currency), icon: CreditCard, color: '#FF5A6E' },
    { label: 'Savings Rate', value: savingsRate.toFixed(1) + '%', icon: Landmark, color: '#FBBF24' },
    { label: 'Balance', value: formatCurrency(currentBalance, currency), icon: Wallet, color: '#8B6FFF' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-[#141822] rounded-xl border border-white/[0.08] p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-semibold text-[#8899AA] uppercase tracking-wider">{stat.label}</span>
            <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.color + '15' }}>
              <stat.icon className="h-3.5 w-3.5" style={{ color: stat.color }} />
            </div>
          </div>
          {loading ? (
            <div className="h-5 w-20 bg-white/5 rounded animate-pulse" />
          ) : (
            <p className="text-[15px] font-extrabold text-white">{stat.value}</p>
          )}
        </div>
      ))}
    </div>
  );
}
