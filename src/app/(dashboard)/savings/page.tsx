'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card, CardContent, Progress, Skeleton, Badge } from '@/components/ui';
import { UniversalFormDialog } from '@/components/shared';
import { TransactionActionMenu, ConfirmDeleteDialog } from '@/components/shared';
import { CurrencyInput, FormInput, FormDatePicker, FormSelect } from '@/components/ui/forms';
import { Plus, PiggyBank, Target, Trash2, TrendingUp, CheckCircle, Pencil } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/format';
import { toDate, safeDateInput } from '@/utils/helpers';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import {
  MobilePage, MobilePageHeader, MobileSection, MobileCard,
  MobileEmptyState, MobileLoadingSkeleton, buildDefaultActions,
} from '@/components/mobile';

const PRESET_GOALS = [
  { name: 'Emergency Fund', icon: '🛡️', desc: '3-6 months of expenses', color: '#FF5A6E' },
  { name: 'Vacation', icon: '✈️', desc: 'Dream trip fund', color: '#00D09C' },
  { name: 'Car', icon: '🚗', desc: 'New vehicle', color: '#7C5CFF' },
  { name: 'House', icon: '🏠', desc: 'Down payment', color: '#FBBF24' },
  { name: 'Education', icon: '📚', desc: 'Course or degree', color: '#3B82F6' },
  { name: 'Investment', icon: '📈', desc: 'Grow your wealth', color: '#10B981' },
];

export default function SavingsPage() {
  return (
    <Suspense fallback={<div className="p-5 space-y-4"><div className="h-8 w-40 bg-white/5 rounded animate-pulse" /><div className="h-[200px] bg-white/5 rounded animate-pulse" /></div>}>
      <SavingsContent />
    </Suspense>
  );
}

