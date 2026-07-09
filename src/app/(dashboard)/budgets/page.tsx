'use client';

import { useState } from 'react';
import { useBudgets } from '@/hooks/useBudgets';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card, CardContent, Progress, Badge, Skeleton, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Label } from '@/components/ui';
import { Plus, Wallet, Target, AlertTriangle, Clock, CalendarDays } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { EXPENSE_CATEGORIES } from '@/constants';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const statusConfig = {
  on_track: { label: 'On Track', color: '#00D09C', bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  near_limit: { label: 'Near Limit', color: '#FBBF24', bg: 'bg-amber-500/10', text: 'text-amber-500' },
  over_budget: { label: 'Over Budget', color: '#FF5A6E', bg: 'bg-rose-500/10', text: 'text-rose-500' },
};

export default function BudgetsPage() {
  const { budgets, loading, createBudget, deleteBudget } = useBudgets();
  const { userData } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: '', amount: '' });
  const [creating, setCreating] = useState(false);

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const daysLeft = daysInMonth - currentDay;

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 animate-fade-in max-w-[1200px] mx-auto">
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
                {daysLeft} days left
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
            const dailyBudget = budget.amount / daysInMonth;
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
                          <div className="flex items-center gap-2">
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
                      <button
                        onClick={() => deleteBudget(budget.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive md:opacity-0 md:group-hover:opacity-100 transition-all"
                        title="Delete budget"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
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
                          <Clock className="h-3 w-3" /> {daysLeft} days
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

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Budget</DialogTitle>
            <DialogDescription>Set a monthly spending limit for a category</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newBudget.category} onValueChange={(v) => setNewBudget({ ...newBudget, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Monthly Limit</Label>
              <Input type="number" placeholder="Amount" value={newBudget.amount} onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreateBudget} disabled={creating || !newBudget.category || !newBudget.amount}>
              {creating ? 'Creating...' : 'Create Budget'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
