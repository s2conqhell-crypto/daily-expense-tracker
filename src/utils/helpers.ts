import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

export const toDate = (value: unknown): Date => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (typeof value === 'object' && 'toDate' in (value as object)) {
    return (value as { toDate: () => Date }).toDate();
  }
  return new Date(value as string | number);
};

export const getDateRange = (range: 'today' | 'yesterday' | 'weekly' | 'monthly' | 'yearly'): { start: Date; end: Date } => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'yesterday': {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date(now);
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
      yesterdayEnd.setHours(23, 59, 59, 999);
      return { start: yesterday, end: yesterdayEnd };
    }
    case 'weekly': {
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      start.setDate(now.getDate() - diff);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case 'monthly':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'yearly':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
};

export const getMonthDays = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getStartOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const getEndOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

export const getMonthName = (month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return months[month];
};

export const calculateFinancialHealthScore = (
  totalIncome: number,
  totalExpenses: number,
  savings: number,
  budgetUtilization: number
): number => {
  let score = 100;

  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
  if (savingsRate < 10) score -= 20;
  else if (savingsRate < 20) score -= 10;

  const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 100;
  if (expenseRatio > 90) score -= 20;
  else if (expenseRatio > 70) score -= 10;

  if (budgetUtilization > 100) score -= 15;
  else if (budgetUtilization > 80) score -= 5;

  return Math.max(0, Math.min(100, score));
};

export const compressImage = async (
  file: File,
  maxWidth: number = 1024,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Could not get canvas context')); return; }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              reject(new Error('Compression failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
    };
    reader.onerror = reject;
  });
};

export const downloadFile = (url: string, filename: string): void => {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const sanitizeString = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

export const sanitizeObject = <T extends Record<string, unknown>>(obj: T, fields: (keyof T)[]): T => {
  const result = { ...obj };
  for (const field of fields) {
    const val = result[field];
    if (typeof val === 'string') {
      result[field] = sanitizeString(val) as T[keyof T];
    }
  }
  return result;
};

export const stripHtml = (value: string): string => {
  return value.replace(/<[^>]*>/g, '');
};

export const safeDateInput = (value: unknown): string => {
  const d = toDate(value);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

export const isValidDate = (d: Date): boolean => {
  return d instanceof Date && !isNaN(d.getTime());
};
