'use client';

import { useState, useMemo } from 'react';
import { useRecurringTransactions } from '@/hooks/useRecurringTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { RecurringRuleDialog } from '@/components/recurring/RecurringRuleDialog';
import { EmptyState } from '@/components/shared';
import { Button } from '@/components/ui';
import { Plus, Repeat, Pause, Play, Trash2, SkipForward, Calendar, Clock, ArrowUpDown } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/format';
import { toDate } from '@/utils/helpers';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function RecurringPage() {
  const { userData } = useAuth();
  const { rules, upcoming, loading, addRule, updateRule, deleteRule, toggleRule, skipNext } = useRecurringTransactions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');

  const filtered = useMemo(() =>
    rules.filter((r) => filter === 'all' || r.type === filter),
  [rules, filter]);

  const handleEdit = (rule: any) => {
    setEditing(rule);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (editing) {
      await updateRule(editing.id, data);
    } else {
      await addRule(data);
    }
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this recurring rule?')) {
      await deleteRule(id);
      toast.success('Rule deleted');
    }
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
      <div className="px-4 py-3 space-y-4 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-bold text-white">Recurring</h1>
            <p className="text-[12px] text-[#8899AA]">{rules.length} rule{rules.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="text-right">
            <p className="text-[14px] font-bold text-white">{upcoming.length} upcoming</p>
            <p className="text-[11px] text-[#5A6B7D]">Next 30 days</p>
          </div>
        </div>
        {/* Filter Chips */}
        <div className="flex gap-1.5">
          {(['all', 'expense', 'income'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-[12px] font-medium rounded-full transition-all ${filter === f ? 'bg-[#7C5CFF]/20 text-[#7C5CFF]' : 'bg-white/5 text-[#8899AA] hover:bg-white/10'}`}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-[#141822] rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Repeat className="h-12 w-12 text-white/10 mb-3" />
            <p className="text-[14px] font-medium text-white mb-1">No recurring rules</p>
            <p className="text-[12px] text-[#8899AA] mb-4">Set up automatic transactions for bills, income, and more.</p>
            <button onClick={() => { setEditing(null); setDialogOpen(true); }} className="px-4 py-2 text-[13px] font-medium rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#00D09C] text-white">Create Rule</button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((rule) => (
              <div key={rule.id} className="bg-[#141822] rounded-xl border border-white/[0.08] p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${rule.type === 'expense' ? 'bg-[#FF5A6E]/15' : 'bg-[#00D09C]/15'}`}>
                      <ArrowUpDown className={`h-4 w-4 ${rule.type === 'expense' ? 'text-[#FF5A6E]' : 'text-[#00D09C]'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-white truncate">{rule.description}</p>
                      <div className="flex items-center gap-2 text-[11px] text-[#8899AA]">
                        <span>{intervalLabel(rule.interval)}</span>
                        <span>&middot;</span>
                        <span>Next: {formatDate(toDate(rule.nextExecution))}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <span className={`text-[14px] font-semibold ${rule.type === 'expense' ? 'text-[#FF5A6E]' : 'text-[#00D09C]'}`}>
                      {rule.type === 'expense' ? '-' : '+'}{formatCurrency(rule.amount, userData?.currency)}
                    </span>
                    <button onClick={() => { setEditing(rule); setDialogOpen(true); }} className="p-1.5 rounded-lg hover:bg-white/5"><Repeat className="h-3 w-3 text-[#7C5CFF]" /></button>
                    <button onClick={() => handleDelete(rule.id)} className="p-1.5 rounded-lg hover:bg-white/5"><Trash2 className="h-3 w-3 text-[#FF5A6E]" /></button>
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
                      <button onClick={() => handleDelete(rule.id)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" title="Delete">
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

      <RecurringRuleDialog
        open={dialogOpen}
        onOpenChange={(o) => { if (!o) { setDialogOpen(false); setEditing(null); } }}
        onSubmit={handleSubmit}
        defaultValues={editing}
      />
    </div>
    </div>
    </>
  );
}