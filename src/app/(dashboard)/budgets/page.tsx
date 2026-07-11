'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useBudgets } from '@/hooks/useBudgets';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card, CardContent, Progress, Badge, Skeleton, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui';
import { UniversalFormDialog, FormField } from '@/components/shared';
import { TransactionActionMenu, ConfirmDeleteDialog } from '@/components/shared';
import { CurrencyInput, FormInput, FormSelect } from '@/components/ui/forms';
import { cn } from '@/utils/helpers';
import { Plus, Wallet, Target, AlertTriangle, Clock, CalendarDays, Trash2, Pencil } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { EXPENSE_CATEGORIES } from '@/constants';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import type { Budget } from '@/types';
import { useSearchParams } from 'next/navigation';

const statusConfig = {
  on_track: { label: 'On Track', color: '#00D09C', bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  near_limit: { label: 'Near Limit', color: '#FBBF24', bg: 'bg-amber-500/10', text: 'text-amber-500' },
  over_budget: { label: 'Over Budget', color: '#FF5A6E', bg: 'bg-rose-500/10', text: 'text-rose-500' },
};

export default function BudgetsPage() {
  return (
    <Suspense fallback={<div className="p-5 space-y-4"><div className="h-8 w-40 bg-white/5 rounded animate-pulse" /><div className="h-[200px] bg-white/5 rounded animate-pulse" /></div>}>
      <BudgetsContent />
    </Suspense>
  );
}

function BudgetsContent() {
  const { budgets, loading, createBudget, updateBudget, deleteBudget } = useBudgets();
  const { userData } = useAuth();
  const searchParams = useSearchParams();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newBudget, setNewBudget] = useState({ category: '', amount: '' });
  const [creating, setCreating] = useState(false);
  const editingBudget = editingId ? budgets.find(b => b.id === editingId) : null;

  useEffect(() => {
    if (searchParams.get('add') === '1') {
      setShowCreate(true);
    }
  }, [searchParams]);

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const dateInfo = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return { daysInMonth, currentDay: now.getDate(), daysLeft: daysInMonth - now.getDate() };
  }, []);

  const getStatus = (util: number) => {
    if (util > 100) return statusConfig.over_budget;
    if (util > 80) return statusConfig.near_limit;
    return statusConfig.on_track;
  };

  const handleCreateBudget = async () => {
    if (!newBudget.category || !newBudget.amount) return;
    setCreating(true);
    try {
      const now = new Date();
      await createBudget({
        category: newBudget.category,
        amount: parseFloat(newBudget.amount),
        spent: 0,
        month: now.getMonth(),
        year: now.getFullYear(),
      });
      toast.success('Budget created!');
      setShowCreate(false);
      setNewBudget({ category: '', amount: '' });
    } catch {
      toast.error('Failed to create budget');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
    {/* Mobile version */}
    <div className="lg:hidden">
      <div className="px-5 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[18px] font-bold text-white">Budgets</h1>
          <span className="text-[12px] text-[#6b7b8d]">{totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(0)}% used` : 'No budget set'}</span>
        </div>
        {loading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-[#161a27] rounded-[20px] animate-pulse" />)}</div>
        ) : budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="h-12 w-12 text-white/10 mb-3" />
            <p className="text-[14px] font-medium text-white mb-1">No budgets set</p>
            <p className="text-[12px] text-[#6b7b8d] mb-4">Create your first budget to start tracking</p>
          </div>
        ) : (
          <div className="space-y-2">
            {budgets.map((budget) => {
              const util = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
              const remaining = budget.amount - budget.spent;
              return (
                <div key={budget.id} className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#7C5CFF]/15 flex items-center justify-center"><Wallet className="h-4 w-4 text-[#7C5CFF]" /></div>
                      <span className="text-[14px] font-medium text-white">{budget.category}</span>
                    </div>
                    <TransactionActionMenu
                      actions={[
                        { icon: Pencil, label: 'Edit', onClick: () => { setEditingId(budget.id); }, color: '#7c5cff' },
                        { icon: Trash2, label: 'Delete', onClick: () => setDeletingId(budget.id), color: '#ff5a7a', destructive: true },
                      ]}
                    />
                  </div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[12px] text-[#6b7b8d]">Spent</span>
                    <span className="text-[12px] font-medium text-white">{formatCurrency(budget.spent, userData?.currency)} / {formatCurrency(budget.amount, userData?.currency)}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(util, 100)}%`, backgroundColor: util > 100 ? '#FF5A6E' : util > 80 ? '#FBBF24' : '#00D09C' }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[11px] text-[#6b7b8d]">{util.toFixed(0)}%</span>
                    <span className="text-[11px]" style={{ color: remaining >= 0 ? '#00D09C' : '#FF5A6E' }}>
                      {remaining >= 0 ? `${formatCurrency(remaining, userData?.currency)} left` : `${formatCurrency(Math.abs(remaining), userData?.currency)} over`}
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/[0.06] flex justify-between text-[11px]">
                    <span className="text-[#6b7b8d]">{dateInfo.daysLeft} days left</span>
                    <span className={util > 100 ? 'text-[#FF5A6E]' : util > 80 ? 'text-[#FBBF24]' : 'text-[#00D09C]'}>
                      {util > 100 ? 'Over budget' : util > 80 ? 'Near limit' : 'On track'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    {/* Desktop version */}
    <div className="hidden lg:block">
    <div className="page-container space-y-5 animate-fade-in pt-3 sm:pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-sm text-muted-foreground">Track your spending limits</p>
        </div>
        <Button className="gap-1.5 shrink-0" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Create Budget
        </Button>
      </div>

      {/* Overall Summary */}
      <Card className="bg-gradient-to-br from-primary/5 to-purple-600/5 border-primary/10">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Budget</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {formatCurrency(totalSpent, userData?.currency)} / {formatCurrency(totalBudget, userData?.currency)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                {dateInfo.daysLeft} days left
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatus(overallUtilization).bg} ${getStatus(overallUtilization).text}`}>
                {getStatus(overallUtilization).label}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{overallUtilization.toFixed(1)}% utilized</span>
              <span>{formatCurrency(totalBudget - totalSpent, userData?.currency)} remaining</span>
            </div>
            <Progress
              value={Math.min(overallUtilization, 100)}
              className="h-2.5"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      ) : budgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Target className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No budgets set</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first budget to start tracking</p>
            <Button variant="outline" className="gap-1.5" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" /> Create Budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget, i) => {
            const utilization = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
            const remaining = budget.amount - budget.spent;
            const dailyBudget = budget.amount / dateInfo.daysInMonth;
            const status = getStatus(utilization);

            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl ${status.bg} flex items-center justify-center`}>
                          <Wallet className={`h-5 w-5 ${status.text}`} />
                        </div>
                        <div>
<div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-sm px-3 py-1">{budget.category}</Badge>
                            {utilization > 100 && <AlertTriangle className="h-4 w-4 text-rose-500" />}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0 rounded-full ${status.bg} ${status.text} font-medium`}>
                              {status.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <TransactionActionMenu
                        actions={[
                          { icon: Pencil, label: 'Edit', onClick: () => { setEditingId(budget.id); }, color: '#7c5cff' },
                          { icon: Trash2, label: 'Delete', onClick: () => setDeletingId(budget.id), color: '#ff5a7a', destructive: true },
                        ]}
                      />
                    </div>

                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Spent</span>
                      <span className="text-sm font-medium">{formatCurrency(budget.spent, userData?.currency)}</span>
                    </div>

                    <Progress
                      value={Math.min(utilization, 100)}
                      className={`h-2.5 ${utilization > 100 ? '[&>div]:bg-rose-500' : utilization > 80 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`}
                    />

                    <div className="flex justify-between mt-2 text-xs">
                      <span className="text-muted-foreground">{utilization.toFixed(0)}% of {formatCurrency(budget.amount, userData?.currency)}</span>
                      <span className={remaining >= 0 ? 'text-emerald-500 font-medium' : 'text-rose-500 font-medium'}>
                        {remaining >= 0
                          ? `${formatCurrency(remaining, userData?.currency)} left`
                          : `${formatCurrency(Math.abs(remaining), userData?.currency)} over`}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border/40 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Daily Budget</p>
                        <p className="text-xs font-medium">{formatCurrency(dailyBudget, userData?.currency)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Days Left</p>
                        <p className="text-xs font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {dateInfo.daysLeft} days
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
    </div>
    
    <UniversalFormDialog
      open={showCreate}
      onOpenChange={setShowCreate}
      title="Create Budget"
      description="Set a monthly spending limit for a category"
      submitLabel={creating ? 'Creating...' : 'Create Budget'}
      loading={creating}
      onSubmit={async (e) => { e.preventDefault(); handleCreateBudget(); }}
      onCancel={() => setShowCreate(false)}
    >
      <FormSelect
        id="budget-category"
        label="Category"
        value={newBudget.category}
        onValueChange={(v) => setNewBudget({ ...newBudget, category: v })}
        options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
        placeholder="Select category"
        required
      />
      <CurrencyInput
        id="budget-amount"
        label="Monthly Limit"
        value={newBudget.amount}
        onChange={(v) => setNewBudget({ ...newBudget, amount: v })}
        required
        autoFocus
      />
    </UniversalFormDialog>

    {editingBudget && (
      <UniversalFormDialog
        open={true}
        onOpenChange={() => setEditingId(null)}
        title="Edit Budget"
        submitLabel="Save"
        onSubmit={async (e) => {
          e.preventDefault();
          if (editingBudget && newBudget.amount) {
            await updateBudget(editingBudget.id, { amount: parseFloat(newBudget.amount) } as Partial<Budget>);
            setEditingId(null);
            setNewBudget({ category: '', amount: '' });
          }
        }}
        onCancel={() => setEditingId(null)}
      >
        <FormInput
          id="edit-category"
          label="Category"
          value={editingBudget.category}
          disabled
        />
        <CurrencyInput
          id="edit-amount"
          label="Monthly Limit"
          value={newBudget.amount}
          onChange={(v) => setNewBudget({ ...newBudget, amount: v })}
          required
          autoFocus
        />
      </UniversalFormDialog>
    )}

    <ConfirmDeleteDialog
      open={!!deletingId}
      onOpenChange={(open) => { if (!open) setDeletingId(null); }}
      onConfirm={() => { if (deletingId) { deleteBudget(deletingId); setDeletingId(null); } }}
      title="Delete Budget"
      itemName={deletingId ? budgets.find(b => b.id === deletingId)?.category : undefined}
    />
    </>
  );
}
