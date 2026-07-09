'use client';

import { useState, useMemo, useCallback } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card, CardContent, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Badge, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { TransactionDialog } from '@/components/transactions/TransactionDialog';
import { AnimatedContainer, AnimatedItem } from '@/components/shared';
import {
  Plus, Search, Filter, Pencil, Trash2, Receipt,
  TrendingDown, CreditCard, ArrowUpDown, ArrowDown,
  Check, X, Download, Clock,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/format';
import { toDate } from '@/utils/helpers';
import { EXPENSE_CATEGORIES } from '@/constants';
import { useIsMobile } from '@/hooks/useMediaQuery';
import type { Expense, SortOption } from '@/types';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const PAGE_SIZE = 10;

export default function ExpensesPage() {
  const { expenses, loading, addExpense, updateExpense, deleteExpense } = useExpenses();
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
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

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
  }, [selected]);

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

  const todayStr = new Date().toISOString().split('T')[0];
  const startOfWeek = new Date(); startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
  const startOfMonthStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const filtered = useMemo(() =>
    expenses
      .filter((e) => {
        if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
        if (search && !e.description.toLowerCase().includes(search.toLowerCase()) && !e.notes?.toLowerCase().includes(search.toLowerCase())) return false;
        const d = toDate(e.expenseDate).toISOString().split('T')[0];
        if (dateFilter === 'today' && d !== todayStr) return false;
        if (dateFilter === 'week' && d < startOfWeekStr) return false;
        if (dateFilter === 'month' && d < startOfMonthStr) return false;
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

  const selectedExpenses = expenses.filter((e) => selected.has(e.id));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const todayExpenses = expenses.filter((e) => toDate(e.expenseDate).toISOString().split('T')[0] === todayStr);
  const monthlyExpenses = expenses.filter((e) => toDate(e.expenseDate).toISOString().split('T')[0] >= startOfMonthStr);
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
      <div className="px-5 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-bold text-white">Expenses</h1>
            <p className="text-[12px] text-[#6b7b8d]">{filtered.length} of {expenses.length} transactions</p>
          </div>
          <div className="text-right">
            <p className="text-[14px] font-bold text-white">{formatCurrency(expenses.reduce((s, e) => s + e.amount, 0), userData?.currency)}</p>
            <p className="text-[11px] text-[#6b7b8d]">Total spent</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Today", value: todayExpenses.reduce((s, e) => s + e.amount, 0) },
            { label: "Month", value: monthlyExpenses.reduce((s, e) => s + e.amount, 0) },
            { label: "Highest", value: highestExpense },
            { label: "Average", value: avgExpense },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-3">
              {loading ? <><div className="h-5 w-16 bg-white/5 rounded animate-pulse" /><div className="h-3 w-12 bg-white/5 rounded animate-pulse mt-1" /></> : <><p className="text-[14px] font-bold text-white">{formatCurrency(stat.value, userData?.currency)}</p><p className="text-[11px] text-[#6b7b8d] mt-0.5">{stat.label}</p></>}
            </div>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7b8d]" />
          <Input placeholder="Search expenses..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-10 text-[14px] bg-[#161a27] border-white/[0.06] text-white placeholder:text-[#6b7b8d]" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4 scrollbar-hide">
          {(['all', 'today', 'week', 'month'] as const).map((f) => (
            <button key={f} onClick={() => { setDateFilter(f); setPage(1); }} className={`shrink-0 px-3 py-1 text-[12px] font-medium rounded-full transition-all ${dateFilter === f ? 'bg-[#7C5CFF]/20 text-[#7C5CFF]' : 'bg-white/5 text-[#6b7b8d] hover:bg-white/10'}`}>{f === 'all' ? 'All Time' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-[68px] bg-[#161a27] rounded-[16px] animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Receipt className="h-12 w-12 text-white/10 mb-3" />
            <p className="text-[14px] font-medium text-white mb-1">No expenses found</p>
            <p className="text-[12px] text-[#6b7b8d] mb-4">{search || categoryFilter !== 'all' || dateFilter !== 'all' ? 'Try adjusting your filters' : 'Start tracking your spending'}</p>
            <button onClick={() => setDialogOpen(true)} className="px-4 py-2 text-[13px] font-medium rounded-xl bg-[#7C5CFF]/20 text-[#7C5CFF]">Add Expense</button>
          </div>
        ) : (
          <div className="space-y-2">
            {paged.map((expense) => (
              <div key={expense.id} className="bg-[#161a27] rounded-[16px] border border-white/[0.06] p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-xl bg-[#ff5a7a]/15 flex items-center justify-center shrink-0"><Receipt className="h-4 w-4 text-[#ff5a7a]" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-white truncate">{expense.description}</p>
                      <div className="flex items-center gap-2 text-[11px] text-[#6b7b8d]"><span>{expense.category}</span><span>&middot;</span><span>{formatDate(expense.expenseDate)}</span></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <span className="text-[14px] font-semibold text-[#ff5a7a]">-{formatCurrency(expense.amount, userData?.currency)}</span>
                    <button onClick={() => { if (confirm('Delete this expense?')) handleDelete(expense.id); }} className="p-1.5 rounded-lg hover:bg-white/5"><Trash2 className="h-3.5 w-3.5 text-[#6b7b8d]" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => setDialogOpen(true)} className="fixed bottom-20 right-4 h-12 w-12 rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#00D09C] flex items-center justify-center shadow-lg shadow-[#7C5CFF]/25 z-40"><Plus className="h-5 w-5 text-white" /></button>
      </div>
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
                      <button onClick={() => setEditingId(expense.id)} className="p-1.5 rounded-lg hover:bg-accent/50" title="Edit">
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => setDeletingId(expense.id)} className="p-1.5 rounded-lg hover:bg-destructive/10" title="Delete">
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
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
                      <div className="flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingId(expense.id)} className="p-1.5 rounded-lg hover:bg-accent/50" title="Edit">
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={() => setDeletingId(expense.id)} className="p-1.5 rounded-lg hover:bg-destructive/10" title="Delete">
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </div>
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
    <TransactionDialog type="expense" open={dialogOpen} onOpenChange={setDialogOpen}
      onSubmit={async (data) => { try { await addExpense(data as any); } catch {} }} />
    {editingExpense && (
      <TransactionDialog
        type="expense" open={true} onOpenChange={() => setEditingId(null)}
        defaultValues={{
          amount: String(editingExpense.amount), description: editingExpense.description,
          notes: editingExpense.notes || '', category: editingExpense.category,
          expenseDate: toDate(editingExpense.expenseDate).toISOString().split('T')[0],
          paymentMethod: editingExpense.paymentMethod, isRecurring: editingExpense.isRecurring,
          recurringInterval: editingExpense.recurringInterval || 'monthly',
        }}
        onSubmit={handleEditSubmit}
      />
    )}
    {deletingId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <Card className="w-80 mx-4">
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">Are you sure you want to delete this expense?</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleDelete(deletingId)}>Delete</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )}
    </>
  );
}
