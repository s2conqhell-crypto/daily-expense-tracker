'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui';
import type { MonthlyTrend } from '@/types';

const itemAnim = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

interface Props {
  monthlyTrend: MonthlyTrend[];
  loading: boolean;
}

export default function DashboardChart({ monthlyTrend, loading }: Props) {
  return (
    <motion.div variants={itemAnim} initial="hidden" animate="show" className="lg:col-span-2">
      <div className="bg-[#141822] rounded-xl border border-white/[0.08] p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-[#8B6FFF]/15 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-[#8B6FFF]" />
            </div>
            <span className="text-sm font-bold text-white">Income vs Expenses</span>
          </div>
          <Badge className="text-[10px] rounded-lg bg-white/5 text-[#8899AA] border border-white/[0.06] font-medium">Last 6 months</Badge>
        </div>
        {loading ? (
          <div className="h-[260px] rounded-xl bg-white/5 animate-pulse" />
        ) : monthlyTrend.length === 0 ? (
          <div className="h-[260px] flex flex-col items-center justify-center rounded-xl bg-white/[0.02] border border-dashed border-white/[0.06]">
            <TrendingUp className="h-10 w-10 text-white/10 mb-2" />
            <p className="text-sm font-medium text-[#8899AA]">No chart data yet</p>
            <p className="text-[10px] text-[#8899AA]/60 mt-0.5">Add transactions to see trends</p>
          </div>
        ) : (
          <div style={{ minHeight: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyTrend} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8899AA', fontWeight: 500 }} axisLine={false} tickLine={false} dy={6} />
                <YAxis tick={{ fontSize: 11, fill: '#8899AA', fontWeight: 500 }} axisLine={false} tickLine={false} dx={-4} />
                <Tooltip
                  contentStyle={{ background: '#1A1D2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', fontWeight: 500 }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="income" fill="#00D09C" radius={[4, 4, 0, 0]} maxBarSize={28} name="Income" />
                <Bar dataKey="expenses" fill="#FF5A6E" radius={[4, 4, 0, 0]} maxBarSize={28} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {monthlyTrend.length > 0 && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-[#00D09C]" />
              <span className="text-[11px] font-medium text-[#8899AA]">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-[#FF5A6E]" />
              <span className="text-[11px] font-medium text-[#8899AA]">Expenses</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
