'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, TrendingDown, ArrowUpFromLine, Wallet,
  PiggyBank, BarChart3, Calendar, FileText, Settings, LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ROUTES } from '@/constants';

const mainNav = [
  { href: ROUTES.DASHBOARD, label: 'Home', icon: LayoutDashboard, activeColor: '#7c5cff' },
  { href: ROUTES.EXPENSES, label: 'Expenses', icon: TrendingDown, activeColor: '#ff5a7a' },
  { href: ROUTES.INCOME, label: 'Income', icon: ArrowUpFromLine, activeColor: '#00d09c' },
  { href: ROUTES.BUDGETS, label: 'Budget', icon: Wallet, activeColor: '#ffb020' },
];

const moreItems = [
  { href: ROUTES.SAVINGS, label: 'Savings', icon: PiggyBank, color: '#3b82f6' },
  { href: ROUTES.SUBSCRIPTIONS, label: 'Subscriptions', icon: Calendar, color: '#7c5cff' },
  { href: ROUTES.LOANS, label: 'Loans', icon: Wallet, color: '#ff5a7a' },
  { href: ROUTES.RECURRING, label: 'Recurring', icon: Calendar, color: '#00d09c' },
  { href: ROUTES.ANALYTICS, label: 'Analytics', icon: BarChart3, color: '#ffb020' },
  { href: ROUTES.CALENDAR, label: 'Calendar', icon: Calendar, color: '#7c5cff' },
  { href: ROUTES.REPORTS, label: 'Reports', icon: FileText, color: '#ffb020' },
  { href: ROUTES.SETTINGS, label: 'Settings', icon: Settings, color: '#6b7b8d' },
  { href: ROUTES.PROFILE, label: 'Profile', icon: Wallet, color: '#00d09c' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { logOut } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex items-start justify-evenly shadow-2xl shadow-black/30"
        style={{
          height: 'calc(90px + env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          backgroundColor: 'rgba(9, 9, 11, 0.92)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div className="flex w-full max-w-lg items-center justify-evenly h-full pt-2">
          {mainNav.map(({ href, label, icon: Icon, activeColor }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="touch-target flex-col gap-0.5 rounded-2xl px-4 py-1 transition-all relative min-w-[56px] active:scale-95"
              >
                <div className="flex items-center justify-center h-7 w-7 mb-0.5">
                  <Icon
                    className="h-[22px] w-[22px] transition-all"
                    style={{ color: active ? activeColor : '#6b7b8d' }}
                  />
                </div>
                <span
                  className="text-[11px] font-semibold text-center transition-all leading-none"
                  style={{ color: active ? activeColor : '#6b7b8d' }}
                >
                  {label}
                </span>
                {active && (
                  <span
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full"
                    style={{ backgroundColor: activeColor }}
                  />
                )}
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className="touch-target flex-col gap-0.5 rounded-2xl px-4 py-1 transition-all min-w-[56px] active:scale-95"
          >
            <div className="flex items-center justify-center h-7 w-7 mb-0.5">
              <div className="flex flex-col gap-[3px]">
                <span className="block w-[5px] h-[5px] rounded-full bg-[#6b7b8d]" />
                <span className="block w-[5px] h-[5px] rounded-full bg-[#6b7b8d]" />
                <span className="block w-[5px] h-[5px] rounded-full bg-[#6b7b8d]" />
              </div>
            </div>
            <span className="text-[11px] font-semibold text-center text-[#6b7b8d] leading-none">More</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          className="px-4 pt-5 shadow-2xl shadow-black/40"
          style={{
            backgroundColor: 'rgba(9, 9, 11, 0.95)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '28px 28px 0 0',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
          }}
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-[17px] font-bold text-white text-center">More</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {moreItems.map(({ href, label, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMoreOpen(false)}
                className={`touch-target flex-col gap-2 rounded-2xl py-4 px-1 transition-all active:scale-95 ${
                  isActive(href) ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl mx-auto" style={{ backgroundColor: `${color}18` }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <span className="text-[10px] font-medium text-center leading-tight text-[#6b7b8d]">{label}</span>
              </Link>
            ))}
          </div>
          <button
            onClick={() => { setMoreOpen(false); logOut(); }}
            className="touch-target w-full flex items-center justify-center gap-2 rounded-2xl bg-[#ff5a7a]/10 py-3.5 mb-2 text-sm font-semibold text-[#ff5a7a] hover:bg-[#ff5a7a]/20 transition-all active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </SheetContent>
      </Sheet>
    </>
  );
}
