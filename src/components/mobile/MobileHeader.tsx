'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { ROUTES } from '@/constants';
import { getInitials } from '@/utils/helpers';

export function MobileHeader() {
  const { user, userData } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between px-4 safe-area-top bg-[#0A0C10]">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B6FFF] to-[#6B4FF5] shadow-lg shadow-[#8B6FFF]/20">
          <Wallet className="h-4 w-4 text-white" />
        </div>
        <span className="text-[17px] font-bold tracking-tight text-white">ExpenseFlow</span>
      </div>
      <div className="flex items-center gap-1">
        <Link href={ROUTES.SETTINGS} className="touch-target rounded-xl text-[#8899AA] hover:text-white hover:bg-white/5 h-9 w-9 flex items-center justify-center">
          <Bell className="h-5 w-5" />
        </Link>
        <Link href={ROUTES.PROFILE}>
          <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-[#8B6FFF]/20">
            <AvatarImage src={user?.photoURL || undefined} />
            <AvatarFallback className="text-[11px] font-medium bg-[#8B6FFF]/10 text-[#8B6FFF]">{getInitials(userData?.name || user?.displayName || 'U')}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
