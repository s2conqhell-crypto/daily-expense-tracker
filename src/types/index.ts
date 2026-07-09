export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  phone?: string;
  currency: string;
  language: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: ExpenseCategory;
  subCategory?: string;
  description: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  expenseDate: Date;
  receiptURL?: string;
  location?: string;
  tags: string[];
  isRecurring: boolean;
  recurringInterval?: RecurringInterval;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Income {
  id: string;
  userId: string;
  amount: number;
  source: IncomeSource;
  description: string;
  notes?: string;
  incomeDate: Date;
  paymentMethod: PaymentMethod;
  isRecurring: boolean;
  recurringInterval?: RecurringInterval;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  category: ExpenseCategory;
  month: number;
  year: number;
  amount: number;
  spent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavingGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  description?: string;
  color: string;
  icon: string;
  isCompleted: boolean;
  monthlyContribution?: number;
  priority?: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export interface Receipt {
  id: string;
  userId: string;
  expenseId?: string;
  url: string;
  name: string;
  size: number;
  type: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: Date;
}

export interface UserSettings {
  userId: string;
  currency: string;
  language: string;
  timezone: string;
  defaultCategory: ExpenseCategory;
  defaultPaymentMethod: PaymentMethod;
  notifications: NotificationSettings;
  theme: Theme;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  budgetLimit: boolean;
  monthlySummary: boolean;
  savingsReminder: boolean;
  recurringPayment: boolean;
  goalAchievement: boolean;
  pushNotifications: boolean;
}

export interface PrivacySettings {
  showBalance: boolean;
  showAnalytics: boolean;
}

export type ExpenseCategory =
  | 'Food'
  | 'Groceries'
  | 'Transport'
  | 'Fuel'
  | 'Electricity'
  | 'Water Bill'
  | 'Internet'
  | 'Mobile Recharge'
  | 'Rent'
  | 'EMI'
  | 'Shopping'
  | 'Entertainment'
  | 'Healthcare'
  | 'Medicine'
  | 'Education'
  | 'Insurance'
  | 'Investment'
  | 'Travel'
  | 'Subscription'
  | 'Business'
  | 'Gift'
  | 'Charity'
  | 'Pet'
  | 'Custom'
  | string;

export type IncomeSource =
  | 'Salary'
  | 'Business'
  | 'Freelancing'
  | 'Bonus'
  | 'Commission'
  | 'Rental Income'
  | 'Interest'
  | 'Refund'
  | 'Gift'
  | 'Cashback'
  | 'Other'
  | string;

export type PaymentMethod =
  | 'Cash'
  | 'UPI'
  | 'Credit Card'
  | 'Debit Card'
  | 'Bank Transfer'
  | 'Wallet'
  | 'Cheque'
  | 'Other';

export type RecurringInterval =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';

export type NotificationType =
  | 'budget_limit'
  | 'monthly_summary'
  | 'savings_reminder'
  | 'recurring_payment'
  | 'goal_achievement'
  | 'welcome';

export type Theme = 'light' | 'dark' | 'system';

export type TimeRange = 'today' | 'yesterday' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DashboardSummary {
  todaySpending: number;
  yesterdaySpending: number;
  weeklySpending: number;
  monthlySpending: number;
  yearlySpending: number;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsPercentage: number;
  currentBalance: number;
  totalBudget: number;
  totalBudgetSpent: number;
  budgetRemaining: number;
  topCategory: { category: ExpenseCategory; amount: number };
  recentTransactions: (Expense | Income)[];
  financialHealthScore: number;
  netWorth: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface CategoryBreakdown {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  color: string;
}

export interface ExpenseFilters {
  search?: string;
  category?: ExpenseCategory;
  paymentMethod?: PaymentMethod;
  dateRange?: DateRange;
  minAmount?: number;
  maxAmount?: number;
  type?: 'income' | 'expense';
  isRecurring?: boolean;
  tags?: string[];
}

export type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'category' | 'description';

export interface RecurringTransaction {
  id: string;
  userId: string;
  type: 'expense' | 'income';
  amount: number;
  category?: ExpenseCategory;
  source?: IncomeSource;
  description: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  nextExecution: Date;
  lastExecuted?: Date;
  isActive: boolean;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionCategory =
  | 'Netflix'
  | 'Spotify'
  | 'Prime Video'
  | 'Internet'
  | 'Electricity'
  | 'Water'
  | 'Phone'
  | 'Gym'
  | 'Office 365'
  | 'Custom';

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  category: SubscriptionCategory;
  customCategory?: string;
  monthlyCost: number;
  yearlyCost: number;
  renewalDate: Date;
  autoRenew: boolean;
  reminderEnabled: boolean;
  status: 'active' | 'paused' | 'expired';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Loan {
  id: string;
  userId: string;
  name: string;
  principalAmount: number;
  interestRate: number;
  emiAmount: number;
  paidEmi: number;
  totalEmi: number;
  outstandingBalance: number;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'defaulted';
  paymentHistory: LoanPayment[];
  nextEmiDate?: Date;
  emiDay?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoanPayment {
  date: Date;
  amount: number;
  type: 'emi' | 'prepayment' | 'late_fee';
}

export interface DashboardWidget {
  id: string;
  visible: boolean;
  order: number;
  pinned: boolean;
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
}
