'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui';
import { SUBSCRIPTION_CATEGORIES } from '@/constants';
import type { Subscription } from '@/types';
import toast from 'react-hot-toast';

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  defaultValues?: Subscription;
}

const defaultForm = (defaults?: Subscription) => ({
  name: defaults?.name || '',
  category: defaults?.category || 'Netflix',
  customCategory: defaults?.customCategory || '',
  monthlyCost: defaults?.monthlyCost?.toString() || '',
  yearlyCost: defaults?.yearlyCost?.toString() || '',
  renewalDate: defaults?.renewalDate ? new Date(defaults.renewalDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  autoRenew: defaults?.autoRenew ?? true,
  reminderEnabled: defaults?.reminderEnabled ?? true,
  status: defaults?.status || 'active',
  notes: defaults?.notes || '',
});

export function SubscriptionDialog({ open, onOpenChange, onSubmit, defaultValues }: SubscriptionDialogProps) {
  const [form, setForm] = useState<Record<string, string | boolean>>(defaultForm(defaultValues));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setForm(defaultForm(defaultValues));
  }, [open, defaultValues]);

  const set = (field: string, value: string | boolean) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const monthlyCost = parseFloat(form.monthlyCost as string);
      const yearlyCost = parseFloat(form.yearlyCost as string);
      if (isNaN(monthlyCost) || monthlyCost <= 0) throw new Error('Invalid monthly cost');
      await onSubmit({
        name: form.name as string,
        category: form.category as any,
        customCategory: form.category === 'Custom' ? (form.customCategory as string) : undefined,
        monthlyCost,
        yearlyCost: isNaN(yearlyCost) ? monthlyCost * 12 : yearlyCost,
        renewalDate: new Date(form.renewalDate as string),
        autoRenew: form.autoRenew as boolean,
        reminderEnabled: form.reminderEnabled as boolean,
        status: form.status as 'active' | 'paused' | 'expired',
        notes: (form.notes as string) || undefined,
      });
      onOpenChange(false);
      toast.success(defaultValues ? 'Subscription updated' : 'Subscription added');
    } catch {
      toast.error('Failed to save subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{defaultValues ? 'Edit Subscription' : 'Add Subscription'}</DialogTitle>
          <DialogDescription>Track your recurring subscriptions and bills.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Netflix, Spotify, ..." value={form.name as string} onChange={(e) => set('name', e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.category as string} onValueChange={(v) => set('category', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SUBSCRIPTION_CATEGORIES.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          {form.category === 'Custom' && (
            <div className="space-y-2">
              <Label htmlFor="customCategory">Custom Category Name</Label>
              <Input id="customCategory" placeholder="e.g. Adobe CC" value={form.customCategory as string} onChange={(e) => set('customCategory', e.target.value)} required />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="monthlyCost">Monthly Cost</Label>
              <Input id="monthlyCost" type="number" step="0.01" min="0" placeholder="0.00" value={form.monthlyCost as string} onChange={(e) => set('monthlyCost', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearlyCost">Yearly Cost</Label>
              <Input id="yearlyCost" type="number" step="0.01" min="0" placeholder="0.00" value={form.yearlyCost as string} onChange={(e) => set('yearlyCost', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="renewalDate">Renewal Date</Label>
            <Input id="renewalDate" type="date" value={form.renewalDate as string} onChange={(e) => set('renewalDate', e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status as string} onValueChange={(v) => set('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.autoRenew as boolean} onChange={(e) => set('autoRenew', e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
              <span className="text-sm">Auto Renew</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.reminderEnabled as boolean} onChange={(e) => set('reminderEnabled', e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
              <span className="text-sm">Reminder</span>
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input id="notes" placeholder="Add a note..." value={form.notes as string} onChange={(e) => set('notes', e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : defaultValues ? 'Update' : 'Add Subscription'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}