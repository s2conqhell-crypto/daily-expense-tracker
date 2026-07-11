'use client';

import { useState, useMemo, useEffect } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useExpenses } from '@/hooks/useExpenses';
import { useIncome } from '@/hooks/useIncome';
import { firebaseService } from '@/firebase/services';
import { useRouter } from 'next/navigation';
import {
  TrendingUp, Target, Repeat, Banknote, Clock, PiggyBank,
  Receipt, BarChart3, ChevronRight, Plus,
  
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/format';
import { toDate, safeDateInput } from '@/utils/helpers';
import { AnimatedCounter, ConfirmDeleteDialog } from '@/components/shared';
import { TransactionDialog } from '@/components/transactions/TransactionDialog';
import { MobileBalanceCard } from './MobileBalanceCard';
import { MobileQuickStats } from './MobileQuickStats';
import { MobileTransactionItem } from './MobileTransactionItem';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import type { Expense, Income } from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.08 },
  },
};

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};



export function MobileDashboard() {
  const { summary, monthlyTrend, loading } = useDashboard();
  const { user, userData } = useAuth();
  const router = useRouter();
  const [todayStr, setTodayStr] = useState('');
  const [greeting, setGreeting] = useState('');
  const [txCount, setTxCount] = useState(5);
  const [extraData, setExtraData] = useState<any>({ upcomingRules: [], upcomingSubs: [], upcomingEmis: [], subTotal: 0, budgetData: null });
  const [editingTx, setEditingTx] = useState<Expense | Income | null>(null);
  const [deletingTx, setDeletingTx] = useState<Expense | Income | null>(null);
  const { updateExpense, deleteExpense, duplicateExpense, toggleFavoriteExpense } = useExpenses();
  const { updateIncome, deleteIncome, duplicateIncome, toggleFavoriteIncome } = useIncome();

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
      } catch (e) { console.warn('[MobileDashboard] Failed to load extra data', e); }
    };
    load();
  }, [user]);

  useEffect(() => {
    const h = new Date().getHours();
    let g = 'Good Evening';
    if (h < 12) g = 'Good Morning';
    else if (h < 17) g = 'Good Afternoon';
    setGreeting(g);
    setTodayStr(new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
  }, []);

  const userName = (userData?.name?.split(' ') || [])[0] || 'User';
  const savingsRate = summary.totalIncome > 0 ? (summary.savings / summary.totalIncome) * 100 : 0;
  const budgetUtil = summary.totalBudget > 0 ? (summary.totalBudgetSpent / summary.totalBudget) * 100 : 0;

  const filteredTx = useMemo(() =>
    summary.recentTransactions.slice(0, txCount),
  [summary.recentTransactions, txCount]);

  return (
    <div className="min-h-dvh bg-[#09090b]" style={{ paddingBottom: 'calc(90px + env(safe-area-inset-bottom, 0px))' }}>
      <motion.div className="px-5 space-y-6 pt-4" variants={container} initial="hidden" animate="show">
        {/* Greeting */}
        <motion.div variants={itemAnim}>
          <p className="text-[11px] text-[#6b7b8d] font-semibold uppercase tracking-widest">{todayStr}</p>
          <h1 className="text-[30px] font-bold text-white tracking-tight mt-0.5">
            {greeting}, {userName}
          </h1>
        </motion.div>

        {/* Balance Card */}
        <motion.div variants={itemAnim}>
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
        <motion.div variants={itemAnim}>
          <MobileQuickStats
            totalIncome={summary.totalIncome}
            monthlySpending={summary.monthlySpending}
            savingsRate={savingsRate}
            currentBalance={summary.currentBalance}
            currency={userData?.currency}
            loading={loading}
          />
        </motion.div>

        {/* Trend Card */}
        <motion.div variants={itemAnim}>
          <div className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-5 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#7c5cff]/15">
                  <BarChart3 className="h-[18px] w-[18px] text-[#7c5cff]" />
                </div>
                <span className="text-[15px] font-semibold text-white">Spending Trend</span>
              </div>
              {monthlyTrend.length > 0 && (
                <button onClick={() => router.push('/analytics')} className="text-[12px] font-semibold text-[#7c5cff] flex items-center gap-1 active:opacity-70 transition-opacity">
                  Analytics <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
            {loading ? (
              <div className="h-[140px] rounded-xl bg-white/5 animate-pulse" />
            ) : monthlyTrend.length === 0 ? (
              <div className="h-[140px] flex flex-col items-center justify-center rounded-xl bg-white/[0.02] border border-dashed border-white/[0.06]">
                <BarChart3 className="h-8 w-8 text-white/10 mb-2" />
                <p className="text-[12px] text-[#6b7b8d] font-medium">No data yet</p>
              </div>
            ) : (
              <div style={{ minHeight: 140, width: '100%' }}>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={monthlyTrend} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7b8d', fontWeight: 500 }} axisLine={false} tickLine={false} dy={4} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: '#161a27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', fontSize: '12px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Bar dataKey="income" fill="#00d09c" radius={[4, 4, 0, 0]} maxBarSize={20} name="Income" />
                  <Bar dataKey="expenses" fill="#ff5a7a" radius={[4, 4, 0, 0]} maxBarSize={20} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={itemAnim}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[15px] font-semibold text-white">Recent Transactions</span>
            <button onClick={() => router.push('/expenses')} className="text-[12px] font-semibold text-[#7c5cff] flex items-center gap-1 active:opacity-70 transition-opacity">
              View All <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2.5">
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-[64px] rounded-[16px] bg-white/5 animate-pulse" />)
            ) : filteredTx.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-[#161a27] rounded-[20px] border border-white/[0.06]">
                <Receipt className="h-10 w-10 text-white/10 mb-2" />
                <p className="text-[12px] text-[#6b7b8d] font-medium">No transactions yet</p>
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
                  isFavorite={(tx as any).isFavorite}
                  onEdit={() => setEditingTx(tx)}
                  onDelete={() => setDeletingTx(tx)}
                  onDuplicate={async () => {
                    const isIncome = 'type' in tx && tx.type === 'income';
                    if (isIncome) { await duplicateIncome(tx.id); } else { await duplicateExpense(tx.id); }
                  }}
                  onToggleFavorite={async () => {
                    const isIncome = 'type' in tx && tx.type === 'income';
                    const newVal = !(tx as any).isFavorite;
                    if (isIncome) { await toggleFavoriteIncome(tx.id, newVal); } else { await toggleFavoriteExpense(tx.id, newVal); }
                  }}
                  onShare={() => {
                    const text = `${'description' in tx ? tx.description : 'Transaction'}: ${tx.amount} on ${new Date().toLocaleDateString()}`;
                    if (navigator.share) {
                      navigator.share({ title: 'ExpenseFlow', text });
                    } else {
                      navigator.clipboard?.writeText(text);
                    }
                  }}
                />
              ))
            )}
            {filteredTx.length >= 5 && summary.recentTransactions.length > 5 && (
              <button
                onClick={() => setTxCount((c) => c + 5)}
                className="w-full py-3 text-[12px] font-semibold text-[#7c5cff] bg-[#161a27] rounded-[16px] border border-white/[0.06] hover:bg-white/5 active:scale-[0.98] transition-all"
              >
                Show More
              </button>
            )}
          </div>
        </motion.div>

        {/* Budget Preview */}
        <motion.div variants={itemAnim}>
          <div className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-5 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#7c5cff]/15">
                  <Target className="h-[18px] w-[18px] text-[#7c5cff]" />
                </div>
                <span className="text-[15px] font-semibold text-white">Monthly Budget</span>
              </div>
              <button onClick={() => router.push('/budgets')} className="text-[12px] font-semibold text-[#7c5cff] active:opacity-70 transition-opacity">Manage</button>
            </div>
            {loading ? (
              <div className="space-y-3">
                <div className="h-6 w-24 bg-white/5 rounded animate-pulse" />
                <div className="h-2.5 w-full bg-white/5 rounded-full animate-pulse" />
              </div>
            ) : summary.totalBudget > 0 ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[22px] font-bold text-white">
                    <AnimatedCounter value={summary.totalBudget} formatter={(v) => formatCurrency(v, userData?.currency)} />
                  </span>
                  <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${
                    budgetUtil > 100 ? 'bg-[#ff5a7a]/15 text-[#ff5a7a]' : budgetUtil > 80 ? 'bg-[#ffb020]/15 text-[#ffb020]' : 'bg-[#00d09c]/15 text-[#00d09c]'
                  }`}>
                    {budgetUtil.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-white/[0.04] overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(budgetUtil, 100)}%`,
                      backgroundColor: budgetUtil > 100 ? '#ff5a7a' : budgetUtil > 80 ? '#ffb020' : '#7c5cff',
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#6b7b8d]">
                    Spent <span className="text-white">{formatCurrency(summary.totalBudgetSpent, userData?.currency)}</span>
                  </span>
                  <span className="text-[11px] font-medium text-[#6b7b8d]">
                    Left <span className="text-white">{formatCurrency(summary.budgetRemaining, userData?.currency)}</span>
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-5">
                <Target className="h-8 w-8 text-white/10 mb-2" />
                <p className="text-[12px] text-[#6b7b8d] font-medium">No budget set</p>
                <button onClick={() => router.push('/budgets')} className="text-[12px] font-semibold text-[#7c5cff] mt-2 active:opacity-70">Create budget</button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Overview Grid */}
        <motion.div variants={itemAnim}>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => router.push('/subscriptions')} className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-4 card-shadow text-left active:scale-[0.97] transition-transform">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#7c5cff]/15 mb-2">
                <Repeat className="h-[18px] w-[18px] text-[#7c5cff]" />
              </div>
              <p className="text-[11px] font-semibold text-[#6b7b8d] mb-0.5">Subscriptions</p>
              <p className="text-[17px] font-bold text-white">
                <AnimatedCounter value={extraData.subTotal} formatter={(v) => formatCurrency(v, userData?.currency)} />
              </p>
              <p className="text-[9px] text-white/40 mt-0.5">/mo</p>
            </button>
            <button onClick={() => router.push('/recurring')} className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-4 card-shadow text-left active:scale-[0.97] transition-transform">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#00d09c]/15 mb-2">
                <Clock className="h-[18px] w-[18px] text-[#00d09c]" />
              </div>
              <p className="text-[11px] font-semibold text-[#6b7b8d] mb-0.5">Recurring</p>
              <p className="text-[17px] font-bold text-white">{extraData.upcomingRules.length}</p>
              <p className="text-[9px] text-white/40 mt-0.5">active</p>
            </button>
            <button onClick={() => router.push('/loans')} className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-4 card-shadow text-left active:scale-[0.97] transition-transform">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#ff5a7a]/15 mb-2">
                <Banknote className="h-[18px] w-[18px] text-[#ff5a7a]" />
              </div>
              <p className="text-[11px] font-semibold text-[#6b7b8d] mb-0.5">Loans</p>
              <p className="text-[17px] font-bold text-white">{extraData.upcomingEmis.length}</p>
              <p className="text-[9px] text-white/40 mt-0.5">due soon</p>
            </button>
          </div>
        </motion.div>

        {/* Goals Preview */}
        <motion.div variants={itemAnim}>
          <button onClick={() => router.push('/savings')} className="w-full bg-[#161a27] rounded-[20px] border border-white/[0.06] p-5 card-shadow text-left active:scale-[0.97] transition-transform">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#ffb020]/15">
                  <PiggyBank className="h-[18px] w-[18px] text-[#ffb020]" />
                </div>
                <span className="text-[15px] font-semibold text-white">Savings Goals</span>
              </div>
              <ChevronRight className="h-5 w-5 text-[#6b7b8d]" />
            </div>
            <p className="text-[12px] text-[#6b7b8d] mt-1.5">Track your savings progress and build wealth</p>
          </button>
        </motion.div>
      </motion.div>

      {/* Edit dialog */}
      {editingTx && (
        <TransactionDialog
          type={'type' in editingTx && editingTx.type === 'income' ? 'income' : 'expense'}
          open={true}
          onOpenChange={() => setEditingTx(null)}
          defaultValues={{
            amount: String(editingTx.amount),
            description: editingTx.description,
            notes: (editingTx as any).notes || '',
            category: (editingTx as any).category || '',
            source: (editingTx as any).source || '',
            expenseDate: safeDateInput((editingTx as any).expenseDate || editingTx.createdAt),
            incomeDate: safeDateInput((editingTx as any).incomeDate || editingTx.createdAt),
            paymentMethod: (editingTx as any).paymentMethod || 'Cash',
            isRecurring: (editingTx as any).isRecurring || false,
            recurringInterval: (editingTx as any).recurringInterval || 'monthly',
          }}
          onSubmit={async (data) => {
            try {
              if ('type' in editingTx && editingTx.type === 'income') {
                await updateIncome(editingTx.id, data as Partial<Income>);
              } else {
                await updateExpense(editingTx.id, data as Partial<Expense>);
              }
              setEditingTx(null);
            } catch (e) { console.warn('[MobileDashboard] Edit save failed', e); }
          }}
        />
      )}
      <ConfirmDeleteDialog
        open={!!deletingTx}
        onOpenChange={(open) => { if (!open) setDeletingTx(null); }}
        onConfirm={async () => {
          if (!deletingTx) return;
          try {
            if ('type' in deletingTx && deletingTx.type === 'income') {
              await deleteIncome(deletingTx.id);
            } else {
              await deleteExpense(deletingTx.id);
            }
            setDeletingTx(null);
          } catch (e) { console.warn('[MobileDashboard] Delete failed', e); }
        }}
        title="Delete Transaction"
        itemName={deletingTx?.description}
      />
    </div>
  );
}
