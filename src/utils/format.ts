export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (
  date: Date | string | undefined | null | { toDate: () => Date },
  format: 'short' | 'long' | 'relative' | 'month-year' = 'short'
): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : 'toDate' in (date as object) ? (date as { toDate: () => Date }).toDate() : date as Date;

  switch (format) {
    case 'short':
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(d);
    case 'long':
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(d);
    case 'relative': {
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days === 0) return 'Today';
      if (days === 1) return 'Yesterday';
      if (days < 7) return `${days} days ago`;
      if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
      if (days < 365) return `${Math.floor(days / 30)} months ago`;
      return `${Math.floor(days / 365)} years ago`;
    }
    case 'month-year':
      return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
      }).format(d);
    default:
      return d.toLocaleDateString();
  }
};

export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatCompactCurrency = (amount: number, currency: string = 'USD'): string => {
  const abs = Math.abs(amount);
  let formatted: string;
  if (abs >= 1_000_000_000) {
    formatted = `${(amount / 1_000_000_000).toFixed(1)}B`;
  } else if (abs >= 1_000_000) {
    formatted = `${(amount / 1_000_000).toFixed(1)}M`;
  } else if (abs >= 1_000) {
    formatted = `${(amount / 1_000).toFixed(1)}K`;
  } else {
    formatted = amount.toFixed(0);
  }

  const currencySymbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥',
    CAD: 'CA$', AUD: 'A$', SGD: 'S$', AED: 'د.إ', SAR: '﷼',
  };
  const symbol = currencySymbols[currency] || '$';
  return `${symbol}${formatted}`;
};
