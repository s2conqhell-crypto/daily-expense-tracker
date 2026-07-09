'use client';

import { useState } from 'react';
import { useLoans } from '@/hooks/useLoans';
import { useAuth } from '@/contexts/AuthContext';
import { LoanDialog } from '@/components/loans/LoanDialog';
import { EmptyState, StatCard } from '@/components/shared';
import { Button, Progress } from '@/components/ui';
import { Plus, Banknote, Trash2, CreditCard, Calendar, TrendingUp, Wallet, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/format';
import { toDate } from '@/utils/helpers';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function LoansPage() {
  const { userData } = useAuth();
  const { loans, loading, activeLoans, totalOutstanding, upcomingEmis, totalEmiPerMonth, addLoan, updateLoan, deleteLoan, recordPayment } = useLoans();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [payingLoan, setPayingLoan] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    if (editing) {
      await updateLoan(editing.id, data);
    } else {
      await addLoan(data);
    }
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this loan record?')) {
      await deleteLoan(id);
      toast.success('Loan deleted');
    }
  };

  const handlePayEMI = async (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;
    setPayingLoan(loanId);
    try {
      await recordPayment(loanId, {
        date: new Date(),
        amount: loan.emiAmount,
        type: 'emi',
      });
      toast.success('EMI payment recorded');
    } catch {
      toast.error('Failed to record payment');
    } finally {
      setPayingLoan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-28 space-y-5 pt-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Loans & EMI</h1>
            <p className="text-sm text-[#94A3B8] mt-0.5">Track your loans, EMIs, and outstanding balances</p>
          </div>
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="bg-gradient-to-r from-[#7C5CFF] to-[#00D09C] text-white rounded-xl gap-2">
            <Plus className="h-4 w-4" /> Add Loan
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard title="Active Loans" value={activeLoans.length.toString()} icon={Banknote} color="#7C5CFF" loading={loading} />
          <StatCard title="Outstanding" value={formatCurrency(totalOutstanding, userData?.currency)} icon={CreditCard} color="#FF5A6E" loading={loading} />
          <StatCard title="Monthly EMI" value={formatCurrency(totalEmiPerMonth, userData?.currency)} icon={TrendingUp} color="#FBBF24" loading={loading} />
          <StatCard title="Total Loans" value={loans.length.toString()} icon={Wallet} color="#00D09C" loading={loading} />
        </div>

        {/* Upcoming EMIs */}
        {upcomingEmis.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111827] rounded-2xl border border-white/[0.06] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-[#FBBF24]" />
              <span className="text-sm font-semibold text-white">Upcoming EMI Payments</span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {upcomingEmis.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-[#FF5A6E]/15">
                      <CreditCard className="h-4 w-4 text-[#FF5A6E]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{loan.name}</p>
                      <p className="text-xs text-[#94A3B8]">Due {formatDate(toDate(loan.nextEmiDate!))} &middot; EMI {loan.paidEmi}/{loan.totalEmi}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-sm font-semibold text-white">{formatCurrency(loan.emiAmount, userData?.currency)}</span>
                    <button onClick={() => handlePayEMI(loan.id)} disabled={payingLoan === loan.id}
                      className="px-3 py-1 text-xs font-medium rounded-xl bg-[#00D09C]/15 text-[#00D09C] hover:bg-[#00D09C]/25 transition-all disabled:opacity-50"
                    >
                      {payingLoan === loan.id ? '...' : 'Pay Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loans List */}
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />)}</div>
        ) : loans.length === 0 ? (
          <EmptyState icon={Banknote} title="No loans" description="Add your home loan, car loan, personal loan EMIs here." actionLabel="Add Loan" onAction={() => { setEditing(null); setDialogOpen(true); }} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {loans.map((loan) => {
              const progress = loan.totalEmi > 0 ? (loan.paidEmi / loan.totalEmi) * 100 : 0;
              return (
                <motion.div key={loan.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-[#111827] rounded-2xl border border-white/[0.06] p-4 hover:border-white/[0.12] transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-[#7C5CFF]/15">
                        <Banknote className="h-5 w-5 text-[#7C5CFF]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{loan.name}</p>
                        <p className="text-xs text-[#94A3B8]">{loan.status === 'completed' ? 'Completed' : `${loan.paidEmi}/${loan.totalEmi} EMIs paid`}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      {loan.status === 'active' && <button onClick={() => handlePayEMI(loan.id)} disabled={payingLoan === loan.id} className="p-1.5 rounded-lg hover:bg-[#00D09C]/10" title="Pay EMI"><CheckCircle className="h-3.5 w-3.5 text-[#00D09C]" /></button>}
                      <button onClick={() => { setEditing(loan); setDialogOpen(true); }} className="p-1.5 rounded-lg hover:bg-white/5" title="Edit"><TrendingUp className="h-3.5 w-3.5 text-[#7C5CFF]" /></button>
                      <button onClick={() => handleDelete(loan.id)} className="p-1.5 rounded-lg hover:bg-white/5" title="Delete"><Trash2 className="h-3.5 w-3.5 text-[#FF5A6E]" /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <p className="text-[10px] text-[#94A3B8]">Principal</p>
                      <p className="text-xs font-semibold text-white">{formatCurrency(loan.principalAmount, userData?.currency)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#94A3B8]">Outstanding</p>
                      <p className="text-xs font-semibold text-[#FF5A6E]">{formatCurrency(loan.outstandingBalance, userData?.currency)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#94A3B8]">EMI</p>
                      <p className="text-xs font-semibold text-white">{formatCurrency(loan.emiAmount, userData?.currency)}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-[#94A3B8]">
                      <span>Progress</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2 bg-white/[0.04]" indicatorClassName={loan.status === 'completed' ? 'bg-[#00D09C]' : progress > 50 ? 'bg-[#7C5CFF]' : 'bg-[#FBBF24]'} />
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#94A3B8]">{loan.status === 'completed' ? 'Paid off' : `${formatCurrency(loan.outstandingBalance, userData?.currency)} remaining`}</span>
                      {loan.status === 'active' && loan.nextEmiDate && (
                        <span className="text-[#FBBF24]">Next: {formatDate(toDate(loan.nextEmiDate))}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <LoanDialog
        open={dialogOpen}
        onOpenChange={(o) => { if (!o) { setDialogOpen(false); setEditing(null); } }}
        onSubmit={handleSubmit}
        defaultValues={editing}
      />
    </div>
  );
}