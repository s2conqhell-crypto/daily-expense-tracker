import { firebaseService } from '@/firebase/services';
import type { Budget, Expense } from '@/types';
import { calculateBudgetProgress, calculateBudgetStatus, calculateBudgetSpent } from './budget';

const ALERT_THRESHOLDS = [80, 90, 100];

interface AlertCheck {
  threshold: number;
  type: 'budget_limit';
  title: string;
  message: (category: string, progress: number, spent: number, amount: number) => string;
}

const alerts: AlertCheck[] = [
  { threshold: 80, type: 'budget_limit', title: 'Budget Alert: 80% Used', message: (c, p, s, a) => `You've used ${p.toFixed(0)}% of your ${c} budget (₹${s.toFixed(0)} of ₹${a.toFixed(0)}).` },
  { threshold: 90, type: 'budget_limit', title: 'Budget Alert: 90% Used', message: (c, p, s, a) => `You've used ${p.toFixed(0)}% of your ${c} budget (₹${s.toFixed(0)} of ₹${a.toFixed(0)}). Almost there!` },
  { threshold: 100, type: 'budget_limit', title: 'Budget Alert: Limit Reached', message: (c, p, s, a) => `You've reached ${p.toFixed(0)}% of your ${c} budget (₹${s.toFixed(0)} of ₹${a.toFixed(0)}).` },
  { threshold: 101, type: 'budget_limit', title: 'Budget Alert: Over Budget', message: (c, p, s, a) => `You've exceeded your ${c} budget by ₹${(s - a).toFixed(0)} (${p.toFixed(0)}% used).` },
];

const notifiedThresholds: Record<string, Set<number>> = {};

function getAlertKey(budgetId: string, threshold: number): string {
  return `${budgetId}_${threshold}`;
}

export async function checkBudgetAlerts(userId: string, budgets: Budget[], expenses: Expense[]): Promise<string[]> {
  const created: string[] = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  for (const budget of budgets) {
    if (budget.month !== currentMonth || budget.year !== currentYear) continue;

    const spent = calculateBudgetSpent(budget, expenses);
    const progress = calculateBudgetProgress(spent, budget.amount);
    const status = calculateBudgetStatus(progress);

    if (!notifiedThresholds[budget.id]) {
      notifiedThresholds[budget.id] = new Set();
    }

    for (const alert of alerts) {
      const isOverBudget = alert.threshold === 101 && status === 'over_budget' && progress > 100;
      const isThreshold = progress >= alert.threshold && progress < alert.threshold + (alert.threshold === 100 ? 50 : 10);

      if (isThreshold || isOverBudget) {
        const key = getAlertKey(budget.id, alert.threshold);
        if (!notifiedThresholds[budget.id].has(alert.threshold)) {
          notifiedThresholds[budget.id].add(alert.threshold);
          try {
            await firebaseService.notifications.add(userId, {
              userId,
              title: alert.title,
              message: alert.message(budget.category, progress, spent, budget.amount),
              type: 'budget_limit',
              isRead: false,
              data: { budgetId: budget.id, category: budget.category, progress, spent, amount: budget.amount },
            });
            created.push(alert.title);
          } catch (e) {
            console.error('Failed to create budget alert notification', e);
          }
        }
      }
    }
  }

  return created;
}

export function resetBudgetAlerts(): void {
  Object.keys(notifiedThresholds).forEach((key) => {
    notifiedThresholds[key] = new Set();
  });
}