'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, Button, Input, Label, Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, Loader2, Save } from 'lucide-react';
import { getInitials } from '@/utils/helpers';
import { firebaseService } from '@/firebase/services';
import toast from 'react-hot-toast';
import { CURRENCIES } from '@/constants';

export default function ProfilePage() {
  const { user, userData, updateUserData } = useAuth();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(userData?.name || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [currency, setCurrency] = useState(userData?.currency || 'USD');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
      setPhone(userData.phone || '');
      setCurrency(userData.currency || 'USD');
    }
  }, [userData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserData({ name, phone, currency });
      await firebaseService.auth.updateProfile({ displayName: name });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setSaving(true);
    try {
      const url = await firebaseService.storage.uploadProfilePicture(user.uid, file);
      await updateUserData({ photoURL: url });
      await firebaseService.auth.updateProfile({ photoURL: url });
      toast.success('Profile photo updated');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback className="text-2xl">{getInitials(userData?.name || 'U')}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            <h2 className="text-xl font-bold mt-3">{userData?.name || 'User'}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Preferred Currency</Label>
              <div className="flex flex-wrap gap-2">
                {CURRENCIES.map((c) => (
                  <Button
                    key={c.code}
                    variant={currency === c.code ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrency(c.code)}
                  >
                    {c.symbol} {c.code}
                  </Button>
                ))}
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full gap-1.5">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
