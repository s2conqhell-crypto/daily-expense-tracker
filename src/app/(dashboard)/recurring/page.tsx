'use client';

import { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { useRecurringTransactions } from '@/hooks/useRecurringTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { RecurringRuleDialog } from '@/components/recurring/RecurringRuleDialog';
import { EmptyState, ConfirmDeleteDialog } from '@/components/shared';
import { Button } from '@/components/ui';
import { Plus, Repeat, Pause, Play, Trash2, SkipForward, Calendar, Clock, ArrowUpDown } from 'lucide-react';
import {
  MobilePage, MobilePageHeader, MobileSection, MobileCard,
  MobileEmptyState, MobileLoadingSkeleton, buildDefaultActions, MobileFilterBar,
} from '@/components/mobile';
import type { RecurringTransaction } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { toDate } from '@/utils/helpers';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function RecurringPage() {
  return (
    <Suspense fallback={<div className="p-5 space-y-4"><div className="h-8 w-40 bg-white/5 rounded animate-pulse" /><div className="h-[200px] bg-white/5 rounded animate-pulse" /></div>}>
      <RecurringContent />
    </Suspense>
  );
}

function RecurringContent() {
  const { userData } = useAuth();
  const { rules, upcoming, loading, addRule, updateRule, deleteRule, toggleRule, skipNext } = useRecurringTransactions();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      setEditing(null);
    }
  }, [router, pathname]);

  const filtered = useMemo(() =>
    rules.filter((r) => filter === 'all' || r.type === filter),
  [rules, filter]);

  const handleEdit = (rule: RecurringTransaction) => {
    setEditing(rule);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: Omit<RecurringTransaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (editing) {
      await updateRule(editing.id, data);
    } else {
      await addRule(data);
    }
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    await deleteRule(id);
    setDeletingId(null);
  };

  const intervalLabel = (interval: string) => {
    switch (interval) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return interval;
    }
  };

  return (
    <>
    {/* Mobile version */}
    <div className="lg:hidden">
      <MobilePage>
        <MobilePageHeader
          title="Recurring"
          subtitle={`${rules.length} rule${rules.length !== 1 ? 's' : ''}`}
          right={
            <div className="text-right">
              <p className="m-text-amount text-white">{upcoming.length} upcoming</p>
              <p className="m-text-tiny text-[#6b7b8d]">Next 30 days</p>
            </div>
          }
        />
        <MobileFilterBar
          chips={[
            { key: 'all', label: 'All' },
            { key: 'expense', label: 'Expense' },
            { key: 'income', label: 'Income' },
          ]}
          activeKey={filter}
          onChange={(v) => setFilter(v as 'all' | 'expense' | 'income')}
        />
        {loading ? (
          <MobileLoadingSkeleton count={3} type="card" />
        ) : filtered.length === 0 ? (
          <MobileEmptyState
            icon={<Repeat className="h-12 w-12" />}
            title="No recurring rules"
            description="Set up automatic transactions for bills, income, and more."
          />
        ) : (
          <MobileSection>
            <div className="space-y-3">
              {filtered.map((rule) => (
                <MobileCard
                  key={rule.id}
                  icon={<ArrowUpDown className="h-[18px] w-[18px]" />}
                  iconColor={rule.type === 'expense' ? '#ff5a7a' : '#00d09c'}
                  title={rule.description}
                  subtitle={rule.isActive ? intervalLabel(rule.interval) : 'Paused'}
                  amount={rule.type === 'expense' ? -rule.amount : rule.amount}
                  amountPrefix={rule.type === 'expense' ? '-' : '+'}
                  amountColor={rule.type === 'expense' ? 'danger' : 'success'}
                  currency={userData?.currency}
                  status={rule.isActive ? { label: 'Active', variant: 'active' } : { label: 'Paused', variant: 'paused' }}
                  nextDate={formatDate(toDate(rule.nextExecution))}
                  nextDateLabel="Next"
                  actions={buildDefaultActions({
                    onEdit: () => { setEditing(rule); setDialogOpen(true); },
                    onDelete: () => handleDelete(rule.id),
                    extra: [
                      {
                        key: rule.isActive ? 'pause' : 'resume',
                        label: rule.isActive ? 'Pause' : 'Resume',
                        onClick: () => toggleRule(rule.id, !rule.isActive),
                        color: rule.isActive ? '#ffb020' : '#00d09c',
                      },
                      {
                        key: 'skip',
                        label: 'Skip Next',
                        onClick: () => skipNext(rule),
                        color: '#6b7b8d',
                      },
                    ],
                  })}
                />
              ))}
            </div>
          </MobileSection>
        )}
      </MobilePage>
    </div>
    {/* Desktop version */}
    <div className="hidden lg:block">
    <div className="min-h-dvh bg-[#09090B]">
      <div className="page-container space-y-5 pt-3 sm:pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Recurring</h1>
            <p className="text-sm text-[#94A3B8] mt-0.5">Automatically repeat transactions</p>
          </div>
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="bg-gradient-to-r from-[#7C5CFF] to-[#00D09C] text-white rounded-xl gap-2">
            <Plus className="h-4 w-4" /> New Rule
          </Button>
        </div>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111827] rounded-2xl border border-white/[0.06] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-[#7C5CFF]" />
              <span className="text-sm font-semibold text-white">Upcoming Executions</span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {upcoming.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${rule.type === 'expense' ? 'bg-[#FF5A6E]/15' : 'bg-[#00D09C]/15'}`}>
                      <ArrowUpDown className={`h-4 w-4 ${rule.type === 'expense' ? 'text-[#FF5A6E]' : 'text-[#00D09C]'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{rule.description}</p>
                      <p className="text-xs text-[#94A3B8]">{intervalLabel(rule.interval)} &middot; Next: {formatDate(toDate(rule.nextExecution))}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold shrink-0 ml-3 ${rule.type === 'expense' ? 'text-[#FF5A6E]' : 'text-[#00D09C]'}`}>
                    {rule.type === 'expense' ? '-' : '+'}{formatCurrency(rule.amount, userData?.currency)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filter Chips */}
        <div className="flex gap-1.5">
          {(['all', 'expense', 'income'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 text-[11px] font-medium rounded-full transition-all ${
                filter === f ? 'bg-[#7C5CFF]/20 text-[#7C5CFF]' : 'bg-white/5 text-[#94A3B8] hover:bg-white/10'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Rules List */}
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Repeat} title="No recurring rules" description="Set up automatic transactions for bills, income, and more." actionLabel="Create Rule" onAction={() => { setEditing(null); setDialogOpen(true); }} />
        ) : (
          <div className="space-y-2">
            {filtered.map((rule) => (
              <motion.div key={rule.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[#111827] rounded-2xl border border-white/[0.06] p-4 hover:border-white/[0.12] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${rule.type === 'expense' ? 'bg-[#FF5A6E]/15' : 'bg-[#00D09C]/15'}`}>
                      <ArrowUpDown className={`h-5 w-5 ${rule.type === 'expense' ? 'text-[#FF5A6E]' : 'text-[#00D09C]'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{rule.description}</p>
                      <div className="flex items-center gap-2 text-xs text-[#94A3B8] mt-0.5">
                        <span>{rule.type === 'expense' ? rule.category : rule.source}</span>
                        <span>&middot;</span>
                        <span>{intervalLabel(rule.interval)}</span>
                        <span>&middot;</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(toDate(rule.nextExecution))}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className={`text-sm font-semibold ${rule.type === 'expense' ? 'text-[#FF5A6E]' : 'text-[#00D09C]'}`}>
                      {rule.type === 'expense' ? '-' : '+'}{formatCurrency(rule.amount, userData?.currency)}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => toggleRule(rule.id, !rule.isActive)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" title={rule.isActive ? 'Pause' : 'Resume'}>
                        {rule.isActive ? <Pause className="h-3.5 w-3.5 text-[#FBBF24]" /> : <Play className="h-3.5 w-3.5 text-[#00D09C]" />}
                      </button>
                      <button onClick={() => skipNext(rule)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" title="Skip next">
                        <SkipForward className="h-3.5 w-3.5 text-[#94A3B8]" />
                      </button>
                      <button onClick={() => handleEdit(rule)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" title="Edit">
                        <Repeat className="h-3.5 w-3.5 text-[#7C5CFF]" />
                      </button>
                      <button onClick={() => setDeletingId(rule.id)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" title="Delete">
                        <Trash2 className="h-3.5 w-3.5 text-[#FF5A6E]" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
    
    <RecurringRuleDialog
      open={dialogOpen}
      onOpenChange={handleDialogOpen}
      onSubmit={handleSubmit}
      defaultValues={editing ?? undefined}
    />
    <ConfirmDeleteDialog
      open={!!deletingId}
      onOpenChange={(open) => { if (!open) setDeletingId(null); }}
      onConfirm={() => deletingId && handleDelete(deletingId)}
      title="Delete Recurring Rule"
      itemName={deletingId ? rules.find(r => r.id === deletingId)?.description : undefined}
    />
    </>
  );
}