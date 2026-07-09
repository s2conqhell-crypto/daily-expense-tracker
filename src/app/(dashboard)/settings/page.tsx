'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Label, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Bell, Moon, Sun, Shield, Trash2, CreditCard, Globe, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { CURRENCIES, LANGUAGES } from '@/constants';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, settings, updateSettings } = useAuth();
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);

  const handleCurrencyChange = async (currency: string) => {
    setSaving(true);
    try { await updateSettings({ currency }); toast.success('Currency updated'); }
    catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const handleLanguageChange = async (language: string) => {
    try { await updateSettings({ language }); toast.success('Language updated'); }
    catch { toast.error('Failed to update'); }
  };

  const handleNotificationChange = async (key: string, value: boolean) => {
    if (!settings) return;
    try { await updateSettings({ notifications: { ...settings.notifications, [key]: value } }); }
    catch { toast.error('Failed to update'); }
  };

  const handlePrivacyChange = async (key: string, value: boolean) => {
    if (!settings) return;
    try { await updateSettings({ privacy: { ...settings.privacy, [key]: value } }); }
    catch { toast.error('Failed to update'); }
  };

  const handleExportJSON = async () => {
    try {
      const { firebaseService } = await import('@/firebase/services');
      if (!user) return;
      const uid = user.uid;
      const [expenses, incomes, budgets, savingGoals, subscriptions, loans, recurringRules] = await Promise.all([
        firebaseService.expenses.getAll(uid),
        firebaseService.income.getAll(uid),
        firebaseService.budgets.getAll(uid),
        firebaseService.savingGoals.getAll(uid),
        firebaseService.subscriptions.getAll(uid),
        firebaseService.loans.getAll(uid),
        firebaseService.recurringTransactions.getAll(uid),
      ]);
      const data = JSON.stringify({
        version: '2.0',
        exportedAt: new Date().toISOString(),
        expenses, incomes, budgets, savingGoals, subscriptions, loans, recurringRules,
      }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `expenseflow-full-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      toast.success('Full backup exported successfully');
    } catch { toast.error('Export failed'); }
  };

  const handleExportCSV = async () => {
    try {
      const { firebaseService } = await import('@/firebase/services');
      if (!user) return;
      const expenses = await firebaseService.expenses.getAll(user.uid);
      const headers = ['Date', 'Description', 'Category', 'Amount', 'Payment Method', 'Notes'];
      const rows = expenses.map((e: any) => [
        new Date(e.expenseDate?.seconds ? e.expenseDate.seconds * 1000 : e.expenseDate).toISOString().split('T')[0],
        `"${(e.description || '').replace(/"/g, '""')}"`,
        `"${(e.category || '').replace(/"/g, '""')}"`,
        e.amount,
        `"${(e.paymentMethod || '').replace(/"/g, '""')}"`,
        `"${(e.notes || '').replace(/"/g, '""')}"`,
      ].join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `expenseflow-expenses-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      toast.success('CSV exported');
    } catch { toast.error('CSV export failed'); }
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data.version) { toast.error('Use the full backup export format'); return; }
        const count = (data.expenses?.length || 0) + (data.incomes?.length || 0) + (data.budgets?.length || 0);
        toast.success(`Backup found: ${count} records ready. Import not yet available in UI — use Firebase console for bulk import.`);
      } catch { toast.error('Invalid file format'); }
    };
    input.click();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 animate-fade-in max-w-[900px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your preferences</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="general"><CreditCard className="h-4 w-4 mr-2" /> General</TabsTrigger>
          <TabsTrigger value="appearance"><Moon className="h-4 w-4 mr-2" /> Appearance</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-2" /> Notifications</TabsTrigger>
          <TabsTrigger value="privacy"><Shield className="h-4 w-4 mr-2" /> Privacy</TabsTrigger>
          <TabsTrigger value="data"><Download className="h-4 w-4 mr-2" /> Data</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Currency</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {CURRENCIES.map((c) => (
                    <Button key={c.code} variant={settings?.currency === c.code ? 'default' : 'outline'} size="sm"
                      onClick={() => handleCurrencyChange(c.code)} disabled={saving}>
                      {c.symbol} {c.code}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {LANGUAGES.map((l) => (
                    <Button key={l.code} variant={settings?.language === l.code ? 'default' : 'outline'} size="sm"
                      onClick={() => handleLanguageChange(l.code)}>
                      {l.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <select
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                  onChange={async (e) => {
                    try { await updateSettings({ timezone: e.target.value }); toast.success('Timezone updated'); }
                    catch { toast.error('Failed to update'); }
                  }}
                >
                  {(Intl as any).supportedValuesOf?.('timeZone')?.map((tz: string) => (
                    <option key={tz} value={tz}>{tz}</option>
                  )) || <option>UTC</option>}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base text-destructive">Danger Zone</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <Button variant="destructive" className="gap-1.5" onClick={() => toast.error('Account deletion is not available yet')}>
                <Trash2 className="h-4 w-4" /> Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Theme</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button key={t} onClick={() => setTheme(t)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      theme === t ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {t === 'light' && <Sun className="h-6 w-6 mx-auto mb-2" />}
                    {t === 'dark' && <Moon className="h-6 w-6 mx-auto mb-2" />}
                    {t === 'system' && <Globe className="h-6 w-6 mx-auto mb-2" />}
                    <p className="text-sm font-medium capitalize">{t}</p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">Choose your preferred appearance. System follows your device setting.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Notification Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {[
                { key: 'budgetLimit', label: 'Budget Limit Alerts', desc: 'Get notified when you approach budget limits' },
                { key: 'monthlySummary', label: 'Monthly Summary', desc: 'Receive a monthly spending summary' },
                { key: 'savingsReminder', label: 'Savings Reminders', desc: 'Reminders to contribute to your savings goals' },
                { key: 'recurringPayment', label: 'Recurring Payment Reminders', desc: 'Get reminded about recurring payments' },
                { key: 'goalAchievement', label: 'Goal Achievements', desc: 'Celebrate when you reach a savings goal' },
                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Enable push notifications on this device' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer"
                      checked={settings?.notifications[item.key as keyof typeof settings.notifications] || false}
                      onChange={(e) => handleNotificationChange(item.key, e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/30 after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Privacy Settings</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {[
                { key: 'showBalance', label: 'Show Balance', desc: 'Display your current balance on the dashboard' },
                { key: 'showAnalytics', label: 'Show Analytics', desc: 'Display analytics and charts' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer"
                      checked={settings?.privacy[item.key as keyof typeof settings.privacy] || false}
                      onChange={(e) => handlePrivacyChange(item.key, e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/30 after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Backup & Restore</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="gap-2" onClick={handleExportJSON}>
                  <Download className="h-4 w-4" /> Export JSON (Full)
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
                  <FileSpreadsheet className="h-4 w-4" /> Export CSV (Expenses)
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleImportJSON}>
                  <Upload className="h-4 w-4" /> Import JSON
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Export all your data (expenses, income, budgets, goals, subscriptions, loans, recurring rules) as JSON. CSV export available for expenses. Use Firebase console for bulk import.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
