'use client';

import { useState, useMemo } from 'react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionDialog } from '@/components/subscriptions/SubscriptionDialog';
import { EmptyState, StatCard } from '@/components/shared';
import { Button } from '@/components/ui';
import { Plus, Repeat, Pause, Play, Trash2, Calendar, CreditCard, Wallet, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/format';
import { toDate } from '@/utils/helpers';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function SubscriptionsPage() {
  const { userData } = useAuth();
  const { subscriptions, loading, totalMonthlyCost, totalYearlyCost, upcomingRenewals, addSubscription, updateSubscription, deleteSubscription, toggleStatus } = useSubscriptions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const handleSubmit = async (data: any) => {
    if (editing) {
      await updateSubscription(editing.id, data);
    } else {
      await addSubscription(data);
    }
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this subscription?')) {
      await deleteSubscription(id);
      toast.success('Subscription deleted');
    }
  };

  const statusColors: Record<string, string> = {
    active: '#00D09C',
    paused: '#FBBF24',
    expired: '#FF5A6E',
  };

  const statusLabels: Record<string, string> = {
    active: 'Active',
    paused: 'Paused',
    expired: 'Expired',
  };

  return (
    <>
    {/* Mobile version */}
    <div className="lg:hidden">
      <div className="px-5 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-bold text-white">Subscriptions</h1>
            <p className="text-[12px] text-[#8899AA]">{subscriptions.length} active</p>
          </div>
          <div className="text-right">
            <p className="text-[14px] font-bold text-[#00D09C]">{formatCurrency(totalMonthlyCost, userData?.currency)}<span className="text-[11px] text-[#5A6B7D]">/mo</span></p>
            <p className="text-[11px] text-[#5A6B7D]">{formatCurrency(totalYearlyCost, userData?.currency)}/yr</p>
          </div>
        </div>
        {loading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-[#12142a] rounded-[16px] animate-pulse" />)}</div>
        ) : subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Repeat className="h-12 w-12 text-white/10 mb-3" />
            <p className="text-[14px] font-medium text-white mb-1">No subscriptions</p>
            <p className="text-[12px] text-[#8899AA] mb-4">Add your Netflix, Spotify, bills and other subscriptions.</p>
            <button onClick={() => { setEditing(null); setDialogOpen(true); }} className="px-4 py-2 text-[13px] font-medium rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#00D09C] text-white">Add Subscription</button>
          </div>
        ) : (
          <div className="space-y-2">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="bg-[#12142a] rounded-[20px] border border-white/[0.06] p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-xl bg-[#7C5CFF]/15 flex items-center justify-center shrink-0"><Repeat className="h-4 w-4 text-[#7C5CFF]" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-white truncate">{sub.name}</p>
                      <p className="text-[11px] text-[#8899AA]">{sub.category}{sub.customCategory ? ` (${sub.customCategory})` : ''}</p>
                    </div>
                  </div>
                  <span className="text-[14px] font-semibold text-white shrink-0 ml-2">{formatCurrency(sub.monthlyCost, userData?.currency)}<span className="text-[10px] text-[#8899AA]">/mo</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: (statusColors[sub.status] || '#8899AA') + '20', color: statusColors[sub.status] || '#8899AA' }}>
                      {statusLabels[sub.status] || sub.status}
                    </span>
                    <span className="text-[10px] text-[#8899AA]">Renews {formatDate(toDate(sub.renewalDate))}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(sub); setDialogOpen(true); }} className="p-1.5 rounded-lg hover:bg-white/5"><Repeat className="h-3 w-3 text-[#7C5CFF]" /></button>
                    <button onClick={() => handleDelete(sub.id)} className="p-1.5 rounded-lg hover:bg-white/5"><Trash2 className="h-3 w-3 text-[#FF5A6E]" /></button>
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
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Subscriptions</h1>
            <p className="text-sm text-[#94A3B8] mt-0.5">Track all your recurring bills and subscriptions</p>
          </div>
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="bg-gradient-to-r from-[#7C5CFF] to-[#00D09C] text-white rounded-xl gap-2">
            <Plus className="h-4 w-4" /> Add Subscription
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard title="Monthly Cost" value={formatCurrency(totalMonthlyCost, userData?.currency)} icon={CreditCard} color="#00D09C" loading={loading} />
          <StatCard title="Yearly Cost" value={formatCurrency(totalYearlyCost, userData?.currency)} icon={Wallet} color="#7C5CFF" loading={loading} />
          <StatCard title="Active" value={subscriptions.filter((s) => s.status === 'active').length.toString()} icon={TrendingUp} color="#FBBF24" loading={loading} />
        </div>

        {/* Upcoming Renewals */}
        {upcomingRenewals.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111827] rounded-2xl border border-white/[0.06] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-[#FBBF24]" />
              <span className="text-sm font-semibold text-white">Upcoming Renewals (30 days)</span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {upcomingRenewals.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-[#7C5CFF]/15">
                      <Repeat className="h-4 w-4 text-[#7C5CFF]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{sub.name}</p>
                      <p className="text-xs text-[#94A3B8]">Renews {formatDate(toDate(sub.renewalDate))} &middot; {sub.category}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold shrink-0 ml-3 text-white">{formatCurrency(sub.monthlyCost, userData?.currency)}<span className="text-[10px] text-[#94A3B8]">/mo</span></span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Subscriptions List */}
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />)}</div>
        ) : subscriptions.length === 0 ? (
          <EmptyState icon={Repeat} title="No subscriptions" description="Add your Netflix, Spotify, bills and other subscriptions." actionLabel="Add Subscription" onAction={() => { setEditing(null); setDialogOpen(true); }} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subscriptions.map((sub) => (
              <motion.div key={sub.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[#111827] rounded-2xl border border-white/[0.06] p-4 hover:border-white/[0.12] transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-[#7C5CFF]/15">
                      <Repeat className="h-5 w-5 text-[#7C5CFF]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{sub.name}</p>
                      <p className="text-xs text-[#94A3B8]">{sub.category}{sub.customCategory ? ` (${sub.customCategory})` : ''}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    {sub.status === 'active' && <button onClick={() => toggleStatus(sub.id, 'paused')} className="p-1.5 rounded-lg hover:bg-white/5" title="Pause"><Pause className="h-3.5 w-3.5 text-[#FBBF24]" /></button>}
                    {sub.status === 'paused' && <button onClick={() => toggleStatus(sub.id, 'active')} className="p-1.5 rounded-lg hover:bg-white/5" title="Resume"><Play className="h-3.5 w-3.5 text-[#00D09C]" /></button>}
                    <button onClick={() => { setEditing(sub); setDialogOpen(true); }} className="p-1.5 rounded-lg hover:bg-white/5" title="Edit"><Repeat className="h-3.5 w-3.5 text-[#7C5CFF]" /></button>
                    <button onClick={() => handleDelete(sub.id)} className="p-1.5 rounded-lg hover:bg-white/5" title="Delete"><Trash2 className="h-3.5 w-3.5 text-[#FF5A6E]" /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: statusColors[sub.status] + '20', color: statusColors[sub.status] }}>
                      {statusLabels[sub.status]}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">Renews {formatDate(toDate(sub.renewalDate))}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{formatCurrency(sub.monthlyCost, userData?.currency)}<span className="text-[10px] text-[#94A3B8]">/mo</span></p>
                    <p className="text-[10px] text-[#94A3B8]">{formatCurrency(sub.yearlyCost, userData?.currency)}/yr</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
    
    <SubscriptionDialog
      open={dialogOpen}
      onOpenChange={(o) => { if (!o) { setDialogOpen(false); setEditing(null); } }}
      onSubmit={handleSubmit}
      defaultValues={editing}
    />
    </>
  );
}