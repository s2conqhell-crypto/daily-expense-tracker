'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { firebaseService } from '@/firebase/services';
import { useAuth } from '@/contexts/AuthContext';
import type { DashboardSummary, Expense, Income, Budget, MonthlyTrend, CategoryBreakdown, ChartDataPoint } from '@/types';
import { getDateRange, calculateFinancialHealthScore, toDate } from '@/utils/helpers';
import { calculateTotalBudgetSpent } from '@/utils/budget';
import { CATEGORY_COLORS } from '@/constants';

export function useDashboard() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loadingStates, setLoadingStates] = useState({ expenses: true, incomes: true, budgets: false });

  const loading = loadingStates.expenses || loadingStates.incomes;

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const unsubExpenses = firebaseService.expenses.subscribe(user.uid, (data) => {
      if (cancelled) return;
      setExpenses(data);
      setLoadingStates((prev) => (prev.expenses ? { ...prev, expenses: false } : prev));
    });
    const unsubIncomes = firebaseService.income.subscribe(user.uid, (data) => {
      if (cancelled) return;
      setIncomes(data);
      setLoadingStates((prev) => (prev.incomes ? { ...prev, incomes: false } : prev));
    });
    const unsubBudgets = firebaseService.budgets.subscribe(user.uid, (data) => {
      if (cancelled) return;
      setBudgets(data);
    });
    return () => { cancelled = true; unsubExpenses(); unsubIncomes(); unsubBudgets(); };
  }, [user]);

  const getTotalForRange = useCallback(<T extends { amount: number }>(items: T[], range: ReturnType<typeof getDateRange>, getDate: (item: T) => Date) => {
    return items
      .filter((item) => {
        const d = getDate(item);
        return d >= range.start && d <= range.end;
      })
      .reduce((sum, item) => sum + item.amount, 0);
  }, []);

  const summary: DashboardSummary = useMemo(() => {
    const todayRange = getDateRange('today');
    const yesterdayRange = getDateRange('yesterday');
    const weeklyRange = getDateRange('weekly');
    const monthlyRange = getDateRange('monthly');
    const yearlyRange = getDateRange('yearly');

    const todayExpenses = getTotalForRange(expenses, todayRange, (e) => toDate(e.expenseDate));
    const yesterdayExpenses = getTotalForRange(expenses, yesterdayRange, (e) => toDate(e.expenseDate));
    const weeklyExpenses = getTotalForRange(expenses, weeklyRange, (e) => toDate(e.expenseDate));
    const monthlyExpenses = getTotalForRange(expenses, monthlyRange, (e) => toDate(e.expenseDate));
    const yearlyExpenses = getTotalForRange(expenses, yearlyRange, (e) => toDate(e.expenseDate));

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const savings = totalIncome - totalExpenses;
    const currentBalance = totalIncome - totalExpenses;
    const savingsPercentage = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    const categoryTotals: Record<string, number> = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    const topCategoryEntry = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0];

    const recentTransactions = [
      ...expenses.slice(0, 5).map((e) => ({ ...e, type: 'expense' as const })),
      ...incomes.slice(0, 5).map((i) => ({ ...i, type: 'income' as const })),
    ].sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()).slice(0, 10);

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalBudgetSpent = calculateTotalBudgetSpent(budgets, expenses);
    const budgetRemaining = totalBudget > 0 ? totalBudget - totalBudgetSpent : 0;

    return {
      todaySpending: todayExpenses,
      yesterdaySpending: yesterdayExpenses,
      weeklySpending: weeklyExpenses,
      monthlySpending: monthlyExpenses,
      yearlySpending: yearlyExpenses,
      totalIncome,
      totalExpenses,
      savings,
      savingsPercentage,
      currentBalance,
      totalBudget,
      totalBudgetSpent,
      budgetRemaining,
      topCategory: { category: (topCategoryEntry?.[0] as Expense['category']) || 'Other', amount: topCategoryEntry?.[1] || 0 },
      recentTransactions,
      financialHealthScore: calculateFinancialHealthScore(totalIncome, totalExpenses, savings, totalBudget > 0 ? (totalBudgetSpent / totalBudget) * 100 : 0),
      netWorth: currentBalance,
    };
  }, [expenses, incomes, budgets, getTotalForRange]);

  const monthlyTrend: MonthlyTrend[] = useMemo(() => {
    const months: MonthlyTrend[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleString('default', { month: 'short' });
      const monthIncome = incomes
        .filter((inc) => {
          const incDate = toDate(inc.incomeDate);
          return incDate.getMonth() === d.getMonth() && incDate.getFullYear() === d.getFullYear();
        })
        .reduce((sum, inc) => sum + inc.amount, 0);
      const monthExpenses = expenses
        .filter((exp) => {
          const expDate = toDate(exp.expenseDate);
          return expDate.getMonth() === d.getMonth() && expDate.getFullYear() === d.getFullYear();
        })
        .reduce((sum, exp) => sum + exp.amount, 0);
      months.push({ month: monthStr, income: monthIncome, expenses: monthExpenses, savings: monthIncome - monthExpenses });
    }
    return months;
  }, [expenses, incomes]);

  const categoryBreakdown: CategoryBreakdown[] = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const catTotals: Record<string, number> = {};
    expenses.forEach((e) => {
      catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
    });
    return Object.entries(catTotals)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => ({
        category: category as Expense['category'],
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: CATEGORY_COLORS[category] || '#607D8B',
      }));
  }, [expenses]);

  const weeklySpending: ChartDataPoint[] = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return days.map((day, index) => {
      const dayStart = new Date(startOfWeek);
      dayStart.setDate(startOfWeek.getDate() + index);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const total = expenses
        .filter((e) => {
          const d = toDate(e.expenseDate);
          return d >= dayStart && d <= dayEnd;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      return { name: day, value: total };
    });
  }, [expenses]);

  return { summary, monthlyTrend, categoryBreakdown, weeklySpending, loading };
}
