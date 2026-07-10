'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Label, Tabs, TabsList, TabsTrigger, TabsContent, ToggleSwitch } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Bell, Moon, Sun, Shield, Trash2, CreditCard, Globe, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { CURRENCIES, LANGUAGES } from '@/constants';
import { safeDateInput } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, settings, updateSettings } = useAuth();
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'notifications' | 'privacy' | 'data'>('general');

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
        safeDateInput(e.expenseDate),
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
    <>
    {/* Mobile version */}
    <div className="lg:hidden">
      <div className="px-5 space-y-6 bg-[#09090b] min-h-dvh pb-[calc(64px+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between pt-2">
          <h1 className="text-[18px] font-bold text-white">Settings</h1>
        </div>

        <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4 scrollbar-hide">
          {(['general', 'appearance', 'notifications', 'privacy', 'data'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`shrink-0 px-4 py-1.5 text-[12px] font-medium rounded-full transition-all ${activeTab === tab ? 'bg-[#7c5cff]/20 text-[#7c5cff]' : 'bg-white/5 text-[#6b7b8d] hover:bg-white/10'}`}>
              {tab === 'general' && <><CreditCard className="h-3.5 w-3.5 inline mr-1" /> General</>}
              {tab === 'appearance' && <><Moon className="h-3.5 w-3.5 inline mr-1" /> Appearance</>}
              {tab === 'notifications' && <><Bell className="h-3.5 w-3.5 inline mr-1" /> Notifications</>}
              {tab === 'privacy' && <><Shield className="h-3.5 w-3.5 inline mr-1" /> Privacy</>}
              {tab === 'data' && <><Download className="h-3.5 w-3.5 inline mr-1" /> Data</>}
            </button>
          ))}
        </div>

        {activeTab === 'general' && (
          <div className="space-y-4">
            <div className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-5 space-y-5">
              <h3 className="text-[15px] font-bold text-white">Preferences</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#6b7b8d]">Currency</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CURRENCIES.map((c) => (
                      <button key={c.code} onClick={() => handleCurrencyChange(c.code)} disabled={saving} className={`px-2 py-2 text-[11px] font-medium rounded-xl transition-all ${settings?.currency === c.code ? 'bg-[#7c5cff]/20 text-[#7c5cff]' : 'bg-white/5 text-[#6b7b8d] hover:bg-white/10'}`}>
                        {c.symbol} {c.code}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#6b7b8d]">Language</label>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGUAGES.map((l) => (
                      <button key={l.code} onClick={() => handleLanguageChange(l.code)} className={`px-2 py-2 text-[11px] font-medium rounded-xl transition-all ${settings?.language === l.code ? 'bg-[#7c5cff]/20 text-[#7c5cff]' : 'bg-white/5 text-[#6b7b8d] hover:bg-white/10'}`}>
                        {l.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#6b7b8d]">Timezone</label>
                  <select className="w-full h-[52px] rounded-[16px] bg-[#09090b] border border-white/[0.06] px-4 text-[14px] text-white focus:outline-none focus:border-[#7c5cff]/50"
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
              </div>
            </div>
            <div className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-5 space-y-4">
              <h3 className="text-[15px] font-bold text-[#ff5a7a]">Danger Zone</h3>
              <p className="text-[12px] text-[#6b7b8d]">Once you delete your account, there is no going back. Please be certain.</p>
              <button onClick={() => toast.error('Account deletion is not available yet')} className="px-4 py-2 text-[12px] font-medium rounded-xl bg-[#ff5a7a]/20 text-[#ff5a7a] active:scale-[0.98] transition-all">
                <Trash2 className="h-3.5 w-3.5 inline mr-1" /> Delete Account
              </button>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-5 space-y-4">
            <h3 className="text-[15px] font-bold text-white">Theme</h3>
            <div className="grid grid-cols-3 gap-3">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button key={t} onClick={() => setTheme(t)} className={`p-4 rounded-[16px] border-2 text-center transition-all ${theme === t ? 'border-[#7c5cff] bg-[#7c5cff]/10' : 'border-white/[0.06] hover:border-[#7c5cff]/50'}`}>
                  {t === 'light' && <Sun className="h-5 w-5 mx-auto mb-1.5 text-[#ffb020]" />}
                  {t === 'dark' && <Moon className="h-5 w-5 mx-auto mb-1.5 text-[#7c5cff]" />}
                  {t === 'system' && <Globe className="h-5 w-5 mx-auto mb-1.5 text-[#6b7b8d]" />}
                  <p className="text-[11px] font-medium text-white capitalize">{t}</p>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#6b7b8d]">Choose your preferred appearance. System follows your device setting.</p>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-5 space-y-3">
            <h3 className="text-[15px] font-bold text-white">Notification Preferences</h3>
            {[
              { key: 'budgetLimit', label: 'Budget Limit Alerts', desc: 'Get notified when you approach budget limits' },
              { key: 'monthlySummary', label: 'Monthly Summary', desc: 'Receive a monthly spending summary' },
              { key: 'savingsReminder', label: 'Savings Reminders', desc: 'Reminders to contribute to your savings goals' },
              { key: 'recurringPayment', label: 'Recurring Payment Reminders', desc: 'Get reminded about recurring payments' },
              { key: 'goalAchievement', label: 'Goal Achievements', desc: 'Celebrate when you reach a savings goal' },
              { key: 'pushNotifications', label: 'Push Notifications', desc: 'Enable push notifications on this device' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white">{item.label}</p>
                  <p className="text-[11px] text-[#6b7b8d]">{item.desc}</p>
                </div>
                <ToggleSwitch
                  id={`mobile-notif-${item.key}`}
                  checked={settings?.notifications[item.key as keyof typeof settings.notifications] || false}
                  onChange={(v) => handleNotificationChange(item.key, v)}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-5 space-y-3">
            <h3 className="text-[15px] font-bold text-white">Privacy Settings</h3>
            {[
              { key: 'showBalance', label: 'Show Balance', desc: 'Display your current balance on the dashboard' },
              { key: 'showAnalytics', label: 'Show Analytics', desc: 'Display analytics and charts' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white">{item.label}</p>
                  <p className="text-[11px] text-[#6b7b8d]">{item.desc}</p>
                </div>
                <ToggleSwitch
                  id={`mobile-privacy-${item.key}`}
                  checked={settings?.privacy[item.key as keyof typeof settings.privacy] || false}
                  onChange={(v) => handlePrivacyChange(item.key, v)}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'data' && (
          <div className="bg-[#161a27] rounded-[20px] border border-white/[0.06] p-5 space-y-4">
            <h3 className="text-[15px] font-bold text-white">Backup & Restore</h3>
            <div className="flex flex-col gap-2">
              <button onClick={handleExportJSON} className="w-full h-[48px] rounded-[16px] bg-white/5 border border-white/[0.06] text-[13px] font-medium text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                <Download className="h-4 w-4 text-[#7c5cff]" /> Export JSON (Full)
              </button>
              <button onClick={handleExportCSV} className="w-full h-[48px] rounded-[16px] bg-white/5 border border-white/[0.06] text-[13px] font-medium text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                <FileSpreadsheet className="h-4 w-4 text-[#00d09c]" /> Export CSV (Expenses)
              </button>
              <button onClick={handleImportJSON} className="w-full h-[48px] rounded-[16px] bg-white/5 border border-white/[0.06] text-[13px] font-medium text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                <Upload className="h-4 w-4 text-[#ffb020]" /> Import JSON
              </button>
            </div>
            <p className="text-[11px] text-[#6b7b8d]">Export all your data (expenses, income, budgets, goals, subscriptions, loans, recurring rules) as JSON. CSV export available for expenses. Use Firebase console for bulk import.</p>
          </div>
        )}
      </div>
    </div>
    {/* Desktop version */}
    <div className="hidden lg:block">
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 animate-fade-in max-w-[900px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your preferences</p>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
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
                  <ToggleSwitch
                    id={`desktop-notif-${item.key}`}
                    checked={settings?.notifications[item.key as keyof typeof settings.notifications] || false}
                    onChange={(v) => handleNotificationChange(item.key, v)}
                  />
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
                  <ToggleSwitch
                    id={`desktop-privacy-${item.key}`}
                    checked={settings?.privacy[item.key as keyof typeof settings.privacy] || false}
                    onChange={(v) => handlePrivacyChange(item.key, v)}
                  />
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
    </div>
    </>
  );
}
