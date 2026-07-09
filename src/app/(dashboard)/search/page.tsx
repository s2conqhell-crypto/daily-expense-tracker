'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useExpenses } from '@/hooks/useExpenses';
import { Button, Card, CardContent, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Badge, Skeleton } from '@/components/ui';
import { AnimatedContainer, AnimatedItem } from '@/components/shared';
import { Search as SearchIcon, Receipt, X } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/format';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '@/constants';

export default function SearchPage() {
  const { userData } = useAuth();
  const { expenses, loading } = useExpenses();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const filteredExpenses = expenses
    .filter((e) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.notes?.toLowerCase().includes(q) ||
        e.paymentMethod.toLowerCase().includes(q) ||
        e.tags?.some((t) => t.toLowerCase().includes(q))
      );
    })
    .filter((e) => categoryFilter === 'all' || e.category === categoryFilter)
    .filter((e) => methodFilter === 'all' || e.paymentMethod === methodFilter);

  const clearFilters = () => { setQuery(''); setCategoryFilter('all'); setMethodFilter('all'); };
  const hasFilters = query || categoryFilter !== 'all' || methodFilter !== 'all';

  const highlightMatch = (text: string) => {
    if (!query || !text) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} className="bg-primary/20 text-primary-foreground rounded-sm px-0.5">{part}</mark>
        : part
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 animate-fade-in max-w-[1000px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search</h1>
        <p className="text-sm text-muted-foreground">Find any transaction instantly</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by description, category, notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-9"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {EXPENSE_CATEGORIES.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Payment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{filteredExpenses.length} result{filteredExpenses.length !== 1 ? 's' : ''} found</span>
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 gap-1 text-xs">
            <X className="h-3 w-3" /> Clear filters
          </Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-[72px] w-full rounded-xl" />)}
        </div>
      ) : filteredExpenses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <SearchIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No results found</p>
            {hasFilters && <Button variant="link" onClick={clearFilters} className="text-xs">Clear filters</Button>}
          </CardContent>
        </Card>
      ) : (
        <AnimatedContainer className="space-y-2">
          {filteredExpenses.slice(0, 50).map((expense) => (
            <AnimatedItem key={expense.id}>
              <Card className="overflow-hidden hover:shadow-md transition-all group">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Receipt className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{highlightMatch(expense.description)}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {highlightMatch(expense.category)}
                          </Badge>
                          {expense.paymentMethod && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {highlightMatch(expense.paymentMethod)}
                            </Badge>
                          )}
                          <span>{formatDate(expense.expenseDate)}</span>
                        </div>
                        {expense.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{highlightMatch(expense.notes)}</p>
                        )}
                      </div>
                    </div>
                    <span className="font-semibold text-rose-500 shrink-0 ml-3">
                      -{formatCurrency(expense.amount, userData?.currency)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </AnimatedItem>
          ))}
        </AnimatedContainer>
      )}
    </div>
  );
}
