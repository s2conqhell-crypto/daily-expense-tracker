'use client';
import { memo } from 'react';

interface MobileAmountDisplayProps {
  value: number;
  currency?: string;
  showSign?: boolean;
  isIncome?: boolean;
}

const currencySymbols: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹',
  CAD: 'C$', AUD: 'A$', BRL: 'R$', CHF: 'Fr', CNY: '¥',
  KRW: '₩', MXN: 'Mex$', RUB: '₽', SAR: '﷼', SGD: 'S$',
  LKR: 'Rs', PKR: 'Rs', BDT: '৳', NPR: 'Rs', MYR: 'RM',
};

export const MobileAmountDisplay = memo(function MobileAmountDisplay({
  value, currency = 'USD', showSign, isIncome,
}: MobileAmountDisplayProps) {
  const symbol = currencySymbols[currency] || currency.slice(0, 2);
  const formatted = Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const prefix = showSign ? (isIncome ? '+' : '-') : '';

  return <>{prefix}{symbol}{formatted}</>;
});
