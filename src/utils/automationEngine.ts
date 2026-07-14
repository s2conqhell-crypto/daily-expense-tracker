'use client';

import { firebaseService } from '@/firebase/services';
import type { Expense, Income, RecurringTransaction, Subscription, Loan } from '@/types';

interface ProcessResult {
  recurringExpenses: number;
  recurringIncome: number;
  subscriptions: number;
  loanEmis: number;
  errors: number;
}

const LOG_PREFIX = '[AutomationEngine]';

function log(...args: unknown[]) {
  if (process.env.NODE_ENV === 'development') {
    console.log(LOG_PREFIX, ...args);
  }
}

function getLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isDueOrOverdue(nextDate: Date | string | undefined): boolean {
  if (!nextDate) return false;
  const d = typeof nextDate === 'string' ? new Date(nextDate) : nextDate;
  const today = new Date(getLocalDate() + 'T00:00:00');
  return d <= today;
}

function advanceDate(current: Date, interval: string): Date {
  const next = new Date(current);
  switch (interval) {
    case 'daily': next.setDate(next.getDate() + 1); break;
    case 'weekly': next.setDate(next.getDate() + 7); break;
    case 'monthly': next.setMonth(next.getMonth() + 1); break;
    case 'yearly': next.setFullYear(next.getFullYear() + 1); break;
    case 'quarterly': next.setMonth(next.getMonth() + 3); break;
    case 'half-yearly': next.setMonth(next.getMonth() + 6); break;
  }
  return next;
}

function computeNextExecution(originalNext: Date, interval: string): Date {
  let next = new Date(originalNext);
  const today = new Date(getLocalDate() + 'T00:00:00');
  while (next <= today) {
    next = advanceDate(next, interval);
  }
  return next;
}

export async function processDueSubscriptions(userId: string): Promise<number> {
  log('Processing subscriptions...');
  const allSubs = await firebaseService.subscriptions.getAll(userId);
  const due = allSubs.filter((s) => s.status === 'active' && isDueOrOverdue(s.renewalDate));
  log(`Subscriptions due: ${due.length}`);

  let count = 0;
  for (const sub of due) {
    try {
      const existingExpenses = await firebaseService.expenses.getAll(userId);
      const hasDuplicate = existingExpenses.some(
        (e) => e.description === `${sub.name} (Subscription)` &&
        new Date(e.expenseDate).toDateString() === new Date().toDateString()
      );
      if (hasDuplicate) {
        log(`Skip duplicate subscription: ${sub.name}`);
        continue;
      }

      await firebaseService.expenses.add(userId, {
        userId,
        amount: sub.monthlyCost,
        category: 'Subscription' as const,
        description: `${sub.name} (Subscription)`,
        notes: `Auto-renewed subscription`,
        paymentMethod: 'Bank Transfer' as const,
        expenseDate: new Date(),
        tags: ['subscription', 'auto'],
        isRecurring: true,
        recurringInterval: 'monthly',
        isFavorite: false,
      } as Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>);

      const nextRenewal = advanceDate(new Date(), 'monthly');
      await firebaseService.subscriptions.update(sub.id, {
        renewalDate: nextRenewal,
        lastRenewed: new Date(),
      } as Partial<Subscription>);

      await firebaseService.notifications.add(userId, {
        userId,
        title: 'Subscription Renewed',
        message: `${sub.name} has been renewed automatically.`,
        type: 'recurring_payment' as const,
        isRead: false,
        data: { subscriptionId: sub.id, amount: sub.monthlyCost },
      });

      count++;
      log(`Subscription processed: ${sub.name}`);
    } catch (e) {
      console.error(`${LOG_PREFIX} Failed subscription: ${sub.name}`, e);
    }
  }
  return count;
}

