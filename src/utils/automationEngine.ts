'use client';

import { firebaseService } from '@/firebase/services';
import { getFirebaseDB } from '@/firebase/config';
import {
  doc,
  collection,
  runTransaction,
  Timestamp,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '@/constants';

interface ProcessResult {
  recurringExpenses: number;
  recurringIncome: number;
  subscriptions: number;
  loanEmis: number;
  errors: number;
}

const LOG_PREFIX = '[AutomationEngine]';

let isProcessing = false;
let processingQueue = 0;

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

function getTodayStart(): Date {
  return new Date(getLocalDate() + 'T00:00:00');
}

function getTodayEnd(): Date {
  return new Date(getLocalDate() + 'T23:59:59.999');
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

function computeNextExecution(currentNext: Date, interval: string): Date {
  let next = new Date(currentNext);
  const today = getTodayStart();
  while (next <= today) {
    next = advanceDate(next, interval);
  }
  return next;
}

async function getTodayDescriptionMatch(
  userId: string,
  collectionName: string,
  description: string
): Promise<boolean> {
  const start = getTodayStart();
  const end = getTodayEnd();
  const dateField = collectionName === FIRESTORE_COLLECTIONS.INCOME ? 'incomeDate' : 'expenseDate';
  const q = query(
    collection(getFirebaseDB(), collectionName),
    where('userId', '==', userId),
    where(dateField, '>=', Timestamp.fromDate(start)),
    where(dateField, '<=', Timestamp.fromDate(end))
  );
  const snap = await getDocs(q);
  return snap.docs.some((d) => d.data().description === description);
}

const db = getFirebaseDB();

export async function processDueSubscriptions(userId: string): Promise<number> {
  log('Checking subscriptions...');
  const allSubs = await firebaseService.subscriptions.getAll(userId);
  const activeSubs = allSubs.filter((s) => s.status === 'active');
  const today = getTodayStart();
  log(`Active subscriptions: ${activeSubs.length}`);

  let count = 0;
  for (const sub of activeSubs) {
    const renewal = sub.renewalDate instanceof Timestamp
      ? (sub.renewalDate as unknown as Timestamp).toDate()
      : new Date(sub.renewalDate as unknown as Date);
    if (renewal > today) continue;

    log(`Processing subscription: ${sub.name} (renewal: ${renewal.toISOString()})`);

    try {
      const alreadyExists = await getTodayDescriptionMatch(
        userId,
        FIRESTORE_COLLECTIONS.EXPENSES,
        `${sub.name} (Subscription)`
      );
      if (alreadyExists) {
        log(`Duplicate found, skipping: ${sub.name}`);
        continue;
      }

      const subDocRef = doc(db, FIRESTORE_COLLECTIONS.SUBSCRIPTIONS, sub.id);
      const newExpenseRef = doc(collection(db, FIRESTORE_COLLECTIONS.EXPENSES));

      const nextRenewal = advanceDate(renewal, 'monthly');

      await runTransaction(db, async (tx) => {
        const subSnap = await tx.get(subDocRef);
        if (!subSnap.exists()) return;
        const currentRenewal = (subSnap.data() as Record<string, unknown>).renewalDate as Timestamp;
        if (currentRenewal.toMillis() !== (sub.renewalDate instanceof Timestamp
          ? (sub.renewalDate as unknown as Timestamp).toMillis()
          : new Date(sub.renewalDate).getTime())) {
          log(`Subscription was already updated by another process: ${sub.name}`);
          return;
        }

        tx.set(newExpenseRef, {
          userId,
          amount: sub.monthlyCost,
          category: 'Subscription',
          description: `${sub.name} (Subscription)`,
          notes: 'Auto-renewed subscription',
          paymentMethod: 'Bank Transfer',
          expenseDate: Timestamp.fromDate(new Date()),
          tags: ['subscription', 'auto'],
          isRecurring: true,
          recurringInterval: 'monthly',
          isFavorite: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        tx.update(subDocRef, {
          renewalDate: Timestamp.fromDate(nextRenewal),
          lastRenewed: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      await firebaseService.notifications.add(userId, {
        userId,
        title: 'Subscription Renewed',
        message: `${sub.name} has been renewed automatically.`,
        type: 'recurring_payment',
        isRead: false,
        data: { subscriptionId: sub.id, amount: sub.monthlyCost },
      });

      count++;
      log(`Subscription processed: ${sub.name} -> next: ${nextRenewal.toISOString()}`);
    } catch (e) {
      console.error(`${LOG_PREFIX} Failed subscription: ${sub.name}`, e);
    }
  }
  return count;
}

export async function processDueLoans(userId: string): Promise<number> {
  log('Checking loans...');
  const allLoans = await firebaseService.loans.getAll(userId);
  const activeLoans = allLoans.filter((l) => l.status === 'active');
  const today = getTodayStart();
  log(`Active loans: ${activeLoans.length}`);

  let count = 0;
  for (const loan of activeLoans) {
    const loanNextEmiDate = loan.nextEmiDate;
    if (!loanNextEmiDate) continue;
    const nextEmiOriginalMs = loanNextEmiDate instanceof Timestamp
      ? (loanNextEmiDate as unknown as Timestamp).toMillis()
      : new Date(loanNextEmiDate).getTime();
    const nextEmi = new Date(nextEmiOriginalMs);
    if (nextEmi > today) continue;

    log(`Processing loan EMI: ${loan.name} (due: ${nextEmi.toISOString()})`);

    try {
      const alreadyExists = await getTodayDescriptionMatch(
        userId,
        FIRESTORE_COLLECTIONS.EXPENSES,
        `EMI: ${loan.name || 'Loan'}`
      );
      if (alreadyExists) {
        log(`Duplicate found, skipping EMI for: ${loan.name}`);
        continue;
      }

      const newPaidEmi = loan.paidEmi + 1;
      const newOutstanding = Math.max(0, loan.outstandingBalance - loan.emiAmount);
      const isCompleted = newPaidEmi >= loan.totalEmi || newOutstanding <= 0;

      const targetDay = loan.emiDay || nextEmi.getDate();
      const nextEmiDate = new Date(nextEmi);
      nextEmiDate.setMonth(nextEmiDate.getMonth() + 1);
      const lastDay = new Date(nextEmiDate.getFullYear(), nextEmiDate.getMonth() + 1, 0).getDate();
      nextEmiDate.setDate(Math.min(targetDay, lastDay));
      const nextEmiCatchUp = new Date(nextEmiDate);
      while (nextEmiCatchUp <= today) {
        const nextTargetDay = loan.emiDay || nextEmiCatchUp.getDate();
        nextEmiCatchUp.setMonth(nextEmiCatchUp.getMonth() + 1);
        const lastDay2 = new Date(nextEmiCatchUp.getFullYear(), nextEmiCatchUp.getMonth() + 1, 0).getDate();
        nextEmiCatchUp.setDate(Math.min(nextTargetDay, lastDay2));
      }

      const loanDocRef = doc(db, FIRESTORE_COLLECTIONS.LOANS, loan.id);
      const newExpenseRef = doc(collection(db, FIRESTORE_COLLECTIONS.EXPENSES));

      await runTransaction(db, async (tx) => {
        const loanSnap = await tx.get(loanDocRef);
        if (!loanSnap.exists()) return;
        const currentNextEmi = (loanSnap.data() as Record<string, unknown>).nextEmiDate as Timestamp | null;
        if (currentNextEmi && currentNextEmi.toMillis() !== nextEmiOriginalMs) {
          log(`Loan was already updated by another process: ${loan.name}`);
          return;
        }

        tx.set(newExpenseRef, {
          userId,
          amount: loan.emiAmount,
          category: 'Loan',
          description: `EMI: ${loan.name || 'Loan'}`,
          notes: 'Auto-generated EMI payment',
          paymentMethod: 'Bank Transfer',
          expenseDate: Timestamp.fromDate(new Date()),
          tags: ['loan', 'emi', 'auto'],
          isRecurring: false,
          isFavorite: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        const updateData: Record<string, unknown> = {
          paidEmi: newPaidEmi,
          outstandingBalance: newOutstanding,
          status: isCompleted ? 'completed' : 'active',
          updatedAt: serverTimestamp(),
        };
        if (!isCompleted) {
          updateData.nextEmiDate = Timestamp.fromDate(nextEmiCatchUp);
        } else {
          updateData.endDate = serverTimestamp();
          updateData.nextEmiDate = null;
        }
        tx.update(loanDocRef, updateData);
      });

      await firebaseService.notifications.add(userId, {
        userId,
        title: 'EMI Processed',
        message: `EMI payment of ${loan.emiAmount} processed for ${loan.name || 'Loan'}.`,
        type: 'recurring_payment',
        isRead: false,
        data: { loanId: loan.id, amount: loan.emiAmount, remaining: newOutstanding },
      });

      count++;
      log(`EMI processed: ${loan.name} -> remaining: ${newOutstanding}, next: ${isCompleted ? 'completed' : nextEmiCatchUp.toISOString()}`);
    } catch (e) {
      console.error(`${LOG_PREFIX} Failed EMI for: ${loan.name}`, e);
    }
  }
  return count;
}

export async function processDueRecurringRules(userId: string): Promise<{ expenses: number; income: number }> {
  log('Checking recurring rules...');
  const allRules = await firebaseService.recurringTransactions.getAll(userId);
  const activeRules = allRules.filter((r) => r.isActive);
  const today = getTodayStart();
  log(`Active recurring rules: ${activeRules.length}`);

  let expenseCount = 0;
  let incomeCount = 0;

  for (const rule of activeRules) {
    const nextExecution = rule.nextExecution instanceof Timestamp
      ? (rule.nextExecution as unknown as Timestamp).toDate()
      : new Date(rule.nextExecution as unknown as Date);
    if (nextExecution > today) continue;

    log(`Processing rule: ${rule.description} (next: ${nextExecution.toISOString()})`);

    try {
      const expenseColl = FIRESTORE_COLLECTIONS.EXPENSES;
      const incomeColl = FIRESTORE_COLLECTIONS.INCOME;
      const collName = rule.type === 'expense' ? expenseColl : incomeColl;

      const alreadyExists = await getTodayDescriptionMatch(userId, collName, rule.description);
      if (alreadyExists) {
        log(`Duplicate found, skipping rule: ${rule.description}`);
        continue;
      }

      const ruleDocRef = doc(db, FIRESTORE_COLLECTIONS.RECURRING_TRANSACTIONS, rule.id);
      const newTransRef = doc(collection(db, collName));

      const nextExec = computeNextExecution(new Date(nextExecution), rule.interval);

      await runTransaction(db, async (tx) => {
        const ruleSnap = await tx.get(ruleDocRef);
        if (!ruleSnap.exists()) return;
        const currentNext = (ruleSnap.data() as Record<string, unknown>).nextExecution as Timestamp;
        if (currentNext.toMillis() !== (rule.nextExecution instanceof Timestamp
          ? (rule.nextExecution as unknown as Timestamp).toMillis()
          : new Date(rule.nextExecution).getTime())) {
          log(`Rule was already updated by another process: ${rule.description}`);
          return;
        }

        const baseData: Record<string, unknown> = {
          userId,
          amount: rule.amount,
          description: rule.description,
          notes: rule.notes || '',
          paymentMethod: rule.paymentMethod,
          tags: ['recurring', 'auto'],
          isRecurring: true,
          recurringInterval: rule.interval,
          isFavorite: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        if (rule.type === 'expense') {
          tx.set(newTransRef, {
            ...baseData,
            category: rule.category || 'Other',
            expenseDate: Timestamp.fromDate(new Date()),
          });
        } else {
          tx.set(newTransRef, {
            ...baseData,
            source: rule.source || 'Other',
            incomeDate: Timestamp.fromDate(new Date()),
          });
        }

        tx.update(ruleDocRef, {
          nextExecution: Timestamp.fromDate(nextExec),
          lastExecuted: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      await firebaseService.notifications.add(userId, {
        userId,
        title: `Recurring ${rule.type === 'expense' ? 'Expense' : 'Income'} Created`,
        message: `Recurring ${rule.type === 'expense' ? 'expense' : 'income'} created for "${rule.description}".`,
        type: 'recurring_payment',
        isRead: false,
        data: { ruleId: rule.id },
      });

      if (rule.type === 'expense') expenseCount++;
      else incomeCount++;
      log(`Rule processed: ${rule.description} -> next: ${nextExec.toISOString()}`);
    } catch (e) {
      console.error(`${LOG_PREFIX} Failed recurring rule: ${rule.id}`, e);
    }
  }
  return { expenses: expenseCount, income: incomeCount };
}

export async function runAutomation(userId: string): Promise<ProcessResult> {
  if (isProcessing) {
    processingQueue++;
    log(`Already processing. Queue depth: ${processingQueue}. Skipping.`);
    return { recurringExpenses: 0, recurringIncome: 0, subscriptions: 0, loanEmis: 0, errors: 0 };
  }

  isProcessing = true;
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

  isProcessing = false;
  return result;
}
