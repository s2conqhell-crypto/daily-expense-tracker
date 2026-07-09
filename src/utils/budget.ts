import type { Budget, Expense } from '@/types';
import { toDate } from './helpers';

export type BudgetStatus = 'on_track' | 'near_limit' | 'over_budget';

export function normalizeCategory(category: string): string {
  return category.toLowerCase().trim();
}

export function calculateBudgetSpent(
  budget: Pick<Budget, 'category' | 'month' | 'year'>,
  expenses: Expense[]
): number {
  const normalizedCategory = normalizeCategory(budget.category);
  return expenses
    .filter((expense) => {
      const date = toDate(expense.expenseDate);
      return (
        normalizeCategory(expense.category) === normalizedCategory &&
        date.getMonth() === budget.month &&
        date.getFullYear() === budget.year
      );
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
}

export function calculateTotalBudgetSpent(
  budgets: Budget[],
  expenses: Expense[]
): number {
  return budgets.reduce(
    (total, budget) => total + calculateBudgetSpent(budget, expenses),
    0
  );
}

export function calculateRemainingBudget(
  budgetAmount: number,
  spent: number
): number {
  return Math.max(0, budgetAmount - spent);
}

export function calculateBudgetProgress(
  spent: number,
  budgetAmount: number
): number {
  if (budgetAmount <= 0) return 0;
  return (spent / budgetAmount) * 100;
}

export function calculateBudgetStatus(progress: number): BudgetStatus {
  if (progress > 100) return 'over_budget';
  if (progress > 80) return 'near_limit';
  return 'on_track';
}
