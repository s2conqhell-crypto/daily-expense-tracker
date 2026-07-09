'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Wallet, Bell, LayoutDashboard, TrendingDown, ArrowUpFromLine,
  Target, PiggyBank, Banknote, Repeat, Clock, BarChart3, FileText,
  Settings, LogOut, X, ChevronRight,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ROUTES } from '@/constants';
import { getInitials, toDate } from '@/utils/helpers';
import { NotificationBell } from '@/components/shared/NotificationBell';

const navItems = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, color: '#8B6FFF' },
  { href: ROUTES.EXPENSES, label: 'Expenses', icon: TrendingDown, color: '#FF5A6E' },
  { href: ROUTES.INCOME, label: 'Income', icon: ArrowUpFromLine, color: '#00D09C' },
  { href: ROUTES.BUDGETS, label: 'Budget', icon: Target, color: '#FBBF24' },
  { href: ROUTES.SAVINGS, label: 'Savings', icon: PiggyBank, color: '#3B82F6' },
  { href: ROUTES.LOANS, label: 'Loans', icon: Banknote, color: '#FF5A6E' },
  { href: ROUTES.SUBSCRIPTIONS, label: 'Subscriptions', icon: Repeat, color: '#8B6FFF' },
  { href: ROUTES.RECURRING, label: 'Recurring', icon: Clock, color: '#00D09C' },
  { href: ROUTES.REPORTS, label: 'Reports', icon: FileText, color: '#FBBF24' },
  { href: ROUTES.ANALYTICS, label: 'Analytics', icon: BarChart3, color: '#3B82F6' },
];

const bottomItems = [
  { href: ROUTES.SETTINGS, label: 'Settings', icon: Settings, color: '#8899AA' },
];

export function MobileHeader() {
  const { user, userData, logOut } = useAuth();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const userName = userData?.name || user?.displayName || 'User';
  const userEmail = user?.email || '';
  const initials = getInitials(userName);

  return (
    <>
      <header
        className="relative z-40 flex items-center justify-between bg-[#0A0C10] px-5"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)', height: 'calc(72px + env(safe-area-inset-top, 0px))' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="touch-target flex h-10 w-10 items-center justify-center rounded-xl text-[#8899AA] hover:bg-white/5 active:scale-90 transition-all"
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="19" y2="6" />
              <line x1="3" y1="11" x2="19" y2="11" />
              <line x1="3" y1="16" x2="19" y2="16" />
            </svg>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-[#8B6FFF]/25">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-[18px] font-bold tracking-tight text-white">ExpenseFlow</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <Link href={ROUTES.PROFILE}>
            <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-[#8B6FFF]/20 ring-offset-2 ring-offset-[#0A0C10] active:scale-95 transition-transform">
              <AvatarImage src={user?.photoURL || undefined} />
              <AvatarFallback className="text-[12px] font-semibold gradient-primary text-white">{initials}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-[290px] bg-[#0A0C10] border-r border-white/[0.06] p-0 flex flex-col shadow-2xl shadow-black/40">
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-[#8B6FFF]/25">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[17px] font-bold tracking-tight text-white">ExpenseFlow</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="touch-target flex h-9 w-9 items-center justify-center rounded-xl text-[#8899AA] hover:bg-white/5 active:scale-90 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-[#8B6FFF]/20">
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback className="text-[14px] font-bold gradient-primary text-white">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-white truncate">{userName}</p>
                  <p className="text-[12px] text-[#8899AA] truncate">{userEmail || 'No email'}</p>
                </div>
              </div>
            </div>
            <nav className="p-3 space-y-0.5">
              {navItems.map(({ href, label, icon: Icon, color }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all active:scale-[0.98] ${
                    isActive(href)
                      ? 'bg-white/10 text-white'
                      : 'text-[#8899AA] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
                    style={{ backgroundColor: isActive(href) ? `${color}20` : 'rgba(255,255,255,0.04)' }}
                  >
                    <Icon className="h-4.5 w-4.5" style={{ color: isActive(href) ? color : '#8899AA' }} />
                  </div>
                  <span className="text-[14px] font-medium flex-1">{label}</span>
                  <ChevronRight className="h-4 w-4 text-white/20" />
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-3 border-t border-white/[0.06]">
            {bottomItems.map(({ href, label, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all active:scale-[0.98] ${
                  isActive(href) ? 'bg-white/10 text-white' : 'text-[#8899AA] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                  <Icon className="h-4.5 w-4.5" style={{ color }} />
                </div>
                <span className="text-[14px] font-medium flex-1">{label}</span>
                <ChevronRight className="h-4 w-4 text-white/20" />
              </Link>
            ))}
            <button
              onClick={() => { setDrawerOpen(false); logOut(); }}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-[#FF5A6E] hover:bg-[#FF5A6E]/10 transition-all active:scale-[0.98]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0 bg-[#FF5A6E]/10">
                <LogOut className="h-4.5 w-4.5" />
              </div>
              <span className="text-[14px] font-medium flex-1">Sign Out</span>
              <ChevronRight className="h-4 w-4 text-[#FF5A6E]/30" />
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
