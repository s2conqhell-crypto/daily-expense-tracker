'use client';

import { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card, CardContent, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Badge, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { TransactionDialog } from '@/components/transactions/TransactionDialog';
import { AnimatedContainer, AnimatedItem, TransactionActionMenu, ConfirmDeleteDialog } from '@/components/shared';
import {
  Plus, Search, Filter, Pencil, Trash2, Receipt,
  TrendingDown, CreditCard, ArrowUpDown, ArrowDown,
  Check, X, Download, Clock, Star, Copy, Share2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/format';
import { toDate, safeDateInput } from '@/utils/helpers';
import { EXPENSE_CATEGORIES } from '@/constants';
import { useIsMobile } from '@/hooks/useMediaQuery';
import type { Expense, SortOption } from '@/types';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  MobilePage, MobilePageHeader, MobileSection, MobileCard, MobileStatCard,
  MobileSearchBar, MobileFilterBar, buildDefaultActions,
  MobileEmptyState, MobileLoadingSkeleton,
} from '@/components/mobile';

const PAGE_SIZE = 10;

export default function ExpensesPage() {
  return (
    <Suspense fallback={<div className="p-5 space-y-4"><div className="h-8 w-40 bg-white/5 rounded animate-pulse" /><div className="h-[200px] bg-white/5 rounded animate-pulse" /></div>}>
      <ExpensesContent />
    </Suspense>
  );
}

function ExpensesContent() {
  const { expenses, loading, addExpense, updateExpense, deleteExpense, duplicateExpense, toggleFavoriteExpense } = useExpenses();
  const { userData } = useAuth();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sort, setSort] = useState<SortOption>('date-desc');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const selectedExpenses = expenses.filter((e) => selected.has(e.id));
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get('add') === '1') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDialogOpen(true);
    }
  }, [searchParams]);

  const handleDialogOpen = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      router.replace(pathname, { scroll: false });
      setEditingId(null);
    }
  }, [router, pathname]);

  const editingExpense = editingId ? expenses.find((e) => e.id === editingId) : null;

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteExpense(id);
      toast.success('Expense deleted');
    } catch { toast.error('Failed to delete'); }
    setDeletingId(null);
  }, [deleteExpense]);

  const handleEditSubmit = useCallback(async (data: Record<string, unknown>) => {
    if (!editingId) return;
    try {
      await updateExpense(editingId, data as Partial<Expense>);
      toast.success('Expense updated');
      setEditingId(null);
    } catch { toast.error('Failed to update'); }
  }, [editingId, updateExpense]);

  const handleBulkDelete = useCallback(async () => {
    const count = selected.size;
    try {
      await Promise.all(Array.from(selected).map((id) => deleteExpense(id)));
      toast.success(`${count} expenses deleted`);
      setSelected(new Set());
    } catch { toast.error('Bulk delete failed'); }
  }, [selected, deleteExpense]);

  const handleBulkExport = useCallback(() => {
    const data = selectedExpenses.map((e) => ({
      description: e.description,
      amount: e.amount,
      category: e.category,
      date: formatDate(e.expenseDate),
      paymentMethod: e.paymentMethod,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'expenses-export.json'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported successfully');
  }, [selectedExpenses]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((e) => e.id)));
  };

  const dateRanges = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
    const startOfMonthStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    return { todayStr, startOfWeekStr, startOfMonthStr };
  }, []);

  const filtered = useMemo(() =>
    expenses
      .filter((e) => {
        if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
        if (search && !e.description.toLowerCase().includes(search.toLowerCase()) && !e.notes?.toLowerCase().includes(search.toLowerCase())) return false;
        const d = safeDateInput(e.expenseDate);
        if (dateFilter === 'today' && d !== dateRanges.todayStr) return false;
        if (dateFilter === 'week' && d < dateRanges.startOfWeekStr) return false;
        if (dateFilter === 'month' && d < dateRanges.startOfMonthStr) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sort) {
          case 'amount-desc': return b.amount - a.amount;
          case 'amount-asc': return a.amount - b.amount;
          case 'date-asc': return toDate(a.expenseDate).getTime() - toDate(b.expenseDate).getTime();
          default: return toDate(b.expenseDate).getTime() - toDate(a.expenseDate).getTime();
        }
      }),
    [expenses, categoryFilter, search, dateFilter, sort]
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const todayExpenses = expenses.filter((e) => safeDateInput(e.expenseDate) === dateRanges.todayStr);
  const monthlyExpenses = expenses.filter((e) => safeDateInput(e.expenseDate) >= dateRanges.startOfMonthStr);
  const highestExpense = expenses.length > 0 ? Math.max(...expenses.map((e) => e.amount)) : 0;
  const avgExpense = expenses.length > 0 ? expenses.reduce((s, e) => s + e.amount, 0) / expenses.length : 0;

  const sortComponent = (col: SortOption) => {
    if (sort === col) return <ArrowDown className="h-3 w-3 inline ml-0.5 text-primary" />;
    return <ArrowUpDown className="h-3 w-3 inline ml-0.5 text-muted-foreground/50" />;
  };

  const highlightMatch = (text: string) => {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase()
        ? <mark key={i} className="bg-primary/20 text-white rounded-sm px-0.5">{part}</mark>
        : part
    );
  };

  return (
    <>
    {/* Mobile version */}
    <div className="lg:hidden">
      <MobilePage>
        <MobilePageHeader
          title="Expenses"
          subtitle={`${filtered.length} of ${expenses.length} transactions`}
          right={
            <div className="text-right">
              <p className="m-text-amount text-white">{formatCurrency(expenses.reduce((s, e) => s + e.amount, 0), userData?.currency)}</p>
              <p className="m-text-tiny text-[#6b7b8d]">Total spent</p>
            </div>
          }
        />

        <MobileSection>
          <div className="grid grid-cols-2 gap-3">
            <MobileStatCard label="Today" value={todayExpenses.reduce((s, e) => s + e.amount, 0)} isCurrency currency={userData?.currency} loading={loading} iconColor="#ff5a7a" />
            <MobileStatCard label="Month" value={monthlyExpenses.reduce((s, e) => s + e.amount, 0)} isCurrency currency={userData?.currency} loading={loading} iconColor="#7c5cff" />
            <MobileStatCard label="Highest" value={highestExpense} isCurrency currency={userData?.currency} loading={loading} iconColor="#ffb020" />
            <MobileStatCard label="Average" value={avgExpense} isCurrency currency={userData?.currency} loading={loading} iconColor="#00d09c" />
          </div>
        </MobileSection>

        <MobileSearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search expenses..." />

        <MobileFilterBar
          chips={[
            { key: 'all', label: 'All Time' },
            { key: 'today', label: 'Today' },
            { key: 'week', label: 'Week' },
            { key: 'month', label: 'Month' },
          ]}
          activeKey={dateFilter}
          onChange={(key) => { setDateFilter(key as typeof dateFilter); setPage(1); }}
        />

        {loading ? (
          <MobileLoadingSkeleton count={5} type="card" />
        ) : filtered.length === 0 ? (
          <MobileEmptyState
            icon={<Receipt className="h-12 w-12" />}
            title="No expenses found"
            description={search || categoryFilter !== 'all' || dateFilter !== 'all' ? 'Try adjusting your filters' : 'Start tracking your spending'}
          />
        ) : (
          <MobileSection>
            <div className="space-y-2.5">
              {paged.map((expense) => (
                <MobileCard
                  key={expense.id}
                  icon={<Receipt className="h-[18px] w-[18px]" />}
                  iconColor="#ff5a7a"
                  title={expense.description}
                  subtitle={formatDate(expense.expenseDate)}
                  amount={expense.amount}
                  amountColor="danger"
                  amountPrefix="-"
                  currency={userData?.currency}
                  tags={[expense.category]}
                  actions={buildDefaultActions({
                    onEdit: () => setEditingId(expense.id),
                    onDelete: () => setDeletingId(expense.id),
                    onDuplicate: () => duplicateExpense(expense.id).catch(() => toast.error('Failed to duplicate')),
                    onToggleFavorite: () => { const newVal = !expense.isFavorite; toggleFavoriteExpense(expense.id, newVal).catch(() => toast.error('Failed to update favorite')); },
                    isFavorite: expense.isFavorite,
                    onShare: () => { if (navigator.share) { navigator.share({ title: 'Expense', text: `${expense.description}: ${formatCurrency(expense.amount, userData?.currency)}` }); } },
                  })}
                />
              ))}
            </div>
          </MobileSection>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="m-text-tiny text-[#6b7b8d]">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="m-touch rounded-xl bg-white/5 text-white text-sm font-medium disabled:opacity-30 active:scale-90 transition-all">&lt;</button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="m-touch rounded-xl bg-white/5 text-white text-sm font-medium disabled:opacity-30 active:scale-90 transition-all">&gt;</button>
            </div>
          </div>
        )}
      </MobilePage>
    </div>
    {/* Desktop version */}
    <div className="hidden lg:block">
    <div className="page-container space-y-5 animate-fade-in pt-3 sm:pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {expenses.length} transactions
            &nbsp;&middot; Total: {formatCurrency(expenses.reduce((s, e) => s + e.amount, 0), userData?.currency)}
          </p>
        </div>
        <Button className="gap-1.5 shrink-0" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Add Expense
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Today's Expenses", value: todayExpenses.reduce((s, e) => s + e.amount, 0), icon: Clock, color: '#ff5a7a' },
          { label: 'Monthly Expenses', value: monthlyExpenses.reduce((s, e) => s + e.amount, 0), icon: CreditCard, color: '#7C5CFF' },
          { label: 'Highest Expense', value: highestExpense, icon: TrendingDown, color: '#FBBF24' },
          { label: 'Average Expense', value: avgExpense, icon: Receipt, color: '#00D09C' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color + '15' }}>
                <stat.icon className="h-3.5 w-3.5" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-lg font-bold">
              {loading ? <span className="inline-block h-6 w-16 bg-muted rounded animate-pulse" /> : formatCurrency(stat.value, userData?.currency)}
            </p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
          <span className="text-sm font-medium text-primary">{selected.size} selected</span>
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleBulkExport}>
            <Download className="h-3 w-3" /> Export
          </Button>
          <Button variant="destructive" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleBulkDelete}>
            <Trash2 className="h-3 w-3" /> Delete
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSelected(new Set())}>
            <X className="h-3 w-3" /> Clear
          </Button>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search descriptions & notes..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {EXPENSE_CATEGORIES.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest</SelectItem>
            <SelectItem value="date-asc">Oldest</SelectItem>
            <SelectItem value="amount-desc">Highest</SelectItem>
            <SelectItem value="amount-asc">Lowest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 flex-wrap">
        {(['all', 'today', 'week', 'month'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setDateFilter(f); setPage(1); }}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
              dateFilter === f
                ? 'bg-primary/20 text-primary'
                : 'bg-accent/30 text-muted-foreground hover:bg-accent/60'
            }`}
          >
            {f === 'all' ? 'All Time' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Receipt className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No expenses found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search || categoryFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start tracking your spending'}
            </p>
            <Button variant="outline" className="gap-1.5" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" /> Add Your First Expense
            </Button>
          </CardContent>
        </Card>
      ) : isMobile ? (
        <AnimatedContainer className="space-y-2">
          {paged.map((expense) => (
            <AnimatedItem key={expense.id}>
              <Card className={selected.has(expense.id) ? 'ring-2 ring-primary' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleSelect(expense.id)} className="h-5 w-5 rounded border border-border flex items-center justify-center">
                        {selected.has(expense.id) && <Check className="h-3 w-3 text-primary" />}
                      </button>
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{highlightMatch(expense.description)}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{expense.category}</Badge>
                          <span>{formatDate(expense.expenseDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-rose-500 mr-1">
                        -{formatCurrency(expense.amount, userData?.currency)}
                      </span>
                      <TransactionActionMenu
                        actions={[
                          { icon: Pencil, label: 'Edit', onClick: () => setEditingId(expense.id), color: '#7c5cff' },
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
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <button onClick={toggleSelectAll} className="h-4 w-4 rounded border border-border flex items-center justify-center">
                      {selected.size === filtered.length && filtered.length > 0
                        ? <Check className="h-3 w-3 text-primary" />
                        : selected.size > 0 && <div className="h-2 w-2 rounded bg-primary/50" />
                      }
                    </button>
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => setSort(sort === 'date-desc' ? 'date-asc' : 'date-desc')}>
                    Date {sortComponent('date-desc')}
                  </TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => setSort(sort === 'amount-desc' ? 'amount-asc' : 'amount-desc')}>
                    Amount {sortComponent('amount-desc')}
                  </TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((expense) => (
                  <TableRow key={expense.id} className={`group ${selected.has(expense.id) ? 'bg-primary/5' : ''}`}>
                    <TableCell>
                      <button onClick={() => toggleSelect(expense.id)} className="h-4 w-4 rounded border border-border flex items-center justify-center">
                        {selected.has(expense.id) && <Check className="h-3 w-3 text-primary" />}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Receipt className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{highlightMatch(expense.description)}</p>
                          {expense.notes && <p className="text-xs text-muted-foreground">{highlightMatch(expense.notes)}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{expense.category}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(expense.expenseDate)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{expense.paymentMethod}</TableCell>
                    <TableCell className="text-right font-semibold text-rose-500">
                      -{formatCurrency(expense.amount, userData?.currency)}
                    </TableCell>
                    <TableCell>
                      <TransactionActionMenu
                        actions={[
                          { icon: Pencil, label: 'Edit', onClick: () => setEditingId(expense.id), color: '#7c5cff' },
                          { icon: Star, label: expense.isFavorite ? 'Remove from Favorites' : 'Add to Favorites', onClick: () => { const newVal = !expense.isFavorite; toggleFavoriteExpense(expense.id, newVal).catch(() => toast.error('Failed to update favorite')); }, color: '#ffb020' },
                          { icon: Copy, label: 'Duplicate', onClick: () => duplicateExpense(expense.id).catch(() => toast.error('Failed to duplicate')), color: '#3b82f6' },
                          { icon: Share2, label: 'Share', onClick: () => { if (navigator.share) { navigator.share({ title: 'Expense', text: `${expense.description}: ${formatCurrency(expense.amount, userData?.currency)}` }); } }, color: '#10b981' },
                          { icon: Trash2, label: 'Delete', onClick: () => setDeletingId(expense.id), color: '#ff5a7a', destructive: true },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-9 w-9 sm:h-8 sm:w-8 rounded-lg text-xs font-medium transition-all touch-target ${
                    page === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            {totalPages > 5 && <span className="px-1 text-muted-foreground self-center">...</span>}
            {totalPages > 5 && (
              <button onClick={() => setPage(totalPages)} className={`h-8 w-8 rounded-lg text-xs font-medium transition-all ${page === totalPages ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>
                {totalPages}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
    </div>
    
    {/* Dialogs */}
    <TransactionDialog type="expense" open={dialogOpen} onOpenChange={handleDialogOpen}
      onSubmit={async (data) => { try { await addExpense(data as Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>); } catch (e) { console.warn('[Expenses] Add failed', e); } }} />
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
        onSubmit={handleEditSubmit}
      />
    )}
    <ConfirmDeleteDialog
      open={!!deletingId}
      onOpenChange={(open) => { if (!open) setDeletingId(null); }}
      onConfirm={() => deletingId && handleDelete(deletingId)}
      title="Delete Expense"
      itemName={deletingId ? expenses.find(e => e.id === deletingId)?.description : undefined}
    />
    </>
  );
}
