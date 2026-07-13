'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { MonthlyTrend } from '@/types';

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

interface Props {
  monthlyTrend: MonthlyTrend[];
  loading: boolean;
}

export default function MobileChartSection({ monthlyTrend, loading }: Props) {
  const router = useRouter();
  return (
    <motion.div variants={itemAnim}>
      <div className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-5 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#7c5cff]/15">
              <BarChart3 className="h-[18px] w-[18px] text-[#7c5cff]" />
            </div>
            <span className="text-[15px] font-semibold text-white">Spending Trend</span>
          </div>
          {monthlyTrend.length > 0 && (
            <button onClick={() => router.push('/analytics')} className="text-[12px] font-semibold text-[#7c5cff] flex items-center gap-1 active:opacity-70 transition-opacity">
              Analytics <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
        {loading ? (
          <div className="h-[140px] rounded-xl bg-white/5 animate-pulse" />
        ) : monthlyTrend.length === 0 ? (
          <div className="h-[140px] flex flex-col items-center justify-center rounded-xl bg-white/[0.02] border border-dashed border-white/[0.06]">
            <BarChart3 className="h-8 w-8 text-white/10 mb-2" />
            <p className="text-[12px] text-[#6b7b8d] font-medium">No data yet</p>
          </div>
        ) : (
          <div style={{ minHeight: 140, width: '100%' }}>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={monthlyTrend} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7b8d', fontWeight: 500 }} axisLine={false} tickLine={false} dy={4} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#161a27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', fontSize: '12px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="income" fill="#00d09c" radius={[4, 4, 0, 0]} maxBarSize={20} name="Income" />
                <Bar dataKey="expenses" fill="#ff5a7a" radius={[4, 4, 0, 0]} maxBarSize={20} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}
