'use client';

import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useExpenses } from '@/hooks/useExpenses';
import { Button, Card, CardContent, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Badge, Skeleton } from '@/components/ui';
import { TransactionDialog } from '@/components/transactions/TransactionDialog';
import { AnimatedContainer, AnimatedItem, TransactionActionMenu, ConfirmDeleteDialog, UniversalSearchBar, UniversalFilterChip, UniversalTransactionCard } from '@/components/shared';
import { Search, Receipt, Pencil, Trash2, Star, Copy, Share2 } from 'lucide-react';
import {
  MobilePage, MobilePageHeader, MobileSection, MobileEmptyState, MobileLoadingSkeleton,
} from '@/components/mobile';
import { formatCurrency, formatDate } from '@/utils/format';
import { safeDateInput } from '@/utils/helpers';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, CATEGORY_COLORS } from '@/constants';
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

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        if (!query) return true;
        const q = query.toLowerCase();
        return (
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.notes?.toLowerCase().includes(q) ||
          e.paymentMethod.toLowerCase().includes(q) ||
          (e.tags ?? []).some((t) => t.toLowerCase().includes(q))
        );
      })
      .filter((e) => categoryFilter === 'all' || e.category === categoryFilter)
      .filter((e) => methodFilter === 'all' || e.paymentMethod === methodFilter);
  }, [expenses, query, categoryFilter, methodFilter]);

  const clearFilters = useCallback(() => { setQuery(''); setCategoryFilter('all'); setMethodFilter('all'); }, []);
  const hasFilters = query || categoryFilter !== 'all' || methodFilter !== 'all';

  const categoryChips = useMemo(() => [
    { key: 'all', label: 'All' },
    ...EXPENSE_CATEGORIES.map((cat) => ({ key: cat, label: cat })),
  ], []);

  const handleEdit = useCallback((id: string) => setEditingId(id), []);
  const handleDelete = useCallback((id: string) => setDeletingId(id), []);
  const handleToggleFavorite = useCallback(async (id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;
    const newVal = !(expense as Expense).isFavorite;
    try { await toggleFavoriteExpense(id, newVal); } catch { /* ignore */ }
  }, [expenses, toggleFavoriteExpense]);
  const handleDuplicate = useCallback(async (id: string) => {
    try { await duplicateExpense(id); } catch { /* ignore */ }
  }, [duplicateExpense]);
  const handleShare = useCallback(async (description: string, amount: number) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Expense', text: `${description}: ${formatCurrency(amount, userData?.currency)}` });
      } catch { /* ignore */ }
    }
  }, [userData]);
  const handleEditSubmit = useCallback(async (id: string, data: Partial<Expense>) => {
    try { await updateExpense(id, data); setEditingId(null); } catch (e) { console.warn('[Search] Edit save failed', e); }
  }, [updateExpense]);
  const handleDeleteConfirm = useCallback(() => {
    if (deletingId) { deleteExpense(deletingId); setDeletingId(null); }
  }, [deletingId, deleteExpense]);

  return (
    <>
    <div className="lg:hidden">
      <MobilePage>
        <MobilePageHeader title="Search" subtitle="Find any transaction instantly" />

        <UniversalSearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search transactions..."
          autoFocus
        />

        <UniversalFilterChip
          chips={categoryChips}
          activeKey={categoryFilter}
          onChange={setCategoryFilter}
        />

        {hasFilters && (
          <div className="flex items-center justify-between -mt-2">
            <span className="text-[12px] text-[#6b7b8d] font-medium">
              {filteredExpenses.length} result{filteredExpenses.length !== 1 ? 's' : ''} found
            </span>
            <button
              onClick={clearFilters}
              className="text-[12px] font-semibold text-[#7C5CFF] hover:text-[#9B7FFF] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#7C5CFF]/10"
            >
              Clear filters
            </button>
          </div>
        )}

        {loading ? (
          <MobileLoadingSkeleton count={5} type="card" />
        ) : filteredExpenses.length === 0 ? (
          <MobileEmptyState
            icon={<Search className="h-12 w-12" />}
            title="No transactions found"
            description="Try another keyword or clear your filters."
            action={hasFilters ? (
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 text-[13px] font-semibold rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#6b47e6] text-white shadow-md shadow-[#7c5cff]/20 hover:shadow-lg hover:shadow-[#7c5cff]/30 transition-all active:scale-95"
              >
                Clear Filters
              </button>
            ) : undefined}
          />
        ) : (
          <MobileSection>
            <div className="space-y-3">
              {filteredExpenses.slice(0, 50).map((expense) => (
                <UniversalTransactionCard
                  key={expense.id}
                  icon={<Receipt className="h-[18px] w-[18px]" />}
                  iconColor={CATEGORY_COLORS[expense.category] || '#7c5cff'}
                  title={expense.description}
                  subtitle={`${expense.category}${expense.paymentMethod ? ` · ${expense.paymentMethod}` : ''}`}
                  date={formatDate(expense.expenseDate)}
                  amount={expense.amount}
                  currency={userData?.currency}
                  actions={[
                    { icon: Pencil, label: 'Edit', onClick: () => handleEdit(expense.id), color: '#7c5cff' },
                    { icon: Copy, label: 'Duplicate', onClick: () => handleDuplicate(expense.id), color: '#3b82f6' },
                    { icon: Star, label: (expense as Expense).isFavorite ? 'Remove from Favorites' : 'Mark as Favorite', onClick: () => handleToggleFavorite(expense.id), color: (expense as Expense).isFavorite ? '#ffb020' : '#6b7b8d' },
                    { icon: Share2, label: 'Share', onClick: () => handleShare(expense.description, expense.amount), color: '#00d09c' },
                    { icon: Trash2, label: 'Delete', onClick: () => handleDelete(expense.id), color: '#ff5a7a', destructive: true },
                  ]}
                />
              ))}
            </div>
            {filteredExpenses.length > 50 && (
              <div className="flex items-center justify-center pt-3">
                <span className="text-[12px] text-[#6b7b8d]">Showing 50 of {filteredExpenses.length} results</span>
              </div>
            )}
          </MobileSection>
        )}
      </MobilePage>
    </div>

    <div className="hidden lg:block">
      <div className="p-4 sm:p-6 lg:p-8 space-y-5 animate-fade-in max-w-[1000px] mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Search</h1>
          <p className="text-sm text-muted-foreground mt-1">Find any transaction instantly</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <UniversalSearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search transactions..."
              autoFocus
            />
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
              <Search className="h-3 w-3" /> Clear filters
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
              <Search className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No transactions found</p>
              <p className="text-xs mt-1 mb-4">Try another keyword or clear your filters.</p>
              {hasFilters && <Button variant="outline" onClick={clearFilters} className="text-xs">Clear Filters</Button>}
            </CardContent>
          </Card>
        ) : (
          <AnimatedContainer className="space-y-2">
            {filteredExpenses.slice(0, 50).map((expense) => (
              <AnimatedItem key={expense.id}>
                <Card className="overflow-hidden hover:shadow-md transition-all group border-white/[0.06] bg-[#141822]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${CATEGORY_COLORS[expense.category] || '#7c5cff'}15` }}
                        >
                          <Receipt className="h-5 w-5" style={{ color: CATEGORY_COLORS[expense.category] || '#7c5cff' }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white truncate">{expense.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-white/5 text-[#6b7b8d]">
                              {expense.category}
                            </Badge>
                            {expense.paymentMethod && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-white/[0.08] text-[#6b7b8d]">
                                {expense.paymentMethod}
                              </Badge>
                            )}
                            <span className="text-[#5a6b7d]">{formatDate(expense.expenseDate)}</span>
                          </div>
                          {expense.notes && (
                            <p className="text-xs text-[#5a6b7d] mt-0.5 truncate">{expense.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-3">
                        <span className="font-bold text-[15px] tabular-nums text-[#ff5a7a]">
                          -{formatCurrency(expense.amount, userData?.currency)}
                        </span>
                        <TransactionActionMenu
                          actions={[
                            { icon: Pencil, label: 'Edit', onClick: () => handleEdit(expense.id), color: '#7c5cff' },
                            { icon: Copy, label: 'Duplicate', onClick: () => handleDuplicate(expense.id), color: '#3b82f6' },
                            { icon: Star, label: (expense as Expense).isFavorite ? 'Remove from Favorites' : 'Mark as Favorite', onClick: () => handleToggleFavorite(expense.id), color: (expense as Expense).isFavorite ? '#ffb020' : '#6b7b8d' },
                            { icon: Share2, label: 'Share', onClick: () => handleShare(expense.description, expense.amount), color: '#00d09c' },
                            { icon: Trash2, label: 'Delete', onClick: () => handleDelete(expense.id), color: '#ff5a7a', destructive: true },
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
        onSubmit={async (data) => handleEditSubmit(editingExpense.id, data as Partial<Expense>)}
      />
    )}
    <ConfirmDeleteDialog
      open={!!deletingId}
      onOpenChange={(open) => { if (!open) setDeletingId(null); }}
      onConfirm={handleDeleteConfirm}
      title="Delete Expense"
      itemName={deletingId ? expenses.find(e => e.id === deletingId)?.description : undefined}
    />
    </>
  );
}
