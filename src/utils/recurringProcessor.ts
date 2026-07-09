import { firebaseService } from '@/firebase/services';

export async function processDueRules(userId: string): Promise<void> {
  try {
    const allRules = await firebaseService.recurringTransactions.getAll(userId);
    const now = new Date();
    const due = allRules.filter((r) => r.isActive && new Date(r.nextExecution) <= now);

    for (const rule of due) {
      try {
        if (rule.type === 'expense') {
          await firebaseService.expenses.add(userId, {
            amount: rule.amount,
            category: rule.category || 'Other',
            description: rule.description,
            notes: rule.notes,
            paymentMethod: rule.paymentMethod,
            expenseDate: now,
            tags: [],
            isRecurring: true,
            recurringInterval: rule.interval,
            isFavorite: false,
          } as any);
        } else {
          await firebaseService.income.add(userId, {
            amount: rule.amount,
            source: rule.source || 'Other',
            description: rule.description,
            notes: rule.notes,
            paymentMethod: rule.paymentMethod,
            incomeDate: now,
            tags: [],
            isRecurring: true,
            recurringInterval: rule.interval,
            isFavorite: false,
          } as any);
        }

        let next = new Date(rule.nextExecution);
        switch (rule.interval) {
          case 'daily': next.setDate(next.getDate() + 1); break;
          case 'weekly': next.setDate(next.getDate() + 7); break;
          case 'monthly': next.setMonth(next.getMonth() + 1); break;
          case 'yearly': next.setFullYear(next.getFullYear() + 1); break;
        }

        const nowMs = Date.now();
        while (next <= new Date(nowMs)) {
          switch (rule.interval) {
            case 'daily': next.setDate(next.getDate() + 1); break;
            case 'weekly': next.setDate(next.getDate() + 7); break;
            case 'monthly': next.setMonth(next.getMonth() + 1); break;
            case 'yearly': next.setFullYear(next.getFullYear() + 1); break;
          }
        }

        await firebaseService.recurringTransactions.update(rule.id, {
          nextExecution: next,
          lastExecuted: now,
        } as any);
      } catch (e) {
        console.error('Failed to process recurring rule', rule.id, e);
      }
    }
  } catch (e) {
    console.error('Failed to process recurring rules', e);
  }
}

export async function checkAndGenerateMonthlySummary(userId: string): Promise<void> {
  try {
    const settings = await firebaseService.settings.get(userId);
    if (!settings?.notifications?.monthlySummary) return;

    const now = new Date();
    const key = `monthly_summary_${now.getFullYear()}_${now.getMonth()}`;
    const lastSummary = localStorage.getItem(key);
    if (lastSummary) return;

    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    if (now.getDate() < lastDay) return;

    const expenses = await firebaseService.expenses.getAll(userId);
    const incomes = await firebaseService.income.getAll(userId);
    const budgets = await firebaseService.budgets.getAll(userId, now.getMonth(), now.getFullYear());

    const { generateMonthlySummary } = await import('./monthlySummary');
    await generateMonthlySummary(userId, expenses, incomes, budgets);
    localStorage.setItem(key, 'true');
  } catch (e) {
    console.error('Failed to generate monthly summary', e);
  }
}