import { firebaseService } from '@/firebase/services';
import type { Expense, Income, Budget } from '@/types';
import { toDate } from '@/utils/helpers';
import { calculateTotalBudgetSpent } from '@/utils/budget';

export async function generateMonthlySummary(userId: string, expenses: Expense[], incomes: Income[], budgets: Budget[]): Promise<void> {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthExpenses = expenses.filter((e) => {
    const d = toDate(e.expenseDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthIncomes = incomes.filter((inc) => {
    const d = toDate(inc.incomeDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = monthIncomes.reduce((sum, inc) => sum + inc.amount, 0);
  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  const catTotals: Record<string, number> = {};
  monthExpenses.forEach((e) => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });
  const sortedCats = Object.entries(catTotals).sort(([, a], [, b]) => b - a);
  const topCategory = sortedCats[0]?.[0] || 'None';
  const topCategoryAmount = sortedCats[0]?.[1] || 0;

  const highestExpense = monthExpenses.length > 0
    ? Math.max(...monthExpenses.map((e) => e.amount))
    : 0;

  const highestIncome = monthIncomes.length > 0
    ? Math.max(...monthIncomes.map((inc) => inc.amount))
    : 0;

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalBudgetSpent = calculateTotalBudgetSpent(budgets, monthExpenses);
  const budgetUtil = totalBudget > 0 ? (totalBudgetSpent / totalBudget) * 100 : 0;

  const healthScore = totalIncome > 0
    ? Math.min(100, Math.round(
        (savingsRate * 0.4) +
        ((totalIncome - totalExpenses) / totalIncome * 100 * 0.3) +
        ((1 - budgetUtil / 100) * 100 * 0.3)
      ))
    : 0;

  const monthName = now.toLocaleString('default', { month: 'long' });

  await firebaseService.notifications.add(userId, {
    userId,
    title: `📊 Monthly Summary — ${monthName}`,
    message: [
      `Income: ₹${totalIncome.toFixed(2)}`,
      `Expenses: ₹${totalExpenses.toFixed(2)}`,
      `Savings: ₹${savings.toFixed(2)} (${savingsRate.toFixed(1)}%)`,
      `Top Category: ${topCategory} (₹${topCategoryAmount.toFixed(2)})`,
      `Highest Expense: ₹${highestExpense.toFixed(2)}`,
      `Highest Income: ₹${highestIncome.toFixed(2)}`,
      `Budget Used: ${budgetUtil.toFixed(0)}%`,
      `Health Score: ${healthScore}/100`,
    ].join('\n'),
    type: 'monthly_summary',
    isRead: false,
    data: {
      month: currentMonth,
      year: currentYear,
      totalIncome,
      totalExpenses,
      savings,
      savingsRate,
      topCategory,
      topCategoryAmount,
      highestExpense,
      highestIncome,
      budgetUtil,
      healthScore,
    },
  });
}