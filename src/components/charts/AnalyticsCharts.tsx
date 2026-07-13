'use client';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';
import type { MonthlyTrend, CategoryBreakdown, ChartDataPoint } from '@/types';

const COLORS = ['#6366F1', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

interface Props {
  monthlyTrend: MonthlyTrend[];
  categoryBreakdown: CategoryBreakdown[];
  weeklySpending: ChartDataPoint[];
  loading: boolean;
  tab?: 'overview' | 'categories' | 'trends' | 'savings';
}

export function AnalyticsCharts({ monthlyTrend, categoryBreakdown, weeklySpending, loading, tab }: Props) {
  const savingsTrend = useMemo(() => {
    return monthlyTrend.map((m) => ({
      ...m,
      savingsRate: m.income > 0 ? (m.savings / m.income) * 100 : 0,
    }));
  }, [monthlyTrend]);

  if (tab === 'categories') {
    return (
      <Card>
        <CardHeader><CardTitle>Category Breakdown</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-[300px]" /> : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div style={{ minHeight: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="amount" nameKey="category">
                      {categoryBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {categoryBreakdown.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-sm">{cat.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{cat.amount}</p>
                      <p className="text-xs text-muted-foreground">{cat.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (tab === 'trends') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Weekly Spending</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[250px]" /> : (
              <div style={{ minHeight: 250, width: '100%' }}>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={weeklySpending}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" tick={{ fontSize: 12 }} />
                    <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="value" stroke="#6366F1" fill="url(#colorPrimary)" strokeWidth={2} name="Spending" />
                    <defs>
                      <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Income Growth</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[250px]" /> : (
              <div style={{ minHeight: 250, width: '100%' }}>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" tick={{ fontSize: 12 }} />
                    <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} name="Income" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tab === 'savings') {
    return (
      <Card>
        <CardHeader><CardTitle>Savings Trend</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-[300px]" /> : (
            <div style={{ minHeight: 300, width: '100%' }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={savingsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                  <Legend />
                  <Bar dataKey="savings" fill="#10B981" radius={[6, 6, 0, 0]} name="Savings" />
                  <Bar dataKey="savingsRate" fill="#6366F1" radius={[6, 6, 0, 0]} name="Savings Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Monthly Income vs Expenses</CardTitle></CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-[300px]" /> : (
          <div style={{ minHeight: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }} />
                <Legend />
                <Bar dataKey="income" fill="#10B981" radius={[6, 6, 0, 0]} name="Income" />
                <Bar dataKey="expenses" fill="#EF4444" radius={[6, 6, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