export async function processDueLoans(userId: string): Promise<number> {
  log('Processing loans...');
  const allLoans = await firebaseService.loans.getAll(userId);
  const activeLoans = allLoans.filter((l) => l.status === 'active');
  const due = activeLoans.filter((l) => isDueOrOverdue(l.nextEmiDate));
  log(`Loan EMIs due: ${due.length}`);

  let count = 0;
  for (const loan of due) {
    try {
      const existingExpenses = await firebaseService.expenses.getAll(userId);
      const hasDuplicate = existingExpenses.some(
        (e) => e.description === `EMI: ${loan.name || 'Loan'}` &&
        new Date(e.expenseDate).toDateString() === new Date().toDateString()
      );
      if (hasDuplicate) {
        log(`Skip duplicate EMI for: ${loan.name}`);
        continue;
      }

      const newPaidEmi = loan.paidEmi + 1;
      const newOutstanding = Math.max(0, loan.outstandingBalance - loan.emiAmount);
      const isCompleted = newPaidEmi >= loan.totalEmi || newOutstanding <= 0;

      const nextEmi = new Date(loan.nextEmiDate || loan.startDate);
      const targetDay = loan.emiDay || nextEmi.getDate();
      nextEmi.setMonth(nextEmi.getMonth() + 1);
      const lastDay = new Date(nextEmi.getFullYear(), nextEmi.getMonth() + 1, 0).getDate();
      nextEmi.setDate(Math.min(targetDay, lastDay));
      const nextEmiCatchUp = new Date(nextEmi);
      const todayDate = new Date(getLocalDate() + 'T00:00:00');
      while (nextEmiCatchUp <= todayDate) {
        const nextTargetDay = loan.emiDay || nextEmiCatchUp.getDate();
        nextEmiCatchUp.setMonth(nextEmiCatchUp.getMonth() + 1);
        const lastDay2 = new Date(nextEmiCatchUp.getFullYear(), nextEmiCatchUp.getMonth() + 1, 0).getDate();
        nextEmiCatchUp.setDate(Math.min(nextTargetDay, lastDay2));
      }

      await firebaseService.expenses.add(userId, {
        userId,
        amount: loan.emiAmount,
        category: 'Loan',
        description: `EMI: ${loan.name || 'Loan'}`,
        notes: `Auto-generated EMI payment`,
        paymentMethod: 'Bank Transfer' as const,
        expenseDate: new Date(),
        tags: ['loan', 'emi', 'auto'],
        isRecurring: false,
        isFavorite: false,
      } as Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>);

      await firebaseService.loans.update(loan.id, {
        paidEmi: newPaidEmi,
        outstandingBalance: newOutstanding,
        status: isCompleted ? 'completed' : 'active',
        ...(isCompleted ? {} : { nextEmiDate: nextEmiCatchUp }),
        ...(isCompleted ? { endDate: new Date() } : {}),
      } as Partial<Loan>);

      await firebaseService.notifications.add(userId, {
        userId,
        title: 'EMI Processed',
        message: `EMI payment of ${loan.emiAmount} processed for ${loan.name || 'Loan'}.`,
        type: 'recurring_payment' as const,
        isRead: false,
        data: { loanId: loan.id, amount: loan.emiAmount, remaining: newOutstanding },
      });

      count++;
      log(`EMI processed: ${loan.name}`);
    } catch (e) {
      console.error(`${LOG_PREFIX} Failed EMI for: ${loan.name}`, e);
    }
  }
  return count;
}

