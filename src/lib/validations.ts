import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional().default(false),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const expenseSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  notes: z.string().optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  expenseDate: z.date(),
  receiptURL: z.string().optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.string().optional(),
  isFavorite: z.boolean().default(false),
});

export const incomeSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  source: z.string().min(1, 'Source is required'),
  description: z.string().min(1, 'Description is required'),
  notes: z.string().optional(),
  incomeDate: z.date(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.string().optional(),
  isFavorite: z.boolean().default(false),
});

export const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.number().min(1, 'Budget amount must be greater than 0'),
  month: z.number().min(0).max(11),
  year: z.number().min(2024).max(2100),
});

export const savingGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  targetAmount: z.number().min(1, 'Target amount must be greater than 0'),
  currentAmount: z.number().min(0).default(0),
  targetDate: z.date(),
  description: z.string().optional(),
  color: z.string().default('#4F46E5'),
  icon: z.string().default('piggy-bank'),
});

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  currency: z.string().min(1, 'Currency is required'),
  language: z.string().min(1, 'Language is required'),
  timezone: z.string().min(1, 'Timezone is required'),
});

export const settingsSchema = z.object({
  currency: z.string().min(1),
  defaultCategory: z.string().min(1),
  defaultPaymentMethod: z.string().min(1),
  language: z.string().min(1),
  timezone: z.string().min(1),
  notifications: z.object({
    budgetLimit: z.boolean(),
    monthlySummary: z.boolean(),
    savingsReminder: z.boolean(),
    recurringPayment: z.boolean(),
    goalAchievement: z.boolean(),
    pushNotifications: z.boolean(),
  }),
  privacy: z.object({
    showBalance: z.boolean(),
    showAnalytics: z.boolean(),
  }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;
export type IncomeFormData = z.infer<typeof incomeSchema>;
export type BudgetFormData = z.infer<typeof budgetSchema>;
export type SavingGoalFormData = z.infer<typeof savingGoalSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type SettingsFormData = z.infer<typeof settingsSchema>;
