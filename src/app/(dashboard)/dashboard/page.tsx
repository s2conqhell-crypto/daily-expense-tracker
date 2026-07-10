'use client';

import { useState, useMemo, useEffect } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { firebaseService } from '@/firebase/services';
import { Button, Badge } from '@/components/ui';
import { TransactionDialog } from '@/components/transactions/TransactionDialog';
import { AnimatedCounter } from '@/components/shared';
import { MobileDashboard } from '@/components/mobile/MobileDashboard';
import {
  Plus, TrendingUp, TrendingDown, Wallet, PiggyBank, CreditCard,
  Receipt, Target, Calendar, Repeat, Banknote, Clock,
  Landmark,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/format';
import { toDate } from '@/utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const [todayStr, setTodayStr] = useState('');
  const [greeting, setGreeting] = useState('');
  const { summary, monthlyTrend, loading } = useDashboard();
  const { user, userData } = useAuth();
  const isMobile = useIsMobile();
  const [dialogType, setDialogType] = useState<'expense' | 'income' | null>(null);
  const [txFilter, setTxFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [extraData, setExtraData] = useState<any>({ upcomingRules: [], upcomingSubs: [], upcomingEmis: [], subTotal: 0 });

  useEffect(() => {
    const h = new Date().getHours();
    let g = 'Good Evening';
    if (h < 12) g = 'Good Morning';
    else if (h < 17) g = 'Good Afternoon';
    setGreeting(g);
    setTodayStr(new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [rules, subs, loans] = await Promise.all([
          firebaseService.recurringTransactions.getAll(user.uid),
          firebaseService.subscriptions.getAll(user.uid),
          firebaseService.loans.getAll(user.uid),
        ]);
        const now = new Date();
        const next30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        setExtraData({
          upcomingRules: rules.filter((r) => r.isActive && toDate(r.nextExecution) <= next30).sort((a, b) => toDate(a.nextExecution).getTime() - toDate(b.nextExecution).getTime()).slice(0, 3),
          upcomingSubs: subs.filter((s) => s.status === 'active' && toDate(s.renewalDate) >= now && toDate(s.renewalDate) <= next30).sort((a, b) => toDate(a.renewalDate).getTime() - toDate(b.renewalDate).getTime()).slice(0, 3),
          upcomingEmis: loans.filter((l) => l.status === 'active' && l.nextEmiDate && toDate(l.nextEmiDate) >= now && toDate(l.nextEmiDate) <= next30).sort((a, b) => toDate(a.nextEmiDate!).getTime() - toDate(b.nextEmiDate!).getTime()).slice(0, 3),
          subTotal: subs.filter((s) => s.status === 'active').reduce((sum, s) => sum + s.monthlyCost, 0),
        });
      } catch (e) { console.warn('[Dashboard] Failed to load extra data', e); }
    };
    load();
  }, [user]);

  const userName = (userData?.name?.split(' ') || [])[0] || 'User';
  const savingsRate = summary.totalIncome > 0 ? (summary.savings / summary.totalIncome) * 100 : 0;
  const budgetUtil = summary.totalBudget > 0 ? (summary.totalBudgetSpent / summary.totalBudget) * 100 : 0;

  const filteredTx = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return summary.recentTransactions.filter((tx) => {
      const d = toDate(tx.createdAt || (tx as any).expenseDate || (tx as any).incomeDate);
      if (txFilter === 'today') return d >= startOfDay;
      if (txFilter === 'week') return d >= startOfWeek;
      if (txFilter === 'month') return d >= startOfMonth;
      return true;
    });
  }, [summary.recentTransactions, txFilter]);

  const showUpcoming = extraData.upcomingRules.length > 0 || extraData.upcomingSubs.length > 0 || extraData.upcomingEmis.length > 0;

  return (
    <div className="min-h-dvh bg-[#0A0C10]">
      {/* Mobile Dashboard */}
      <div className="lg:hidden">
        <MobileDashboard />
      </div>

      {/* Desktop Dashboard - unchanged */}
      <div className="hidden lg:block">
      <div className="page-container pb-24 space-y-4 pt-3">
        {/* Greeting + Quick Actions */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
              {greeting}, <span className="text-[#8B6FFF]">{userName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#8899AA] mt-0.5 font-medium">{todayStr}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setDialogType('expense')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-[#FF5A6E]/15 text-[#FF5A6E] text-xs font-semibold transition-all border border-white/[0.06] hover:border-[#FF5A6E]/20"
            >
              <Plus className="h-3.5 w-3.5" /> Expense
            </button>
            <button
              onClick={() => setDialogType('income')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-[#00D09C]/15 text-[#00D09C] text-xs font-semibold transition-all border border-white/[0.06] hover:border-[#00D09C]/20"
            >
              <Plus className="h-3.5 w-3.5" /> Income
            </button>
            <a
              href="/reports"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8899AA] text-xs font-semibold transition-all border border-white/[0.06] hover:border-white/[0.12]"
            >
              <Receipt className="h-3.5 w-3.5" /> Reports
            </a>
          </div>
        </div>

        {/* Balance Hero */}
        <motion.div variants={itemAnim} initial="hidden" animate="show">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#6B4FF5] via-[#7C5CFF] to-[#00D09C]/50 px-5 py-4 sm:px-6 sm:py-5 shadow-lg shadow-[#7C5CFF]/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00D09C]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Wallet className="h-3.5 w-3.5 text-white/50" />
                <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wider">Current Balance</span>
              </div>
              {loading ? (
                <div className="h-9 w-44 bg-white/10 rounded-lg animate-pulse" />
              ) : (
                <p className="text-2xl sm:text-[28px] font-extrabold text-white tracking-tight">
                  <AnimatedCounter value={summary.currentBalance} formatter={(v) => formatCurrency(v, userData?.currency)} />
                </p>
              )}
              <div className="flex items-center gap-4 sm:gap-6 mt-3">
                {[
                  { label: 'Income', value: summary.totalIncome, color: 'text-emerald-300', icon: TrendingUp },
                  { label: 'Expenses', value: summary.totalExpenses, color: 'text-rose-300', icon: TrendingDown },
                  { label: 'Savings', value: summary.savings, color: 'text-amber-300', icon: PiggyBank },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center gap-1 mb-0.5">
                      <item.icon className="h-2.5 w-2.5 text-white/40" />
                      <span className="text-[9px] font-semibold text-white/50 uppercase tracking-wider">{item.label}</span>
                    </div>
                    <p className={`text-xs sm:text-sm font-bold ${item.color}`}>
                      {loading ? <span className="inline-block h-4 w-16 bg-white/10 rounded animate-pulse" /> : formatCurrency(item.value, userData?.currency)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Monthly Income', value: summary.totalIncome, icon: TrendingUp, color: '#00D09C' },
            { label: 'Monthly Expenses', value: summary.monthlySpending, icon: CreditCard, color: '#FF5A6E' },
            { label: 'Savings Rate', value: savingsRate, icon: Landmark, color: '#FBBF24', isPercent: true },
            { label: 'Current Balance', value: summary.currentBalance, icon: Wallet, color: '#8B6FFF' },
          ].map((kpi) => (
            <motion.div key={kpi.label} variants={itemAnim}>
              <div className="bg-[#141822] rounded-xl border border-white/[0.08] p-4 transition-all hover:border-white/[0.14] shadow-sm">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[10px] font-semibold text-[#8899AA] uppercase tracking-wider">{kpi.label}</p>
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: kpi.color + '15' }}>
                    <kpi.icon className="h-4 w-4" style={{ color: kpi.color }} />
                  </div>
                </div>
                {loading ? (
                  <div className="h-7 w-24 bg-white/5 rounded animate-pulse" />
                ) : (
                  <p className="text-xl sm:text-2xl font-extrabold text-white">
                    {kpi.isPercent ? `${kpi.value.toFixed(1)}%` : formatCurrency(kpi.value, userData?.currency)}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Chart + Budget Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chart */}
          <motion.div variants={itemAnim} initial="hidden" animate="show" className="lg:col-span-2">
            <div className="bg-[#141822] rounded-xl border border-white/[0.08] p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-xl bg-[#8B6FFF]/15 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-[#8B6FFF]" />
                  </div>
                  <span className="text-sm font-bold text-white">Income vs Expenses</span>
                </div>
                <Badge className="text-[10px] rounded-lg bg-white/5 text-[#8899AA] border border-white/[0.06] font-medium">Last 6 months</Badge>
              </div>
              {loading ? (
                <div className="h-[260px] rounded-xl bg-white/5 animate-pulse" />
              ) : monthlyTrend.length === 0 ? (
                <div className="h-[260px] flex flex-col items-center justify-center rounded-xl bg-white/[0.02] border border-dashed border-white/[0.06]">
                  <TrendingUp className="h-10 w-10 text-white/10 mb-2" />
                  <p className="text-sm font-medium text-[#8899AA]">No chart data yet</p>
                  <p className="text-[10px] text-[#8899AA]/60 mt-0.5">Add transactions to see trends</p>
                </div>
              ) : (
                <div style={{ minHeight: 260, width: '100%' }}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={monthlyTrend} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8899AA', fontWeight: 500 }} axisLine={false} tickLine={false} dy={6} />
                    <YAxis tick={{ fontSize: 11, fill: '#8899AA', fontWeight: 500 }} axisLine={false} tickLine={false} dx={-4} />
                    <Tooltip
                      contentStyle={{ background: '#1A1D2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', fontWeight: 500 }}
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    />
                    <Bar dataKey="income" fill="#00D09C" radius={[4, 4, 0, 0]} maxBarSize={28} name="Income" />
                    <Bar dataKey="expenses" fill="#FF5A6E" radius={[4, 4, 0, 0]} maxBarSize={28} name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
                </div>
              )}
              {monthlyTrend.length > 0 && (
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-sm bg-[#00D09C]" />
                    <span className="text-[11px] font-medium text-[#8899AA]">Income</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-sm bg-[#FF5A6E]" />
                    <span className="text-[11px] font-medium text-[#8899AA]">Expenses</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Budget Card */}
          <motion.div variants={itemAnim} initial="hidden" animate="show">
            <div className="bg-[#141822] rounded-xl border border-white/[0.08] p-4 h-full shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-7 w-7 rounded-xl bg-[#8B6FFF]/15 flex items-center justify-center">
                  <Target className="h-4 w-4 text-[#8B6FFF]" />
                </div>
                <span className="text-sm font-bold text-white">Monthly Budget</span>
              </div>
              {loading ? (
                <div className="space-y-3">
                  <div className="h-7 w-24 bg-white/5 rounded animate-pulse" />
                  <div className="h-2 w-full bg-white/5 rounded-full animate-pulse" />
                </div>
              ) : summary.totalBudget > 0 ? (
                <>
                  <p className="text-xl font-extrabold text-white">
                    <AnimatedCounter value={summary.totalBudget} formatter={(v) => formatCurrency(v, userData?.currency)} />
                  </p>
                  <div className="mt-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-[#8899AA]">Spent</span>
                      <span className="text-[11px] font-bold text-white">{formatCurrency(summary.totalBudgetSpent, userData?.currency)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-[#8899AA]">Remaining</span>
                      <span className={`text-[11px] font-bold ${summary.budgetRemaining > 0 ? 'text-[#00D09C]' : 'text-[#FF5A6E]'}`}>
                        {summary.budgetRemaining > 0 ? formatCurrency(summary.budgetRemaining, userData?.currency) : 'Over budget'}
                      </span>
                    </div>
                    <div className="pt-2">
                      <div className="h-2.5 rounded-full bg-white/[0.04] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(budgetUtil, 100)}%`,
                            backgroundColor: budgetUtil > 100 ? '#FF5A6E' : budgetUtil > 80 ? '#FBBF24' : '#8B6FFF',
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className={`text-[10px] font-bold ${
                          budgetUtil <= 80 ? 'text-[#00D09C]' : budgetUtil <= 100 ? 'text-[#FBBF24]' : 'text-[#FF5A6E]'
                        }`}>
                          {budgetUtil <= 80 ? 'On Track' : budgetUtil <= 100 ? 'Near Limit' : 'Over Budget'}
                        </span>
                        <span className="text-[10px] font-medium text-[#8899AA]">{budgetUtil.toFixed(0)}% used</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <Target className="h-8 w-8 text-white/10 mb-2" />
                  <p className="text-xs font-medium text-[#8899AA]">No budget set</p>
                  <a href="/budgets" className="text-[10px] font-semibold text-[#8B6FFF] mt-1 hover:underline">Create budget</a>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Financial Overview Cards */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-3 gap-3">
          {[
            { label: 'Subscriptions', value: formatCurrency(extraData.subTotal, userData?.currency), icon: Repeat, color: '#8B6FFF', desc: '/mo' },
            { label: 'Active Recurring', value: extraData.upcomingRules.length.toString(), icon: Clock, color: '#00D09C', desc: 'next 30 days' },
            { label: 'Upcoming EMI', value: extraData.upcomingEmis.length.toString(), icon: Banknote, color: '#FF5A6E', desc: 'due in 30 days' },
          ].map((kpi) => (
            <motion.div key={kpi.label} variants={itemAnim}>
              <div className="bg-[#141822] rounded-xl border border-white/[0.08] p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: kpi.color + '15' }}>
                    <kpi.icon className="h-4 w-4" style={{ color: kpi.color }} />
                  </div>
                  <span className="text-[10px] font-semibold text-[#8899AA] uppercase tracking-wider">{kpi.label}</span>
                </div>
                <p className="text-lg font-extrabold text-white">{kpi.value}</p>
                <p className="text-[10px] font-medium text-white/40 mt-0.5">{kpi.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Upcoming + Recent Transactions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Upcoming Section */}
          {showUpcoming && (
            <motion.div variants={itemAnim} initial="hidden" animate="show" className="lg:col-span-2">
              <div className="bg-[#141822] rounded-xl border border-white/[0.08] p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-7 w-7 rounded-xl bg-[#8B6FFF]/15 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-[#8B6FFF]" />
                  </div>
                  <span className="text-sm font-bold text-white">Upcoming</span>
                  <span className="text-[10px] font-medium text-[#8899AA]">Next 30 days</span>
                </div>
                <div className="divide-y divide-white/[0.06]">
                  {extraData.upcomingRules.map((rule: any) => (
                    <div key={`rule-${rule.id}`} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 bg-[#8B6FFF]/15">
                          <Clock className="h-4 w-4 text-[#8B6FFF]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{rule.description}</p>
                          <p className="text-[10px] font-medium text-[#8899AA]">{formatDate(toDate(rule.nextExecution))}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold shrink-0 ml-2 ${rule.type === 'expense' ? 'text-[#FF5A6E]' : 'text-[#00D09C]'}`}>
                        {rule.type === 'expense' ? '-' : '+'}{formatCurrency(rule.amount, userData?.currency)}
                      </span>
                    </div>
                  ))}
                  {extraData.upcomingSubs.map((sub: any) => (
                    <div key={`sub-${sub.id}`} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 bg-[#00D09C]/15">
                          <Repeat className="h-4 w-4 text-[#00D09C]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{sub.name}</p>
                          <p className="text-[10px] font-medium text-[#8899AA]">{formatDate(toDate(sub.renewalDate))}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold shrink-0 ml-2 text-[#FF5A6E]">{formatCurrency(sub.monthlyCost, userData?.currency)}</span>
                    </div>
                  ))}
                  {extraData.upcomingEmis.map((loan: any) => (
                    <div key={`emi-${loan.id}`} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 bg-[#FF5A6E]/15">
                          <Banknote className="h-4 w-4 text-[#FF5A6E]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{loan.name}</p>
                          <p className="text-[10px] font-medium text-[#8899AA]">{formatDate(toDate(loan.nextEmiDate))}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold shrink-0 ml-2 text-[#FF5A6E]">{formatCurrency(loan.emiAmount, userData?.currency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Recent Transactions */}
          <motion.div variants={itemAnim} initial="hidden" animate="show" className={`${showUpcoming ? 'lg:col-span-3' : 'lg:col-span-5'}`}>
            <div className="bg-[#141822] rounded-xl border border-white/[0.08] overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className="text-sm font-bold text-white">Recent Transactions</span>
                <a href="/expenses" className="text-xs font-semibold text-[#8B6FFF] hover:underline flex items-center gap-1">
                  View All <TrendingUp className="h-3 w-3" />
                </a>
              </div>

              {/* Filter chips */}
              <div className="flex gap-1.5 px-4 pb-2">
                {(['all', 'today', 'week', 'month'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTxFilter(f)}
                    className={`px-2.5 py-1 text-[10px] font-semibold rounded-full transition-all ${
                      txFilter === f
                        ? 'bg-[#8B6FFF]/20 text-[#8B6FFF] border border-[#8B6FFF]/20'
                        : 'bg-white/5 text-[#8899AA] hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="px-4 pb-4 space-y-3">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-10 w-full rounded-xl bg-white/5 animate-pulse" />)}
                </div>
              ) : filteredTx.length === 0 ? (
                <div className="text-center py-10">
                  <Receipt className="h-10 w-10 mx-auto mb-2 text-white/10" />
                  <p className="text-xs font-medium text-[#8899AA]">No transactions yet</p>
                  <button className="mt-2 text-xs font-semibold text-[#8B6FFF] hover:underline" onClick={() => setDialogType('expense')}>Add your first</button>
                </div>
              ) : (
                <div className="px-4 pb-4 divide-y divide-white/[0.06]">
                  {filteredTx.slice(0, 6).map((tx, i) => {
                    const isIncome = 'type' in tx && tx.type === 'income';
                    const color = isIncome ? '#00D09C' : '#FF5A6E';
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + '15' }}>
                            {isIncome ? <TrendingUp className="h-4 w-4" style={{ color }} /> : <TrendingDown className="h-4 w-4" style={{ color }} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate">{'description' in tx ? tx.description : ''}</p>
                            <p className="text-[10px] font-medium text-[#8899AA]">
                              {formatDate(toDate(tx.createdAt || (tx as any).expenseDate || (tx as any).incomeDate))}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold shrink-0 ml-2 ${isIncome ? 'text-[#00D09C]' : 'text-[#FF5A6E]'}`}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount, userData?.currency)}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {dialogType && (
        <TransactionDialog
          type={dialogType}
          open={true}
          onOpenChange={(o) => { if (!o) setDialogType(null); }}
          onSubmit={async (data) => {
            try {
              const { firebaseService } = await import('@/firebase/services');
              if (dialogType === 'expense') {
                await firebaseService.expenses.add(user!.uid, data as any);
              } else {
              await firebaseService.income.add(user!.uid, data as any);
            }
          } catch (e) { console.warn('[Dashboard] Quick add failed', e); }
          setDialogType(null);
          }}
        />
      )}
      </div>
    </div>
  );
}
