'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { StatCard } from '@/components/shared/StatCard';
import { CreditCard, BarChart4, Heart, Wallet, Calendar } from 'lucide-react';
import {
  MobilePage, MobilePageHeader, MobileSection, MobileStatCard,
  MobileLoadingSkeleton, MobileDivider,
} from '@/components/mobile';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dynamic from 'next/dynamic';
import { formatCurrency } from '@/utils/format';

const AnalyticsCharts = dynamic(() => import('@/components/charts/AnalyticsCharts').then(m => ({ default: m.AnalyticsCharts })), { ssr: false });

const COLORS = ['#6366F1', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const healthColor = (score: number) => {
  if (score >= 80) return { color: '#00D09C', label: 'Excellent', bg: 'bg-emerald-500/10 text-emerald-500' };
  if (score >= 60) return { color: '#FBBF24', label: 'Good', bg: 'bg-amber-500/10 text-amber-500' };
  if (score >= 40) return { color: '#FF8A65', label: 'Fair', bg: 'bg-orange-500/10 text-orange-500' };
  return { color: '#FF5A6E', label: 'Needs Work', bg: 'bg-rose-500/10 text-rose-500' };
};

export default function AnalyticsPage() {
  const { summary, monthlyTrend, categoryBreakdown, weeklySpending, loading } = useDashboard();
  const { userData } = useAuth();

  const health = healthColor(summary.financialHealthScore);

  const dailyAvg = summary.monthlySpending / 30;

  return (
    <>
    {/* Mobile version */}
    <div className="lg:hidden">
      <MobilePage>
        <MobilePageHeader
          title="Analytics"
          subtitle="Deep insights into your finances"
          right={
            <span className="text-[12px] text-[#6b7b8d]">{loading ? '...' : summary.financialHealthScore + '/100'}</span>
          }
        />
        <div className="grid grid-cols-2 gap-3">
          <MobileStatCard label="Income" value={summary.totalIncome} isCurrency currency={userData?.currency} loading={loading} iconColor="#00d09c" />
          <MobileStatCard label="Expenses" value={summary.totalExpenses} isCurrency currency={userData?.currency} loading={loading} iconColor="#ff5a7a" />
          <MobileStatCard label="Net Worth" value={summary.netWorth} isCurrency currency={userData?.currency} loading={loading} iconColor="#ffffff" />
          <MobileStatCard label="Avg Monthly" value={summary.monthlySpending} isCurrency currency={userData?.currency} loading={loading} iconColor="#7c5cff" />
        </div>
        {!loading && monthlyTrend.length > 0 && (
          <MobileSection>
            <div className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-4">
              <p className="text-[12px] font-medium text-white mb-2">Monthly Income vs Expenses</p>
              <div className="h-[140px] min-h-[1px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend.slice(-6)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="month" stroke="#6b7b8d" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#6b7b8d" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#161a27', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="income" fill="#00D09C" radius={[4,4,0,0]} name="Income" />
                    <Bar dataKey="expenses" fill="#FF5A6E" radius={[4,4,0,0]} name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </MobileSection>
        )}
        {!loading && categoryBreakdown.length > 0 && (
          <MobileSection>
            <div className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-4">
              <p className="text-[12px] font-medium text-white mb-2">Category Breakdown</p>
              <div className="space-y-1.5">
                {categoryBreakdown.slice(0, 6).map((cat, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-[12px] text-[#6b7b8d] truncate">{cat.category}</span>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="text-[12px] font-medium text-white">{formatCurrency(cat.amount, userData?.currency)}</span>
                      <span className="text-[10px] text-[#6b7b8d] ml-1">({cat.percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </MobileSection>
        )}
        {!loading && (
          <MobileSection>
            <div className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" style={{ color: health.color }} />
                  <span className="text-[12px] font-medium text-white">Financial Health</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${health.bg}`}>{health.label}</span>
              </div>
              <p className="text-[22px] font-bold" style={{ color: health.color }}>{summary.financialHealthScore}/100</p>
              <MobileDivider />
              <div className="mt-3 grid grid-cols-2 gap-3 text-[11px]">
                <div><span className="text-[#6b7b8d]">Savings Rate: </span><span className="text-white">{summary.savingsPercentage.toFixed(1)}%</span></div>
                <div><span className="text-[#6b7b8d]">Monthly: </span><span className="text-white">{formatCurrency(summary.monthlySpending, userData?.currency)}</span></div>
              </div>
            </div>
          </MobileSection>
        )}
        {loading && (
          <MobileSection>
            <MobileLoadingSkeleton count={4} type="card" />
          </MobileSection>
        )}
      </MobilePage>
    </div>
    {/* Desktop version */}
    <div className="hidden lg:block">
    <div className="page-container space-y-5 animate-fade-in pt-3 sm:pt-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Deep insights into your finances</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Avg Daily Spend" value={formatCurrency(dailyAvg, userData?.currency)} icon={Calendar} color="bg-primary" loading={loading} />
        <StatCard title="Avg Monthly" value={formatCurrency(summary.monthlySpending, userData?.currency)} icon={CreditCard} color="bg-rose-500" loading={loading} />
        <StatCard title="Highest Month" value={formatCurrency(monthlyTrend.length > 0 ? Math.max(...monthlyTrend.map(m => m.expenses)) : 0, userData?.currency)} icon={BarChart4} color="bg-amber-500" loading={loading} />
        <StatCard title="Net Worth" value={formatCurrency(summary.netWorth, userData?.currency)} icon={Wallet} color="bg-emerald-500" loading={loading} />
      </div>

      {/* Health Score */}
      <Card className="bg-gradient-to-br from-primary/5 to-purple-600/5 border-primary/10">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="relative h-20 w-20 shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="30" fill="none" stroke="var(--border)" strokeWidth="6" />
                <circle cx="36" cy="36" r="30" fill="none" stroke={health.color} strokeWidth="6" strokeDasharray={`${summary.financialHealthScore * 1.884} 188.4`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Heart className="h-6 w-6" style={{ color: health.color }} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">Financial Health Score</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${health.bg}`}>{health.label}</span>
              </div>
              <p className="text-3xl font-bold" style={{ color: health.color }}>{summary.financialHealthScore}/100</p>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Savings Rate', value: summary.savingsPercentage.toFixed(1) + '%', good: summary.savingsPercentage >= 20 },
                  { label: 'Expense Ratio', value: summary.totalIncome > 0 ? ((summary.totalExpenses / summary.totalIncome) * 100).toFixed(1) + '%' : '0%', good: summary.totalIncome > 0 ? (summary.totalExpenses / summary.totalIncome) * 100 <= 70 : true },
                  { label: 'Budget Usage', value: summary.totalBudget > 0 ? ((summary.totalBudgetSpent / summary.totalBudget) * 100).toFixed(1) + '%' : '0%', good: summary.totalBudget > 0 ? (summary.totalBudgetSpent / summary.totalBudget) * 100 <= 80 : true },
                  { label: 'Net Worth', value: formatCurrency(summary.netWorth, userData?.currency), good: summary.netWorth >= 0 },
                ].map((item) => (
                  <div key={item.label} className="text-xs">
                    <p className="text-muted-foreground">{item.label}</p>
                    <p className={`font-medium ${item.good ? 'text-emerald-500' : 'text-rose-500'}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Content */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <AnalyticsCharts
            monthlyTrend={monthlyTrend}
            categoryBreakdown={categoryBreakdown}
            weeklySpending={weeklySpending}
            loading={loading}
            tab="overview"
          />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 pt-4">
          <AnalyticsCharts
            monthlyTrend={monthlyTrend}
            categoryBreakdown={categoryBreakdown}
            weeklySpending={weeklySpending}
            loading={loading}
            tab="categories"
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4 pt-4">
          <AnalyticsCharts
            monthlyTrend={monthlyTrend}
            categoryBreakdown={categoryBreakdown}
            weeklySpending={weeklySpending}
            loading={loading}
            tab="trends"
          />
        </TabsContent>

        <TabsContent value="savings" className="space-y-4 pt-4">
          <AnalyticsCharts
            monthlyTrend={monthlyTrend}
            categoryBreakdown={categoryBreakdown}
            weeklySpending={weeklySpending}
            loading={loading}
            tab="savings"
          />
        </TabsContent>
      </Tabs>
    </div>
    </div>
    </>
  );
}
