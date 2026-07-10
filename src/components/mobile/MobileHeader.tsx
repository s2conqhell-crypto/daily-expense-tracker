'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Wallet, Bell, LayoutDashboard, TrendingDown, ArrowUpFromLine,
  Target, PiggyBank, Banknote, Repeat, Clock, BarChart3, FileText,
  Calendar, Search, Settings, LogOut, X, ChevronRight,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { ROUTES } from '@/constants';
import { getInitials } from '@/utils/helpers';
import { NotificationBell } from '@/components/shared/NotificationBell';

const navItems = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, color: '#7c5cff' },
  { href: ROUTES.EXPENSES, label: 'Expenses', icon: TrendingDown, color: '#ff5a7a' },
  { href: ROUTES.INCOME, label: 'Income', icon: ArrowUpFromLine, color: '#00d09c' },
  { href: ROUTES.BUDGETS, label: 'Budget', icon: Target, color: '#ffb020' },
  { href: ROUTES.SAVINGS, label: 'Savings', icon: PiggyBank, color: '#3b82f6' },
  { href: ROUTES.LOANS, label: 'Loans', icon: Banknote, color: '#ff5a7a' },
  { href: ROUTES.SUBSCRIPTIONS, label: 'Subscriptions', icon: Repeat, color: '#7c5cff' },
  { href: ROUTES.RECURRING, label: 'Recurring', icon: Clock, color: '#00d09c' },
  { href: ROUTES.REPORTS, label: 'Reports', icon: FileText, color: '#ffb020' },
  { href: ROUTES.ANALYTICS, label: 'Analytics', icon: BarChart3, color: '#3b82f6' },
  { href: ROUTES.CALENDAR, label: 'Calendar', icon: Calendar, color: '#7c5cff' },
  { href: ROUTES.SEARCH, label: 'Search', icon: Search, color: '#6b7b8d' },
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
        className="relative z-40 flex items-center justify-between bg-[#09090b] px-5"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)', height: 'calc(72px + env(safe-area-inset-top, 0px))' }}
      >
        <div className="flex items-center gap-3">
          <SheetTrigger asChild>
            <button
              className="touch-target flex h-11 w-11 items-center justify-center rounded-xl text-[#6b7b8d] hover:bg-white/5 active:scale-90 transition-all"
              aria-label="Open menu"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="19" y2="6" />
                <line x1="3" y1="11" x2="19" y2="11" />
                <line x1="3" y1="16" x2="19" y2="16" />
              </svg>
            </button>
          </SheetTrigger>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] gradient-primary shadow-lg shadow-[#7c5cff]/25">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <span className="text-[18px] font-bold tracking-tight text-white">ExpenseFlow</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <div className="touch-target flex h-11 w-11 items-center justify-center rounded-xl text-[#6b7b8d] hover:bg-white/5 transition-all">
            <NotificationBell />
          </div>
          <Link href={ROUTES.PROFILE}>
            <Avatar className="h-11 w-11 cursor-pointer ring-2 ring-[#7c5cff]/20 ring-offset-2 ring-offset-[#09090b] active:scale-95 transition-transform">
              <AvatarImage src={user?.photoURL || undefined} />
              <AvatarFallback className="text-[13px] font-semibold gradient-primary text-white">{initials}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="left"
          className="flex flex-col p-0 shadow-2xl shadow-black/40"
          style={{
            maxWidth: '320px',
            width: '80%',
            backgroundColor: 'rgba(22, 26, 39, 0.92)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '0 24px 24px 0',
          }}
        >
          <div className="flex-1 overflow-y-auto" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            <div className="p-5 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-[#7c5cff]/25">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[17px] font-bold tracking-tight text-white">ExpenseFlow</span>
                </div>
                <SheetClose asChild>
                  <button
                    className="touch-target flex h-10 w-10 items-center justify-center rounded-xl text-[#6b7b8d] hover:bg-white/5 active:scale-90 transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </SheetClose>
              </div>
              <div className="flex items-center gap-3.5">
                <Avatar className="h-14 w-14 ring-2 ring-[#7c5cff]/20">
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback className="text-[16px] font-bold gradient-primary text-white">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-[16px] font-bold text-white truncate">{userName}</p>
                  <p className="text-[12px] text-[#6b7b8d] truncate mt-0.5">{userEmail || 'No email'}</p>
                </div>
              </div>
            </div>
            <nav className="p-3 space-y-0.5">
              {navItems.map(({ href, label, icon: Icon, color }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-3.5 rounded-[14px] px-3.5 py-3 transition-all active:scale-[0.98] ${
                    isActive(href) ? 'bg-white/10 text-white' : 'text-[#6b7b8d] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-[12px] shrink-0"
                    style={{ backgroundColor: isActive(href) ? `${color}20` : 'rgba(255,255,255,0.04)' }}
                  >
                    <Icon className="h-[18px] w-[18px]" style={{ color: isActive(href) ? color : '#6b7b8d' }} />
                  </div>
                  <span className="text-[14px] font-medium flex-1">{label}</span>
                  <ChevronRight className="h-4 w-4 text-white/20" />
                </Link>
              ))}
            </nav>
          </div>
          <div className="shrink-0 p-3 border-t border-white/[0.06]" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
            <Link
              href={ROUTES.SETTINGS}
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3.5 rounded-[14px] px-3.5 py-3 transition-all active:scale-[0.98] ${
                isActive(ROUTES.SETTINGS) ? 'bg-white/10 text-white' : 'text-[#6b7b8d] hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] shrink-0 bg-white/5">
                <Settings className="h-[18px] w-[18px]" style={{ color: '#6b7b8d' }} />
              </div>
              <span className="text-[14px] font-medium flex-1">Settings</span>
              <ChevronRight className="h-4 w-4 text-white/20" />
            </Link>
            <button
              onClick={() => { setDrawerOpen(false); logOut(); }}
              className="flex w-full items-center gap-3.5 rounded-[14px] px-3.5 py-3 text-[#ff5a7a] hover:bg-[#ff5a7a]/10 transition-all active:scale-[0.98] mt-0.5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] shrink-0 bg-[#ff5a7a]/10">
                <LogOut className="h-[18px] w-[18px]" />
              </div>
              <span className="text-[14px] font-medium flex-1">Sign Out</span>
              <ChevronRight className="h-4 w-4 text-[#ff5a7a]/30" />
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
