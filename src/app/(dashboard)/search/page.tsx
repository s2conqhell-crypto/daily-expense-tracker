'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useExpenses } from '@/hooks/useExpenses';
import { Button, Card, CardContent, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Badge, Skeleton } from '@/components/ui';
import { TransactionDialog } from '@/components/transactions/TransactionDialog';
import { AnimatedContainer, AnimatedItem, TransactionActionMenu, ConfirmDeleteDialog } from '@/components/shared';
import { Search as SearchIcon, Receipt, X, Pencil, Trash2, Star, Copy, Share2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/format';
import { toDate, safeDateInput } from '@/utils/helpers';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '@/constants';
import type { Expense } from '@/types';

export default function SearchPage() {
  const { userData } = useAuth();
  const { expenses, loading, deleteExpense, updateExpense, duplicateExpense, toggleFavoriteExpense } = useExpenses();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const editingExpense = editingId ? expenses.find(e => e.id === editingId) : null;

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
    <>
    {/* Mobile version */}
    <div className="lg:hidden">
      <div className="px-5 space-y-6">
        <div>
          <h1 className="text-[18px] font-bold text-white">Search</h1>
          <p className="text-[12px] text-[#6b7b8d]">Find any transaction instantly</p>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7b8d]" />
          <Input
            placeholder="Search by description, category, notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-11 pr-10 h-[52px] rounded-[16px] bg-[#161a27] border-white/[0.06] text-white placeholder:text-[#6b7b8d] text-[16px]"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7b8d]">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="flex-1 bg-[#161a27] border-white/[0.06] text-white h-11 rounded-[14px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {EXPENSE_CATEGORIES.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="flex-1 bg-[#161a27] border-white/[0.06] text-white h-11 rounded-[14px]"><SelectValue placeholder="Payment" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#6b7b8d]">{filteredExpenses.length} result{filteredExpenses.length !== 1 ? 's' : ''} found</span>
            <button onClick={clearFilters} className="text-[12px] font-medium text-[#7C5CFF]">Clear filters</button>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-[68px] bg-[#161a27] rounded-[16px] animate-pulse" />)}
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <SearchIcon className="h-12 w-12 text-white/10 mb-3" />
            <p className="text-[14px] font-medium text-white mb-1">No results found</p>
            <p className="text-[12px] text-[#6b7b8d] mb-4">Try adjusting your search or filters</p>
            {hasFilters && <button onClick={clearFilters} className="px-4 py-2 text-[13px] font-medium rounded-xl bg-[#7C5CFF]/20 text-[#7C5CFF]">Clear filters</button>}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredExpenses.slice(0, 50).map((expense) => (
              <div key={expense.id} className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Receipt className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-white truncate">{highlightMatch(expense.description)}</p>
                      <div className="flex items-center gap-2 text-[11px] text-[#6b7b8d] mt-0.5 flex-wrap">
                        <span className="bg-white/10 text-white text-[10px] px-1.5 py-0.5 rounded-full">{highlightMatch(expense.category)}</span>
                        {expense.paymentMethod && (
                          <span className="border border-white/[0.06] text-[#6b7b8d] text-[10px] px-1.5 py-0.5 rounded-full">{highlightMatch(expense.paymentMethod)}</span>
                        )}
                        <span>{formatDate(expense.expenseDate)}</span>
                      </div>
                      {expense.notes && (
                        <p className="text-[11px] text-[#6b7b8d] mt-0.5 truncate">{highlightMatch(expense.notes)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <span className="text-[14px] font-semibold text-[#ff5a7a]">-{formatCurrency(expense.amount, userData?.currency)}</span>
                    <TransactionActionMenu
                      actions={[
                        { icon: Pencil, label: 'Edit', onClick: () => setEditingId(expense.id), color: '#7c5cff' },
                        { icon: Star, label: (expense as any).isFavorite ? 'Remove from Favorites' : 'Add to Favorites', onClick: () => { const newVal = !(expense as any).isFavorite; toggleFavoriteExpense(expense.id, newVal).catch(() => {}); }, color: '#ffb020' },
                        { icon: Copy, label: 'Duplicate', onClick: () => duplicateExpense(expense.id).catch(() => {}), color: '#3b82f6' },
                        { icon: Share2, label: 'Share', onClick: () => { if (navigator.share) { navigator.share({ title: 'Expense', text: `${expense.description}: ${formatCurrency(expense.amount, userData?.currency)}` }); } }, color: '#10b981' },
                        { icon: Trash2, label: 'Delete', onClick: () => setDeletingId(expense.id), color: '#ff5a7a', destructive: true },
                      ]}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    {/* Desktop version */}
    <div className="hidden lg:block">
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
                    <div className="flex items-center gap-1 shrink-0 ml-3">
                      <span className="font-semibold text-rose-500">
                        -{formatCurrency(expense.amount, userData?.currency)}
                      </span>
                      <TransactionActionMenu
                        actions={[
                          { icon: Pencil, label: 'Edit', onClick: () => setEditingId(expense.id), color: '#7c5cff' },
                          { icon: Star, label: (expense as any).isFavorite ? 'Remove from Favorites' : 'Add to Favorites', onClick: () => { const newVal = !(expense as any).isFavorite; toggleFavoriteExpense(expense.id, newVal).catch(() => {}); }, color: '#ffb020' },
                          { icon: Copy, label: 'Duplicate', onClick: () => duplicateExpense(expense.id).catch(() => {}), color: '#3b82f6' },
                          { icon: Share2, label: 'Share', onClick: () => { if (navigator.share) { navigator.share({ title: 'Expense', text: `${expense.description}: ${formatCurrency(expense.amount, userData?.currency)}` }); } }, color: '#10b981' },
                          { icon: Trash2, label: 'Delete', onClick: () => setDeletingId(expense.id), color: '#ff5a7a', destructive: true },
                        ]}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedItem>
          ))}
        </AnimatedContainer>
      )}
    </div>
    </div>

    {/* Dialogs */}
    {editingExpense && (
      <TransactionDialog
        type="expense" open={true} onOpenChange={() => setEditingId(null)}
        defaultValues={{
          amount: String(editingExpense.amount), description: editingExpense.description,
          notes: editingExpense.notes || '', category: editingExpense.category,
          expenseDate: safeDateInput(editingExpense.expenseDate),
          paymentMethod: editingExpense.paymentMethod, isRecurring: editingExpense.isRecurring,
          recurringInterval: editingExpense.recurringInterval || 'monthly',
        }}
        onSubmit={async (data) => {
          try { await updateExpense(editingExpense.id, data as Partial<Expense>); setEditingId(null); } catch (e) { console.warn('[Search] Edit save failed', e); }
        }}
      />
    )}
    <ConfirmDeleteDialog
      open={!!deletingId}
      onOpenChange={(open) => { if (!open) setDeletingId(null); }}
      onConfirm={() => { if (deletingId) { deleteExpense(deletingId); setDeletingId(null); } }}
      title="Delete Expense"
      itemName={deletingId ? expenses.find(e => e.id === deletingId)?.description : undefined}
    />
    </>
  );
}
