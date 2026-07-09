'use client';

import { useState, useMemo, useEffect } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { firebaseService } from '@/firebase/services';
import { useRouter } from 'next/navigation';
import {
  TrendingUp, Target, Repeat, Banknote, Clock, PiggyBank,
  Receipt, BarChart3, ChevronRight, Calendar,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/format';
import { toDate } from '@/utils/helpers';
import { AnimatedCounter } from '@/components/shared';
import { MobileBalanceCard } from './MobileBalanceCard';
import { MobileQuickStats } from './MobileQuickStats';
import { MobileTransactionItem } from './MobileTransactionItem';
import { MobileFAB } from './MobileFAB';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function MobileDashboard() {
  const { summary, monthlyTrend, loading } = useDashboard();
  const { user, userData } = useAuth();
  const router = useRouter();
  const [txCount, setTxCount] = useState(5);
  const [extraData, setExtraData] = useState<any>({ upcomingRules: [], upcomingSubs: [], upcomingEmis: [], subTotal: 0, budgetData: null });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [rules, subs, loans, budgets] = await Promise.all([
          firebaseService.recurringTransactions.getAll(user.uid),
          firebaseService.subscriptions.getAll(user.uid),
          firebaseService.loans.getAll(user.uid),
          firebaseService.budgets.getAll(user.uid),
        ]);
        const now = new Date();
        const next30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        setExtraData({
          upcomingRules: rules.filter((r) => r.isActive && toDate(r.nextExecution) <= next30).sort((a, b) => toDate(a.nextExecution).getTime() - toDate(b.nextExecution).getTime()).slice(0, 2),
          upcomingSubs: subs.filter((s) => s.status === 'active' && toDate(s.renewalDate) >= now && toDate(s.renewalDate) <= next30).sort((a, b) => toDate(a.renewalDate).getTime() - toDate(b.renewalDate).getTime()).slice(0, 2),
          upcomingEmis: loans.filter((l) => l.status === 'active' && l.nextEmiDate && toDate(l.nextEmiDate) >= now && toDate(l.nextEmiDate) <= next30).sort((a, b) => toDate(a.nextEmiDate!).getTime() - toDate(b.nextEmiDate!).getTime()).slice(0, 2),
          subTotal: subs.filter((s) => s.status === 'active').reduce((sum, s) => sum + s.monthlyCost, 0),
          budgetData: budgets[0] || null,
        });
      } catch {}
    };
    load();
  }, [user]);

  const userName = (userData?.name?.split(' ') || [])[0] || 'User';
  const savingsRate = summary.totalIncome > 0 ? (summary.savings / summary.totalIncome) * 100 : 0;
  const budgetUtil = summary.totalBudget > 0 ? (summary.totalBudgetSpent / summary.totalBudget) * 100 : 0;

  const filteredTx = useMemo(() =>
    summary.recentTransactions.slice(0, txCount),
  [summary.recentTransactions, txCount]);

  const fabActions = [
    { id: 'expense', label: 'Expense', icon: TrendingUp, color: '#FF5A6E', onClick: () => router.push('/expenses?add=true') },
    { id: 'income', label: 'Income', icon: TrendingUp, color: '#00D09C', onClick: () => router.push('/income?add=true') },
    { id: 'budget', label: 'Budget', icon: Target, color: '#8B6FFF', onClick: () => router.push('/budgets?add=true') },
    { id: 'savings', label: 'Goal', icon: PiggyBank, color: '#FBBF24', onClick: () => router.push('/savings?add=true') },
    { id: 'subscription', label: 'Subscription', icon: Repeat, color: '#3B82F6', onClick: () => router.push('/subscriptions?add=true') },
    { id: 'loan', label: 'Loan', icon: Banknote, color: '#FF5A6E', onClick: () => router.push('/loans?add=true') },
    { id: 'recurring', label: 'Recurring', icon: Clock, color: '#00D09C', onClick: () => router.push('/recurring?add=true') },
  ];

  return (
    <div className="min-h-dvh bg-[#0A0C10] pb-32">
      <div className="px-4 space-y-4 pt-2">
        {/* Greeting */}
        <motion.div variants={itemAnim} initial="hidden" animate="show" className="pt-1">
          <h1 className="text-[22px] font-extrabold tracking-tight text-white text-balance">
            {greeting()} <span className="text-[#8B6FFF]">👋</span>
          </h1>
          <p className="text-[12px] text-[#8899AA] mt-0.5 font-medium text-balance">{userName} &middot; {todayStr}</p>
        </motion.div>

        {/* Balance Card */}
        <motion.div variants={itemAnim} initial="hidden" animate="show">
          <MobileBalanceCard
            currentBalance={summary.currentBalance}
            totalIncome={summary.totalIncome}
            totalExpenses={summary.totalExpenses}
            savings={summary.savings}
            currency={userData?.currency}
            loading={loading}
          />
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemAnim} initial="hidden" animate="show">
          <MobileQuickStats
            totalIncome={summary.totalIncome}
            monthlySpending={summary.monthlySpending}
            savingsRate={savingsRate}
            currentBalance={summary.currentBalance}
            currency={userData?.currency}
            loading={loading}
          />
        </motion.div>

        {/* Mini Chart */}
        <motion.div variants={itemAnim} initial="hidden" animate="show">
          <div className="bg-[#141822] rounded-xl border border-white/[0.08] p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-[#8B6FFF]" />
                <span className="text-[12px] font-bold text-white">Trend</span>
              </div>
              {monthlyTrend.length > 0 && (
                <button onClick={() => router.push('/analytics')} className="text-[10px] font-semibold text-[#8B6FFF] flex items-center gap-0.5">
                  Analytics <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
            {loading ? (
              <div className="h-[140px] rounded-xl bg-white/5 animate-pulse" />
            ) : monthlyTrend.length === 0 ? (
              <div className="h-[140px] flex flex-col items-center justify-center rounded-xl bg-white/[0.02] border border-dashed border-white/[0.06]">
                <BarChart3 className="h-7 w-7 text-white/10 mb-1" />
                <p className="text-[11px] font-medium text-[#8899AA]">No data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={monthlyTrend} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#8899AA', fontWeight: 500 }} axisLine={false} tickLine={false} dy={4} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: '#1A1D2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '11px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Bar dataKey="income" fill="#00D09C" radius={[3, 3, 0, 0]} maxBarSize={18} name="Income" />
                  <Bar dataKey="expenses" fill="#FF5A6E" radius={[3, 3, 0, 0]} maxBarSize={18} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={itemAnim} initial="hidden" animate="show">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[14px] font-bold text-white">Recent Transactions</span>
            <button onClick={() => router.push('/expenses')} className="text-[11px] font-semibold text-[#8B6FFF] flex items-center gap-0.5">
              View All <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-[60px] rounded-xl bg-white/5 animate-pulse" />)
            ) : filteredTx.length === 0 ? (
              <div className="text-center py-8 bg-[#141822] rounded-xl border border-white/[0.06]">
                <Receipt className="h-8 w-8 mx-auto mb-2 text-white/10" />
                <p className="text-[12px] font-medium text-[#8899AA]">No transactions yet</p>
              </div>
            ) : (
              filteredTx.map((tx, i) => (
                <MobileTransactionItem
                  key={i}
                  description={'description' in tx ? tx.description : ''}
                  amount={tx.amount}
                  date={tx.createdAt || (tx as any).expenseDate || (tx as any).incomeDate}
                  type={'type' in tx && tx.type === 'income' ? 'income' : 'expense'}
                  category={(tx as any).category}
                  currency={userData?.currency}
                />
              ))
            )}
            {filteredTx.length >= 5 && summary.recentTransactions.length > 5 && (
              <button
                onClick={() => setTxCount((c) => c + 5)}
                className="w-full py-2 text-[11px] font-semibold text-[#8B6FFF] bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                Show More
              </button>
            )}
          </div>
        </motion.div>

        {/* Budget Preview */}
        <motion.div variants={itemAnim} initial="hidden" animate="show">
          <div className="bg-[#141822] rounded-xl border border-white/[0.08] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-[#8B6FFF]/15 flex items-center justify-center">
                  <Target className="h-3.5 w-3.5 text-[#8B6FFF]" />
                </div>
                <span className="text-[13px] font-bold text-white">Monthly Budget</span>
              </div>
              <button onClick={() => router.push('/budgets')} className="text-[10px] font-semibold text-[#8B6FFF]">Manage</button>
            </div>
            {loading ? (
              <div className="space-y-2">
                <div className="h-5 w-20 bg-white/5 rounded animate-pulse" />
                <div className="h-2 w-full bg-white/5 rounded-full animate-pulse" />
              </div>
            ) : summary.totalBudget > 0 ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[18px] font-extrabold text-white">
                    <AnimatedCounter value={summary.totalBudget} formatter={(v) => formatCurrency(v, userData?.currency)} />
                  </span>
                  <span className={`text-[11px] font-bold ${budgetUtil > 100 ? 'text-[#FF5A6E]' : budgetUtil > 80 ? 'text-[#FBBF24]' : 'text-[#00D09C]'}`}>
                    {budgetUtil.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(budgetUtil, 100)}%`,
                      backgroundColor: budgetUtil > 100 ? '#FF5A6E' : budgetUtil > 80 ? '#FBBF24' : '#8B6FFF',
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-[#8899AA]">
                    Spent {formatCurrency(summary.totalBudgetSpent, userData?.currency)}
                  </span>
                  <span className="text-[10px] text-[#8899AA]">
                    Left {formatCurrency(summary.budgetRemaining, userData?.currency)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <Target className="h-6 w-6 text-white/10 mb-1" />
                <p className="text-[11px] font-medium text-[#8899AA]">No budget set</p>
                <button onClick={() => router.push('/budgets')} className="text-[10px] font-semibold text-[#8B6FFF] mt-1">Create budget</button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Overview Grid */}
        <div className="grid grid-cols-3 gap-2">
          <motion.div variants={itemAnim} initial="hidden" animate="show" onClick={() => router.push('/subscriptions')} className="bg-[#141822] rounded-xl border border-white/[0.08] p-3 shadow-sm active:scale-95 transition-transform">
            <div className="h-7 w-7 rounded-xl bg-[#8B6FFF]/15 flex items-center justify-center mb-1.5">
              <Repeat className="h-3.5 w-3.5 text-[#8B6FFF]" />
            </div>
            <p className="text-[11px] font-semibold text-[#8899AA]">Subscriptions</p>
            <p className="text-[14px] font-extrabold text-white">{formatCurrency(extraData.subTotal, userData?.currency)}</p>
            <p className="text-[9px] text-white/40">/mo</p>
          </motion.div>
          <motion.div variants={itemAnim} initial="hidden" animate="show" onClick={() => router.push('/recurring')} className="bg-[#141822] rounded-xl border border-white/[0.08] p-3 shadow-sm active:scale-95 transition-transform">
            <div className="h-7 w-7 rounded-xl bg-[#00D09C]/15 flex items-center justify-center mb-1.5">
              <Clock className="h-3.5 w-3.5 text-[#00D09C]" />
            </div>
            <p className="text-[11px] font-semibold text-[#8899AA]">Recurring</p>
            <p className="text-[14px] font-extrabold text-white">{extraData.upcomingRules.length}</p>
            <p className="text-[9px] text-white/40">active</p>
          </motion.div>
          <motion.div variants={itemAnim} initial="hidden" animate="show" onClick={() => router.push('/loans')} className="bg-[#141822] rounded-xl border border-white/[0.08] p-3 shadow-sm active:scale-95 transition-transform">
            <div className="h-7 w-7 rounded-xl bg-[#FF5A6E]/15 flex items-center justify-center mb-1.5">
              <Banknote className="h-3.5 w-3.5 text-[#FF5A6E]" />
            </div>
            <p className="text-[11px] font-semibold text-[#8899AA]">Loans</p>
            <p className="text-[14px] font-extrabold text-white">{extraData.upcomingEmis.length}</p>
            <p className="text-[9px] text-white/40">due soon</p>
          </motion.div>
        </div>

        {/* Goals Preview */}
        <motion.div variants={itemAnim} initial="hidden" animate="show">
          <button onClick={() => router.push('/savings')} className="w-full bg-[#141822] rounded-xl border border-white/[0.08] p-4 shadow-sm active:scale-[0.98] transition-transform text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-[#FBBF24]/15 flex items-center justify-center">
                  <PiggyBank className="h-3.5 w-3.5 text-[#FBBF24]" />
                </div>
                <span className="text-[13px] font-bold text-white">Savings Goals</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#5A6B7D]" />
            </div>
            <p className="text-[11px] text-[#8899AA] mt-1">Track your savings progress</p>
          </button>
        </motion.div>
      </div>

      <MobileFAB actions={fabActions} />
    </div>
  );
}
