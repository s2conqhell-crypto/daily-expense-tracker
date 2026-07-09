'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Skeleton } from '@/components/ui';
import { ChevronLeft, ChevronRight, Plus, Receipt, TrendingUp, TrendingDown, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useExpenses } from '@/hooks/useExpenses';
import { useIncome } from '@/hooks/useIncome';
import { TransactionDialog } from '@/components/transactions/TransactionDialog';
import { formatCurrency } from '@/utils/format';
import { getMonthDays, getMonthName, toDate } from '@/utils/helpers';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const { user, userData } = useAuth();
  const { expenses, loading } = useExpenses();
  const { incomes } = useIncome();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getMonthDays(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (day: number) => {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === selectedDate.getTime();
  };

  const getDayExpenses = (day: number) =>
    expenses.filter((e) => {
      const ed = toDate(e.expenseDate);
      return ed.getFullYear() === year && ed.getMonth() === month && ed.getDate() === day;
    });

  const getDayIncome = (day: number) =>
    incomes.filter((i) => {
      const id = toDate(i.incomeDate);
      return id.getFullYear() === year && id.getMonth() === month && id.getDate() === day;
    });

  const selectedDayExpenses = selectedDate
    ? expenses.filter((e) => {
        const ed = toDate(e.expenseDate);
        return ed.getFullYear() === selectedDate.getFullYear()
          && ed.getMonth() === selectedDate.getMonth()
          && ed.getDate() === selectedDate.getDate();
      })
    : [];

  const selectedDayIncome = selectedDate
    ? incomes.filter((i) => {
        const id = toDate(i.incomeDate);
        return id.getFullYear() === selectedDate.getFullYear()
          && id.getMonth() === selectedDate.getMonth()
          && id.getDate() === selectedDate.getDate();
      })
    : [];

  const selectedDayExpTotal = selectedDayExpenses.reduce((s, e) => s + e.amount, 0);
  const selectedDayIncTotal = selectedDayIncome.reduce((s, i) => s + i.amount, 0);

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <>
    {/* Mobile version */}
    <div className="lg:hidden">
      <div className="px-5 space-y-6 min-h-dvh bg-[#09090b]" style={{ paddingBottom: 'calc(90px + env(safe-area-inset-bottom, 0px))' }}>
        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-[18px] font-bold text-white">Calendar</h1>
            <p className="text-[12px] text-[#6b7b8d]">View your transactions by date</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7c5cff]/15">
            <CalendarIcon className="h-[18px] w-[18px] text-[#7c5cff]" />
          </div>
        </div>

        {/* Calendar grid will reuse desktop logic in mobile format */}
        <div className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-5 card-shadow">
          <div className="grid grid-cols-7 gap-1 text-center mb-3">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => (
              <span key={day} className="text-[10px] font-semibold text-[#6b7b8d] uppercase tracking-wider">{day.substring(0,3)}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 animate-fade-in max-w-[1200px] mx-auto">
      <TransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} type="expense"
        onSubmit={async (data) => {
          try {
            const { firebaseService } = await import('@/firebase/services');
            await firebaseService.expenses.add(user!.uid, data as any);
          } catch {}
          setDialogOpen(false);
        }}
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground">View expenses by date</p>
        </div>
        <Button className="gap-1.5 shrink-0" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Add Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          {loading ? (
            <CardContent className="p-6">
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-xl"><ChevronLeft className="h-5 w-5" /></Button>
                  <CardTitle className="text-base">{getMonthName(month)} {year}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-xl"><ChevronRight className="h-5 w-5" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {WEEKDAYS.map((day) => (
                    <div key={day} className="text-center text-[11px] font-medium text-muted-foreground py-1.5">{day}</div>
                  ))}
                  {days.map((day, i) => {
                    const dayExp = day ? getDayExpenses(day) : [];
                    const dayInc = day ? getDayIncome(day) : [];
                    const hasExpenses = dayExp.length > 0;
                    const hasIncome = dayInc.length > 0;
                    return (
                      <button
                        key={i}
                        onClick={() => day && setSelectedDate(new Date(year, month, day))}
                        disabled={!day}
                        className={`relative aspect-square rounded-xl text-sm font-medium transition-all duration-200 flex flex-col items-center justify-center
                          ${!day ? 'invisible' : ''}
                          ${isToday(day || 0) ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25' : ''}
                          ${isSelected(day || 0) && !isToday(day || 0) ? 'bg-accent text-accent-foreground ring-2 ring-primary/50' : ''}
                          ${day && !isToday(day || 0) && !isSelected(day || 0) ? 'hover:bg-accent/50 text-foreground' : ''}
                        `}
                      >
                        <span>{day}</span>
                        {(hasExpenses || hasIncome) && (
                          <div className="flex gap-0.5 mt-0.5">
                            {hasExpenses && <div className="h-1 w-1 rounded-full bg-rose-500" />}
                            {hasIncome && <div className="h-1 w-1 rounded-full bg-emerald-500" />}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {selectedDate
                ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                : 'Select a Date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-emerald-500/10">
                    <TrendingUp className="h-4 w-4 text-emerald-500 mb-1" />
                    <p className="text-[10px] text-muted-foreground">Income</p>
                    <p className="text-sm font-semibold text-emerald-500">{formatCurrency(selectedDayIncTotal, userData?.currency)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-500/10">
                    <TrendingDown className="h-4 w-4 text-rose-500 mb-1" />
                    <p className="text-[10px] text-muted-foreground">Expenses</p>
                    <p className="text-sm font-semibold text-rose-500">{formatCurrency(selectedDayExpTotal, userData?.currency)}</p>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                  </div>
                ) : selectedDayExpenses.length === 0 && selectedDayIncome.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No transactions on this day</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[280px] overflow-y-auto">
                    {selectedDayIncome.map((inc) => (
                      <div key={inc.id} className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/5">
                        <div>
                          <p className="text-sm font-medium">{inc.description}</p>
                          <p className="text-xs text-muted-foreground">{inc.source}</p>
                        </div>
                        <span className="text-sm font-semibold text-emerald-500">+{formatCurrency(inc.amount, userData?.currency)}</span>
                      </div>
                    ))}
                    {selectedDayExpenses.map((e) => (
                      <div key={e.id} className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/5">
                        <div>
                          <p className="text-sm font-medium">{e.description}</p>
                          <p className="text-xs text-muted-foreground">{e.category}</p>
                        </div>
                        <span className="text-sm font-semibold text-rose-500">-{formatCurrency(e.amount, userData?.currency)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" className="w-full gap-1.5" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4" /> Add Expense
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Click a date to view transactions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
