export const EXPENSE_CATEGORIES = [
  'Food', 'Groceries', 'Transport', 'Fuel', 'Electricity',
  'Water Bill', 'Internet', 'Mobile Recharge', 'Rent', 'EMI',
  'Shopping', 'Entertainment', 'Healthcare', 'Medicine', 'Education',
  'Insurance', 'Investment', 'Travel', 'Subscription', 'Business',
  'Gift', 'Charity', 'Pet', 'Other',
] as const;

export const INCOME_SOURCES = [
  'Salary', 'Business', 'Freelancing', 'Bonus', 'Commission',
  'Rental Income', 'Interest', 'Refund', 'Gift', 'Cashback', 'Other',
] as const;

export const PAYMENT_METHODS = [
  'Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer',
  'Wallet', 'Cheque', 'Other',
] as const;

export const RECURRING_INTERVALS = [
  { value: 'daily' as const, label: 'Daily' },
  { value: 'weekly' as const, label: 'Weekly' },
  { value: 'biweekly' as const, label: 'Bi-Weekly' },
  { value: 'monthly' as const, label: 'Monthly' },
  { value: 'quarterly' as const, label: 'Quarterly' },
  { value: 'yearly' as const, label: 'Yearly' },
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
  { code: 'NPR', symbol: '₨', name: 'Nepalese Rupee' },
];

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ar', name: 'العربية' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'pt', name: 'Português' },
  { code: 'ur', name: 'اردو' },
  { code: 'zh', name: '中文' },
];

export const TIMEZONES = Intl.supportedValuesOf?.('timeZone') ?? [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Kolkata',
  'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney',
];

export const CATEGORY_COLORS: Record<string, string> = {
  Food: '#FF6B6B',
  Groceries: '#4ECDC4',
  Transport: '#45B7D1',
  Fuel: '#96CEB4',
  Electricity: '#FFEAA7',
  'Water Bill': '#DDA0DD',
  Internet: '#98D8C8',
  'Mobile Recharge': '#F7DC6F',
  Rent: '#E74C3C',
  EMI: '#3498DB',
  Shopping: '#9B59B6',
  Entertainment: '#1ABC9C',
  Healthcare: '#E67E22',
  Medicine: '#2ECC71',
  Education: '#F39C12',
  Insurance: '#16A085',
  Investment: '#27AE60',
  Travel: '#2980B9',
  Subscription: '#8E44AD',
  Business: '#2C3E50',
  Gift: '#E91E63',
  Charity: '#FF5722',
  Pet: '#795548',
  Other: '#607D8B',
};

export const APP_NAME = 'ExpenseFlow';
export const APP_TAGLINE = 'Smart Expense Tracking';
export const APP_DESCRIPTION = 'Track your expenses, manage budgets, and achieve financial goals with ExpenseFlow.';

export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  EXPENSES: 'expenses',
  INCOME: 'income',
  BUDGETS: 'budgets',
  SAVING_GOALS: 'savingGoals',
  RECEIPTS: 'receipts',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  RECURRING_TRANSACTIONS: 'recurringTransactions',
  SUBSCRIPTIONS: 'subscriptions',
  LOANS: 'loans',
  DASHBOARD_LAYOUT: 'dashboardLayout',
} as const;

export const SUBSCRIPTION_CATEGORIES = [
  'Netflix', 'Spotify', 'Prime Video', 'Internet',
  'Electricity', 'Water', 'Phone', 'Gym',
  'Office 365', 'Custom',
] as const;

export const LOAN_STATUSES = ['active', 'completed', 'defaulted'] as const;

export const RECURRING_INTERVAL_TYPES = ['daily', 'weekly', 'monthly', 'yearly'] as const;

export const WIDGET_IDS = [
  'hero_balance',
  'kpi_cards',
  'income_vs_expenses',
  'budget_progress',
  'quick_actions',
  'recent_transactions',
  'upcoming_recurring',
  'upcoming_renewals',
  'subscription_cost',
  'loan_progress',
  'upcoming_emi',
  'savings_goals',
  'monthly_summary',
] as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [5, 10, 20, 50],
} as const;

export const STORAGE_KEYS = {
  THEME: 'expenseflow-theme',
  ONBOARDING: 'expenseflow-onboarding',
  REMEMBER_ME: 'expenseflow-remember',
} as const;

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  DASHBOARD: '/dashboard',
  EXPENSES: '/expenses',
  INCOME: '/income',
  BUDGETS: '/budgets',
  SAVINGS: '/savings',
  ANALYTICS: '/analytics',
  CALENDAR: '/calendar',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  SEARCH: '/search',
  RECURRING: '/recurring',
  SUBSCRIPTIONS: '/subscriptions',
  LOANS: '/loans',
} as const;
