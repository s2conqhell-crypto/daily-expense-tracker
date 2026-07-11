'use client';

import { useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Tabs, TabsList, TabsTrigger, TabsContent, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Skeleton } from '@/components/ui';
import { StatCard } from '@/components/shared/StatCard';
import { Download, Printer, Share2, FileSpreadsheet, FileJson, Calendar, TrendingUp, CreditCard, PiggyBank, Wallet, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import { formatCurrency } from '@/utils/format';
import { getMonthName } from '@/utils/helpers';
import toast from 'react-hot-toast';

function ReportsContent() {
  const { userData } = useAuth();
  const { summary, monthlyTrend, categoryBreakdown, loading } = useDashboard();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const exportCSV = () => {
    const headers = 'Month,Income,Expenses,Savings\n';
    const rows = monthlyTrend.map((m) => `${m.month},${m.income},${m.expenses},${m.savings}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `expenseflow-report-${getMonthName(selectedMonth)}-${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(URL.createObjectURL(blob));
    toast.success('CSV exported');
  };

  const exportJSON = () => {
    const data = { summary: { ...summary, recentTransactions: undefined }, monthlyTrend, categoryBreakdown };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `expenseflow-report-${getMonthName(selectedMonth)}-${selectedYear}.json`;
    a.click();
    toast.success('JSON exported');
  };

  const printReport = () => window.print();

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Financial Report`, 14, 20);
    doc.setFontSize(10);
    doc.text(`${getMonthName(selectedMonth)} ${selectedYear}`, 14, 28);
    autoTable(doc, {
      startY: 35,
      head: [['Category', 'Amount', 'Percentage']],
      body: categoryBreakdown.map((c) => [c.category, formatCurrency(c.amount, userData?.currency), `${c.percentage.toFixed(1)}%`]),
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 9 },
    });
    doc.save(`expenseflow-report-${getMonthName(selectedMonth)}-${selectedYear}.pdf`);
    toast.success('PDF exported');
  };

  const exportXLSX = async () => {
    const { default: ExcelJS } = await import('exceljs');
    const { saveAs } = await import('file-saver');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');
    sheet.columns = [
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Percentage', key: 'percentage', width: 12 },
    ];
    categoryBreakdown.forEach((c) => sheet.addRow({ category: c.category, amount: formatCurrency(c.amount, userData?.currency), percentage: `${c.percentage.toFixed(1)}%` }));
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `expenseflow-report-${getMonthName(selectedMonth)}-${selectedYear}.xlsx`);
    toast.success('Excel exported');
  };

  const shareReport = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ExpenseFlow Report - ${getMonthName(selectedMonth)} ${selectedYear}`,
          text: `Income: ${formatCurrency(summary.totalIncome, userData?.currency)}, Expenses: ${formatCurrency(summary.totalExpenses, userData?.currency)}, Savings: ${formatCurrency(summary.savings, userData?.currency)}`,
        });
      } catch { /* user cancelled */ }
    } else toast.error('Sharing not supported');
  };

  return (
    <>
    {/* Mobile version */}
    <div className="lg:hidden">
      <div className="px-5 space-y-6 min-h-dvh bg-[#09090b]" style={{ paddingBottom: 'calc(90px + env(safe-area-inset-bottom, 0px))' }}>
        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-[18px] font-bold text-white">Reports</h1>
            <p className="text-[12px] text-[#6b7b8d]">Financial overview</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7c5cff]/15">
            <FileText className="h-[18px] w-[18px] text-[#7c5cff]" />
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-4 card-shadow">
            <p className="text-[11px] text-[#6b7b8d] font-medium uppercase tracking-wider">Income</p>
            <p className="text-[17px] font-bold text-white mt-1">{formatCurrency(summary.totalIncome, userData?.currency)}</p>
          </div>
          <div className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-4 card-shadow">
            <p className="text-[11px] text-[#6b7b8d] font-medium uppercase tracking-wider">Expenses</p>
            <p className="text-[17px] font-bold text-[#ff5a7a] mt-1">{formatCurrency(summary.totalExpenses, userData?.currency)}</p>
          </div>
          <div className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-4 card-shadow">
            <p className="text-[11px] text-[#6b7b8d] font-medium uppercase tracking-wider">Savings</p>
            <p className="text-[17px] font-bold text-[#00d09c] mt-1">{formatCurrency(summary.savings, userData?.currency)}</p>
          </div>
          <div className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-4 card-shadow">
            <p className="text-[11px] text-[#6b7b8d] font-medium uppercase tracking-wider">Balance</p>
            <p className="text-[17px] font-bold text-[#7c5cff] mt-1">{formatCurrency(summary.currentBalance, userData?.currency)}</p>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-5 card-shadow">
          <h2 className="text-[15px] font-bold text-white mb-3">Category Breakdown</h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : categoryBreakdown.length === 0 ? (
            <p className="text-[13px] text-[#6b7b8d] text-center py-4">No expenses yet</p>
          ) : (
            <div className="space-y-2">
              {categoryBreakdown.slice(0, 5).map((cat, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-0">
                  <span className="text-[14px] text-white font-medium">{cat.category}</span>
                  <span className="text-[14px] font-semibold text-white">{formatCurrency(cat.amount, userData?.currency)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export actions */}
        <div className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-5 card-shadow">
          <h2 className="text-[15px] font-bold text-white mb-3">Export</h2>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={printReport} className="touch-target flex flex-col items-center gap-1.5 rounded-xl bg-white/5 p-3 active:scale-95 transition-all"><Printer className="h-5 w-5 text-white/70" /><span className="text-[10px] text-[#6b7b8d] font-medium">Print</span></button>
            <button onClick={exportCSV} className="touch-target flex flex-col items-center gap-1.5 rounded-xl bg-white/5 p-3 active:scale-95 transition-all"><FileSpreadsheet className="h-5 w-5 text-[#00d09c]" /><span className="text-[10px] text-[#6b7b8d] font-medium">CSV</span></button>
            <button onClick={exportJSON} className="touch-target flex flex-col items-center gap-1.5 rounded-xl bg-white/5 p-3 active:scale-95 transition-all"><FileJson className="h-5 w-5 text-[#ffb020]" /><span className="text-[10px] text-[#6b7b8d] font-medium">JSON</span></button>
            <button onClick={exportPDF} className="touch-target flex flex-col items-center gap-1.5 rounded-xl bg-white/5 p-3 active:scale-95 transition-all"><Download className="h-5 w-5 text-[#ff5a7a]" /><span className="text-[10px] text-[#6b7b8d] font-medium">PDF</span></button>
            <button onClick={exportXLSX} className="touch-target flex flex-col items-center gap-1.5 rounded-xl bg-white/5 p-3 active:scale-95 transition-all"><Download className="h-5 w-5 text-[#7c5cff]" /><span className="text-[10px] text-[#6b7b8d] font-medium">Excel</span></button>
            <button onClick={shareReport} className="touch-target flex flex-col items-center gap-1.5 rounded-xl bg-white/5 p-3 active:scale-95 transition-all"><Share2 className="h-5 w-5 text-[#3b82f6]" /><span className="text-[10px] text-[#6b7b8d] font-medium">Share</span></button>
          </div>
        </div>

        {/* Desktop note */}
        <div className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-5 card-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ffb020]/15">
              <FileText className="h-4 w-4 text-[#ffb020]" />
            </div>
            <p className="text-[13px] text-[#6b7b8d] font-medium">Detailed charts and breakdowns are available on desktop.</p>
          </div>
        </div>
      </div>
    </div>

    <div className="hidden lg:block p-4 sm:p-6 lg:p-8 space-y-5 animate-fade-in print:p-0 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">Generate and export financial reports</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={printReport}><Printer className="h-3.5 w-3.5" /> Print</Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={exportCSV}><FileSpreadsheet className="h-3.5 w-3.5" /> CSV</Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={exportJSON}><FileJson className="h-3.5 w-3.5" /> JSON</Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={exportPDF}><Download className="h-3.5 w-3.5" /> PDF</Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={exportXLSX}><Download className="h-3.5 w-3.5" /> Excel</Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={shareReport}><Share2 className="h-3.5 w-3.5" /> Share</Button>
        </div>
      </div>

      <Tabs defaultValue="monthly">
        <TabsList>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4 pt-4">
          <div className="flex gap-3 print:hidden">
            <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
              <SelectTrigger className="w-[160px]"><Calendar className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => <SelectItem key={i} value={String(i)}>{getMonthName(i)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => <SelectItem key={i} value={String(selectedYear - 2 + i)}>{selectedYear - 2 + i}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">{getMonthName(selectedMonth)} {selectedYear} — Financial Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Income" value={formatCurrency(summary.totalIncome, userData?.currency)} icon={TrendingUp} color="bg-emerald-500" loading={loading} />
                <StatCard title="Total Expenses" value={formatCurrency(summary.totalExpenses, userData?.currency)} icon={CreditCard} color="bg-rose-500" loading={loading} />
                <StatCard title="Savings" value={formatCurrency(summary.savings, userData?.currency)} icon={PiggyBank} color="bg-violet-500" loading={loading} />
                <StatCard title="Balance" value={formatCurrency(summary.currentBalance, userData?.currency)} icon={Wallet} color="bg-blue-500" loading={loading} />
              </div>

              <div>
                <h3 className="font-semibold mb-3">Category Breakdown</h3>
                {categoryBreakdown.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No expenses yet</p>
                  </div>
                ) : (
                  <div className="rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="text-left py-2.5 px-4 font-medium">Category</th>
                          <th className="text-right py-2.5 px-4 font-medium">Amount</th>
                          <th className="text-right py-2.5 px-4 font-medium hidden sm:table-cell">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryBreakdown.map((cat, i) => (
                          <tr key={i} className="border-b last:border-0 hover:bg-accent/30 transition-colors">
                            <td className="py-2.5 px-4">{cat.category}</td>
                            <td className="text-right py-2.5 px-4 font-medium">{formatCurrency(cat.amount, userData?.currency)}</td>
                            <td className="text-right py-2.5 px-4 text-muted-foreground hidden sm:table-cell">{cat.percentage.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 print:hidden">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={exportPDF}><Download className="h-4 w-4" /> PDF</Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={exportXLSX}><Download className="h-4 w-4" /> Excel</Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={shareReport}><Share2 className="h-4 w-4" /> Share</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yearly" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle>Yearly Overview</CardTitle></CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-[200px]" /> : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard title="Total Income" value={formatCurrency(summary.totalIncome * 12, userData?.currency)} icon={TrendingUp} color="bg-emerald-500" loading={loading} />
                    <StatCard title="Total Expenses" value={formatCurrency(summary.totalExpenses * 12, userData?.currency)} icon={CreditCard} color="bg-rose-500" loading={loading} />
                    <StatCard title="Avg Monthly" value={formatCurrency(summary.monthlySpending, userData?.currency)} icon={Wallet} color="bg-violet-500" loading={loading} />
                    <StatCard title="Savings Rate" value={summary.savingsPercentage.toFixed(1) + '%'} icon={PiggyBank} color="bg-amber-500" loading={loading} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle>Full Financial Summary</CardTitle></CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-[200px]" /> : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Total Income', value: formatCurrency(summary.totalIncome, userData?.currency) },
                    { label: 'Total Expenses', value: formatCurrency(summary.totalExpenses, userData?.currency) },
                    { label: 'Net Savings', value: formatCurrency(summary.savings, userData?.currency) },
                    { label: 'Savings Rate', value: summary.savingsPercentage.toFixed(1) + '%' },
                    { label: 'Budget Utilization', value: summary.totalBudget > 0 ? ((summary.totalBudgetSpent / summary.totalBudget) * 100).toFixed(1) + '%' : '0%' },
                    { label: 'Health Score', value: `${summary.financialHealthScore}/100` },
                  ].map((item) => (
                    <div key={item.label} className="p-4 rounded-xl bg-accent/30">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-lg font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-[#09090b] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#7c5cff] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ReportsContent />
    </Suspense>
  );
}