export async function processDueRecurringRules(userId: string): Promise<{ expenses: number; income: number }> {
  log('Processing recurring rules...');
  const allRules = await firebaseService.recurringTransactions.getAll(userId);
  const due = allRules.filter((r) => r.isActive && isDueOrOverdue(r.nextExecution));
  log(`Recurring rules due: ${due.length}`);

  let expenseCount = 0;
  let incomeCount = 0;

  for (const rule of due) {
    try {
      const originalNext = new Date(rule.nextExecution);
      const today = new Date(getLocalDate() + 'T00:00:00');
      let cursor = new Date(originalNext);

      const existingExpenses = rule.type === 'expense' ? await firebaseService.expenses.getAll(userId) : [];
      const existingIncomes = rule.type === 'income' ? await firebaseService.income.getAll(userId) : [];

      let batchCount = 0;
      while (cursor <= today) {
        const dateStr = cursor.toISOString().split('T')[0];
        const hasDuplicate = rule.type === 'expense'
          ? existingExpenses.some((e) => e.description === rule.description && new Date(e.expenseDate).toISOString().startsWith(dateStr))
          : existingIncomes.some((i) => i.description === rule.description && new Date(i.incomeDate).toISOString().startsWith(dateStr));

        if (!hasDuplicate) {
          if (rule.type === 'expense') {
            await firebaseService.expenses.add(userId, {
              userId,
              amount: rule.amount,
              category: rule.category || 'Other',
              description: rule.description,
              notes: rule.notes,
              paymentMethod: rule.paymentMethod,
              expenseDate: cursor,
              tags: ['recurring', 'auto'],
              isRecurring: true,
              recurringInterval: rule.interval,
              isFavorite: false,
            } as Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>);
            expenseCount++;
          } else {
            await firebaseService.income.add(userId, {
              userId,
              amount: rule.amount,
              source: rule.source || 'Other',
              description: rule.description,
              notes: rule.notes,
              paymentMethod: rule.paymentMethod,
              incomeDate: cursor,
              tags: ['recurring', 'auto'],
              isRecurring: true,
              recurringInterval: rule.interval,
              isFavorite: false,
            } as Omit<Income, 'id' | 'createdAt' | 'updatedAt'>);
            incomeCount++;
          }
          batchCount++;
          log(`Created: ${rule.description} for ${dateStr}`);
        }

        cursor = advanceDate(cursor, rule.interval);
      }

      const nextExec = computeNextExecution(new Date(originalNext), rule.interval);
      await firebaseService.recurringTransactions.update(rule.id, {
        nextExecution: nextExec,
        lastExecuted: new Date(),
      } as Partial<RecurringTransaction>);

      if (batchCount > 0) {
        const typeLabel = rule.type === 'expense' ? 'Expense' : 'Income';
        const itemLabel = rule.type === 'expense' ? 'expenses' : 'income';
        await firebaseService.notifications.add(userId, {
          userId,
        title: `Recurring ${typeLabel} Created`,
        message: `${batchCount} recurring ${itemLabel} created for "${rule.description}".`,
        type: 'recurring_payment' as const,
          isRead: false,
          data: { ruleId: rule.id, count: batchCount },
        });
      }

      log(`Rule processed: ${rule.description} (${batchCount} created)`);
    } catch (e) {
      console.error(`${LOG_PREFIX} Failed recurring rule: ${rule.id}`, e);
    }
  }
  return { expenses: expenseCount, income: incomeCount };
}

export async function runAutomation(userId: string): Promise<ProcessResult> {
  log('=== Automation Engine Started ===');
  log('User:', userId);
  log('Local date:', getLocalDate());

  const result: ProcessResult = { recurringExpenses: 0, recurringIncome: 0, subscriptions: 0, loanEmis: 0, errors: 0 };

  try {
    const recurring = await processDueRecurringRules(userId);
    result.recurringExpenses = recurring.expenses;
    result.recurringIncome = recurring.income;
  } catch (e) {
    console.error(`${LOG_PREFIX} Recurring processing failed`, e);
    result.errors++;
  }

  try {
    result.subscriptions = await processDueSubscriptions(userId);
  } catch (e) {
    console.error(`${LOG_PREFIX} Subscription processing failed`, e);
    result.errors++;
  }

  try {
    result.loanEmis = await processDueLoans(userId);
  } catch (e) {
    console.error(`${LOG_PREFIX} Loan processing failed`, e);
    result.errors++;
  }

  try {
    const { checkAndGenerateMonthlySummary } = await import('./recurringProcessor');
    await checkAndGenerateMonthlySummary(userId);
  } catch (e) {
    console.error(`${LOG_PREFIX} Monthly summary failed`, e);
  }

  const total = result.recurringExpenses + result.recurringIncome + result.subscriptions + result.loanEmis;
  log('=== Automation Engine Completed ===');
  log(`Total processed: ${total}`);
  if (total > 0) {
    log(`  Recurring expenses: ${result.recurringExpenses}`);
    log(`  Recurring income: ${result.recurringIncome}`);
    log(`  Subscriptions: ${result.subscriptions}`);
    log(`  Loan EMIs: ${result.loanEmis}`);
  }
  if (result.errors > 0) {
    log(`  Errors: ${result.errors}`);
  }

  return result;
}
