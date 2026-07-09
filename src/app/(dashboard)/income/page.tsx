'use client';

import { useState, useMemo, useCallback } from 'react';
import { useIncome } from '@/hooks/useIncome';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card, CardContent, Badge, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { TransactionDialog } from '@/components/transactions/TransactionDialog';
import { AnimatedContainer, AnimatedItem } from '@/components/shared';
import {
  Plus, TrendingUp, TrendingDown, Pencil, Trash2,
  Wallet, Calendar, ArrowUpDown, ArrowDown,
  Check, X, Download,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/format';
import { toDate } from '@/utils/helpers';
import { useIsMobile } from '@/hooks/useMediaQuery';
import type { Income, SortOption } from '@/types';
import toast from 'react-hot-toast';

export default function IncomePage() {
  const { incomes, loading, addIncome, updateIncome, deleteIncome } = useIncome();
  const { userData } = useAuth();
  const isMobile = useIsMobile();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('date-desc');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const editingIncome = editingId ? incomes.find((i) => i.id === editingId) : null;
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const highestIncome = incomes.length > 0 ? Math.max(...incomes.map((i) => i.amount)) : 0;
  const avgIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
  const recurringIncome = incomes.filter((i) => i.isRecurring).reduce((s, i) => s + i.amount, 0);

  const handleDelete = useCallback(async (id: string) => {
    try { await deleteIncome(id); toast.success('Income deleted'); } catch { toast.error('Failed to delete'); }
    setDeletingId(null);
  }, [deleteIncome]);

  const handleEditSubmit = useCallback(async (data: Record<string, unknown>) => {
    if (!editingId) return;
    try { await updateIncome(editingId, data as Partial<Income>); toast.success('Income updated'); setEditingId(null); }
    catch { toast.error('Failed to update'); }
  }, [editingId, updateIncome]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === incomes.length) setSelected(new Set());
    else setSelected(new Set(incomes.map((i) => i.id)));
  };

  const handleBulkDelete = useCallback(async () => {
    const count = selected.size;
    try {
      await Promise.all(Array.from(selected).map((id) => deleteIncome(id)));
      toast.success(`${count} income entries deleted`);
      setSelected(new Set());
    } catch { toast.error('Bulk delete failed'); }
  }, [selected, deleteIncome]);

  const handleBulkExport = useCallback(() => {
    const data = incomes.filter((i) => selected.has(i.id)).map((i) => ({
      description: i.description, amount: i.amount, source: i.source,
      date: formatDate(i.incomeDate), method: i.paymentMethod,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'income-export.json'; a.click();
    toast.success('Exported successfully');
  }, [incomes, selected]);

  const sourceBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    incomes.forEach((i) => { map[i.source] = (map[i.source] || 0) + i.amount; });
    return Object.entries(map).sort(([, a], [, b]) => b - a);
  }, [incomes]);

  const sorted = useMemo(() =>
    [...incomes].sort((a, b) => {
      switch (sort) {
        case 'amount-desc': return b.amount - a.amount;
        case 'amount-asc': return a.amount - b.amount;
        case 'date-asc': return toDate(a.incomeDate).getTime() - toDate(b.incomeDate).getTime();
        default: return toDate(b.incomeDate).getTime() - toDate(a.incomeDate).getTime();
      }
    }),
    [incomes, sort]
  );

  const sortIcon = (col: SortOption) => {
    if (sort === col) return <ArrowDown className="h-3 w-3 inline ml-0.5 text-primary" />;
    return <ArrowUpDown className="h-3 w-3 inline ml-0.5 text-muted-foreground/50" />;
  };

  return (
    <div className="page-container space-y-5 animate-fade-in pt-3 sm:pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Income</h1>
          <p className="text-sm text-muted-foreground">{incomes.length} entries &middot; Total: {formatCurrency(totalIncome, userData?.currency)}</p>
        </div>
        <Button className="gap-1.5 shrink-0" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Add Income
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Income', value: totalIncome, icon: TrendingUp, color: '#00D09C' },
          { label: 'Monthly Average', value: avgIncome, icon: Wallet, color: '#7C5CFF' },
          { label: 'Highest Income', value: highestIncome, icon: TrendingDown, color: '#FBBF24' },
          { label: 'Recurring Income', value: recurringIncome, icon: Calendar, color: '#FF5A6E' },
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

      {/* Source Breakdown */}
      {sourceBreakdown.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-3">Income Sources</h3>
            <div className="space-y-2">
              {sourceBreakdown.map(([source, amount]) => {
                const pct = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
                return (
                  <div key={source} className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-24 shrink-0">{source}</Badge>
                    <div className="flex-1 h-2 rounded-full bg-accent overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">{pct.toFixed(0)}%</span>
                    <span className="text-sm font-medium w-24 text-right">{formatCurrency(amount, userData?.currency)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <span className="text-sm font-medium text-emerald-500">{selected.size} selected</span>
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
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
      ) : incomes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <TrendingUp className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No income recorded</h3>
            <p className="text-sm text-muted-foreground mb-4">Start tracking your earnings</p>
            <Button variant="outline" className="gap-1.5" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" /> Add Your First Income
            </Button>
          </CardContent>
        </Card>
      ) : isMobile ? (
        <AnimatedContainer className="space-y-2">
          {sorted.map((income) => (
            <AnimatedItem key={income.id}>
              <Card className={selected.has(income.id) ? 'ring-2 ring-emerald-500' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleSelect(income.id)} className="h-5 w-5 rounded border border-border flex items-center justify-center">
                        {selected.has(income.id) && <Check className="h-3 w-3 text-emerald-500" />}
                      </button>
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{income.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{income.source}</Badge>
                          <span>{formatDate(income.incomeDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-emerald-500 mr-1">
                        +{formatCurrency(income.amount, userData?.currency)}
                      </span>
                      <button onClick={() => setEditingId(income.id)} className="p-1.5 rounded-lg hover:bg-accent/50" title="Edit">
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => setDeletingId(income.id)} className="p-1.5 rounded-lg hover:bg-destructive/10" title="Delete">
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
                      {selected.size === incomes.length && incomes.length > 0 ? <Check className="h-3 w-3 text-emerald-500" /> : selected.size > 0 && <div className="h-2 w-2 rounded bg-emerald-500/50" />}
                    </button>
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => setSort(sort === 'date-desc' ? 'date-asc' : 'date-desc')}>
                    Date {sortIcon('date-desc')}
                  </TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => setSort(sort === 'amount-desc' ? 'amount-asc' : 'amount-desc')}>
                    Amount {sortIcon('amount-desc')}
                  </TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((income) => (
                  <TableRow key={income.id} className={`group ${selected.has(income.id) ? 'bg-emerald-500/5' : ''}`}>
                    <TableCell>
                      <button onClick={() => toggleSelect(income.id)} className="h-4 w-4 rounded border border-border flex items-center justify-center">
                        {selected.has(income.id) && <Check className="h-3 w-3 text-emerald-500" />}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </div>
                        <p className="font-medium">{income.description}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{income.source}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(income.incomeDate)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{income.paymentMethod}</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-500">
                      +{formatCurrency(income.amount, userData?.currency)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingId(income.id)} className="p-1.5 rounded-lg hover:bg-accent/50" title="Edit">
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={() => setDeletingId(income.id)} className="p-1.5 rounded-lg hover:bg-destructive/10" title="Delete">
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

      <TransactionDialog type="income" open={dialogOpen} onOpenChange={setDialogOpen}
        onSubmit={async (data) => { try { await addIncome(data as any); } catch {} }} />
      {editingIncome && (
        <TransactionDialog type="income" open={true} onOpenChange={() => setEditingId(null)}
          defaultValues={{
            amount: String(editingIncome.amount), description: editingIncome.description,
            notes: editingIncome.notes || '', source: editingIncome.source,
            incomeDate: toDate(editingIncome.incomeDate).toISOString().split('T')[0],
            paymentMethod: editingIncome.paymentMethod, isRecurring: editingIncome.isRecurring,
            recurringInterval: editingIncome.recurringInterval || 'monthly',
          }}
          onSubmit={handleEditSubmit}
        />
      )}

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-80 mx-4">
            <CardContent className="p-6 text-center space-y-4">
              <p className="text-sm text-muted-foreground">Are you sure you want to delete this income entry?</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => handleDelete(deletingId)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