function SavingsContent() {
  const now = useMemo(() => new Date(), []);
  const { goals, loading, createGoal, updateGoal, deleteGoal } = useSavingsGoals();
  const { userData } = useAuth();
  const searchParams = useSearchParams();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({ name: '', description: '', targetAmount: '', targetDate: '', monthlyContribution: '', priority: 'medium' });
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const editingGoal = editingId ? goals.find(g => g.id === editingId) : null;

  useEffect(() => {
    if (searchParams.get('add') === '1') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowCreate(true);
    }
  }, [searchParams]);

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const active = useMemo(() => goals.filter((g) => !g.isCompleted), [goals]);
  const completed = useMemo(() => goals.filter((g) => g.isCompleted), [goals]);

  const handleCreateGoal = async () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.targetDate) return;
    setCreating(true);
    try {
      const monthlyAmount = parseFloat(newGoal.monthlyContribution) || 0;
      await createGoal({
        name: newGoal.name,
        description: newGoal.description || undefined,
        targetAmount: parseFloat(newGoal.targetAmount),
        currentAmount: 0,
        targetDate: new Date(newGoal.targetDate),
        isCompleted: false,
        color: '#7c3aed',
        icon: 'piggy-bank',
        monthlyContribution: monthlyAmount > 0 ? monthlyAmount : undefined,
        priority: newGoal.priority as 'low' | 'medium' | 'high',
      });
      toast.success('Goal created!');
      setShowCreate(false);
      setNewGoal({ name: '', description: '', targetAmount: '', targetDate: '', monthlyContribution: '', priority: 'medium' });
    } catch {
      toast.error('Failed to create goal');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try { await deleteGoal(id); toast.success('Goal deleted'); } catch { toast.error('Failed to delete goal'); }
    setDeletingId(null);
  };

  const selectPreset = (preset: typeof PRESET_GOALS[number]) => {
    setNewGoal((prev) => ({ ...prev, name: preset.name, description: preset.desc }));
  };

  return (
    <>
    {/* Mobile version */}
    <div className="lg:hidden">
      <MobilePage>
        <MobilePageHeader
          title="Savings Goals"
          subtitle={`${goals.length} goal${goals.length !== 1 ? 's' : ''}`}
        />
        {/* Overall Progress */}
        <MobileCard
          icon={<PiggyBank className="h-[18px] w-[18px]" />}
          iconColor="#7c5cff"
          title="Total Savings"
          progress={{ current: totalSaved, max: totalTarget, color: '#7c5cff' }}
          metadata={[
            { label: 'Progress', value: `${overallProgress.toFixed(1)}%`, valueColor: 'text-[#7c5cff]' },
          ]}
        />
        {loading ? (
          <MobileLoadingSkeleton count={3} type="card" />
        ) : goals.length === 0 ? (
          <MobileEmptyState
            icon={<Target className="h-12 w-12" />}
            title="No savings goals"
            description="Set your first savings goal"
          />
        ) : (
          <MobileSection>
            <div className="space-y-3">
              {goals.filter((g) => !g.isCompleted).map((goal) => {
                const daysLeft = Math.max(0, Math.ceil((toDate(goal.targetDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
                return (
                  <MobileCard
                    key={goal.id}
                    icon={<PiggyBank className="h-[18px] w-[18px]" />}
                    iconColor="#7c5cff"
                    title={goal.name}
                    subtitle={`Target: ${formatCurrency(goal.targetAmount, userData?.currency)}`}
                    progress={{ current: goal.currentAmount, max: goal.targetAmount, color: '#7c5cff' }}
                    metadata={[
                      { label: 'Days left', value: daysLeft > 0 ? `${daysLeft}d` : 'Past due', valueColor: daysLeft <= 0 ? 'text-[#FF5A6E]' : 'text-white' },
                      { label: 'Target date', value: formatDate(toDate(goal.targetDate)) },
                    ]}
                    actions={buildDefaultActions({
                      onEdit: () => setEditingId(goal.id),
                      onDelete: () => setDeletingId(goal.id),
                      extra: [
                        { key: 'complete', label: 'Mark Complete', onClick: async () => { try { await updateGoal(goal.id, { isCompleted: true } as const); toast.success('Goal completed!'); } catch (e) { console.warn('[Savings] Mark complete failed', e); } }, color: '#00d09c' },
                      ],
                    })}
                  />
                );
              })}
              {/* Completed */}
              {goals.filter((g) => g.isCompleted).length > 0 && (
                <div className="pt-2">
                  <p className="m-text-h2 text-white mb-3">Completed</p>
                  {goals.filter((g) => g.isCompleted).map((goal) => (
                    <MobileCard
                      key={goal.id}
                      icon={<TrendingUp className="h-[18px] w-[18px]" />}
                      iconColor="#00d09c"
                      title={goal.name}
                      amount={goal.targetAmount}
                      amountColor="success"
                      currency={userData?.currency}
                    />
                  ))}
                </div>
              )}
            </div>
          </MobileSection>
        )}
      </MobilePage>
    </div>
    {/* Desktop version */}
    <div className="hidden lg:block">
    <div className="page-container space-y-5 animate-fade-in pt-3 sm:pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Savings Goals</h1>
          <p className="text-sm text-muted-foreground">Track your financial goals</p>
        </div>
        <Button className="gap-1.5 shrink-0" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> New Goal
        </Button>
      </div>

      {/* Overall Progress */}
      <Card className="bg-gradient-to-br from-violet-500/10 to-purple-600/10 border-violet-500/20">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <PiggyBank className="h-6 w-6 text-violet-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Savings</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {formatCurrency(totalSaved, userData?.currency)} / {formatCurrency(totalTarget, userData?.currency)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-violet-500">{overallProgress.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">overall progress</p>
            </div>
          </div>
          <Progress value={Math.min(overallProgress, 100)} className="h-2.5 mt-4" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{goals.length} goal{goals.length !== 1 ? 's' : ''}</span>
            <span>{completed.length} completed</span>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
        </div>
      ) : goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Target className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No savings goals</h3>
            <p className="text-sm text-muted-foreground mb-4">Set your first savings goal</p>
            <Button variant="outline" className="gap-1.5" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" /> Create Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active Goals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.map((goal, i) => {
              const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              const daysLeft = Math.max(0, Math.ceil((toDate(goal.targetDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
              const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30));
              const remaining = goal.targetAmount - goal.currentAmount;
              const monthlyRec = monthsLeft > 0 ? remaining / monthsLeft : remaining;
              const effectiveMonthly = goal.monthlyContribution || monthlyRec;
              const projectedMonths = effectiveMonthly > 0 ? Math.ceil(remaining / effectiveMonthly) : monthsLeft;
              const projectedDate = new Date(now.getTime() + projectedMonths * 30 * 24 * 60 * 60 * 1000);

              const priorityColors: Record<string, string> = { high: '#FF5A6E', medium: '#FBBF24', low: '#00D09C' };

              return (
                <motion.div key={goal.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                            <PiggyBank className="h-5 w-5 text-violet-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{goal.name}</h3>
                              {goal.priority && (
                                <Badge className="text-[9px] px-1.5 py-0.5 border-0 rounded" style={{ backgroundColor: priorityColors[goal.priority] + '20', color: priorityColors[goal.priority] }}>
                                  {goal.priority === 'high' ? 'High Priority' : goal.priority === 'medium' ? 'Medium' : 'Low'}
                                </Badge>
                              )}
                            </div>
                            {goal.description && <p className="text-xs text-muted-foreground">{goal.description}</p>}
                          </div>
                        </div>
                        <TransactionActionMenu
                          actions={[
                            { icon: Pencil, label: 'Edit', onClick: () => setEditingId(goal.id), color: '#7c5cff' },
                            ...(goal.isCompleted ? [] : [{ icon: CheckCircle, label: 'Mark Complete', onClick: async () => { try { await updateGoal(goal.id, { isCompleted: true } as const); toast.success('Goal completed!'); } catch { toast.error('Failed'); } }, color: '#00d09c' }]),
                            { icon: Trash2, label: 'Delete', onClick: () => setDeletingId(goal.id), color: '#ff5a7a', destructive: true },
                          ]}
                        />
                      </div>

                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Saved</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(goal.currentAmount, userData?.currency)} / {formatCurrency(goal.targetAmount, userData?.currency)}
                        </span>
                      </div>

                      <Progress value={Math.min(progress, 100)} className="h-2.5" />
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>{progress.toFixed(0)}% complete</span>
                        <span className={daysLeft <= 0 ? 'text-rose-500 font-medium' : ''}>
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Past due'}
                        </span>
                      </div>

                      <div className="mt-3 pt-3 border-t border-border/40 grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Monthly</p>
                          <p className="text-xs font-medium text-emerald-500">
                            {goal.monthlyContribution
                              ? formatCurrency(goal.monthlyContribution, userData?.currency)
                              : formatCurrency(monthlyRec, userData?.currency)}{'/mo'}
                            {goal.monthlyContribution && <span className="text-[9px] text-muted-foreground"> (set)</span>}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Projected</p>
                          <p className="text-xs font-medium">{formatDate(projectedDate)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Remaining</p>
                          <p className="text-xs font-medium">{formatCurrency(remaining, userData?.currency)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Completed Goals */}
          {completed.length > 0 && (
            <>
              <h2 className="text-lg font-semibold pt-2">Completed Goals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completed.map((goal, i) => (
                  <motion.div key={goal.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="overflow-hidden border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                              <TrendingUp className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{goal.name}</h3>
                              <p className="text-xs text-emerald-500 font-medium">Achieved!</p>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-emerald-500">
                            {formatCurrency(goal.targetAmount, userData?.currency)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
    </div>
    
    {/* Create Goal Sheet */}
    <UniversalFormDialog
      open={showCreate}
      onOpenChange={setShowCreate}
      title="New Savings Goal"
      description="Set a new financial goal to save towards"
      submitLabel={creating ? 'Creating...' : 'Create Goal'}
      loading={creating}
      onSubmit={async (e) => { e.preventDefault(); handleCreateGoal(); }}
      onCancel={() => setShowCreate(false)}
    >
      {/* Presets */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Quick Select</span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_GOALS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => selectPreset(preset)}
              className={`flex flex-col items-center gap-1 rounded-[14px] p-3 text-xs transition-all border ${
                newGoal.name === preset.name
                  ? 'border-[#7c5cff]/60 bg-[#7c5cff]/10 text-[#7c5cff]'
                  : 'border-white/[0.06] hover:border-white/[0.12] bg-[#1E2235]/30'
              }`}
            >
              <span className="text-lg">{preset.icon}</span>
              <span className="font-medium leading-tight text-center text-white/80">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <FormInput
        id="goal-name"
        label="Goal Name"
        placeholder="e.g. Emergency Fund"
        value={newGoal.name}
        onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
        required
        data-autofocus
      />

      <FormInput
        id="goal-desc"
        label="Description"
        placeholder="Why are you saving?"
        value={newGoal.description}
        onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
        charCount={{ current: newGoal.description.length, max: 200 }}
        hideCharUntilTyping
      />

      <CurrencyInput
        id="goal-amount"
        label="Target Amount"
        value={newGoal.targetAmount}
        onChange={(v) => setNewGoal({ ...newGoal, targetAmount: v })}
        required
      />

      <FormDatePicker
        id="goal-date"
        label="Target Date"
        value={newGoal.targetDate}
        onChange={(v) => setNewGoal({ ...newGoal, targetDate: v })}
        required
      />

      <CurrencyInput
        id="goal-monthly"
        label="Monthly Contribution"
        value={newGoal.monthlyContribution}
        onChange={(v) => setNewGoal({ ...newGoal, monthlyContribution: v })}
        placeholder="Amount per month"
      />

      <FormSelect
        id="goal-priority"
        label="Priority"
        value={newGoal.priority}
        onValueChange={(v) => setNewGoal({ ...newGoal, priority: v })}
        options={[
          { value: 'high', label: 'High' },
          { value: 'medium', label: 'Medium' },
          { value: 'low', label: 'Low' },
        ]}
      />
    </UniversalFormDialog>

    {/* Edit Goal */}
    {editingGoal && (
      <UniversalFormDialog
        open={true}
        onOpenChange={() => setEditingId(null)}
        title="Edit Goal"
        submitLabel="Save"
        onSubmit={async (e) => {
          e.preventDefault();
          if (editingGoal && newGoal.targetAmount) {
            await updateGoal(editingGoal.id, {
              name: newGoal.name || editingGoal.name,
              targetAmount: parseFloat(newGoal.targetAmount),
              targetDate: newGoal.targetDate ? new Date(newGoal.targetDate) : editingGoal.targetDate,
              monthlyContribution: parseFloat(newGoal.monthlyContribution) || undefined,
              priority: newGoal.priority as 'low' | 'medium' | 'high',
            } as Record<string, unknown>);
            setEditingId(null);
            setNewGoal({ name: '', description: '', targetAmount: '', targetDate: '', monthlyContribution: '', priority: 'medium' });
          }
        }}
        onCancel={() => setEditingId(null)}
      >
        <FormInput
          id="edit-name"
          label="Goal Name"
          placeholder="Name"
          defaultValue={editingGoal.name}
          onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
          data-autofocus
        />
        <CurrencyInput
          id="edit-amount"
          label="Target Amount"
          value={newGoal.targetAmount || editingGoal.targetAmount.toString()}
          onChange={(v) => setNewGoal({ ...newGoal, targetAmount: v })}
          required
        />
        <FormDatePicker
          id="edit-date"
          label="Target Date"
          value={newGoal.targetDate || safeDateInput(editingGoal.targetDate)}
          onChange={(v) => setNewGoal({ ...newGoal, targetDate: v })}
        />
        <CurrencyInput
          id="edit-monthly"
          label="Monthly Contribution"
          value={newGoal.monthlyContribution}
          onChange={(v) => setNewGoal({ ...newGoal, monthlyContribution: v })}
          placeholder="Amount per month"
        />
        <FormSelect
          id="edit-priority"
          label="Priority"
          value={newGoal.priority || editingGoal.priority || 'medium'}
          onValueChange={(v) => setNewGoal({ ...newGoal, priority: v })}
          options={[
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
          ]}
        />
      </UniversalFormDialog>
    )}

    <ConfirmDeleteDialog
      open={!!deletingId}
      onOpenChange={(open) => { if (!open) setDeletingId(null); }}
      onConfirm={() => deletingId && handleDeleteGoal(deletingId)}
      title="Delete Savings Goal"
      itemName={deletingId ? goals.find(g => g.id === deletingId)?.name : undefined}
    />
    </>
  );
}
