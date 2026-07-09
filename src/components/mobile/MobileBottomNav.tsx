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
  { href: ROUTES.DASHBOARD, label: 'Home', icon: LayoutDashboard, activeColor: '#8B6FFF' },
  { href: ROUTES.EXPENSES, label: 'Expenses', icon: TrendingDown, activeColor: '#FF5A6E' },
  { href: ROUTES.INCOME, label: 'Income', icon: ArrowUpFromLine, activeColor: '#00D09C' },
  { href: ROUTES.BUDGETS, label: 'Budget', icon: Wallet, activeColor: '#FBBF24' },
];

const moreItems = [
  { href: ROUTES.SAVINGS, label: 'Savings', icon: PiggyBank, color: '#3B82F6' },
  { href: ROUTES.SUBSCRIPTIONS, label: 'Subscriptions', icon: Calendar, color: '#8B6FFF' },
  { href: ROUTES.LOANS, label: 'Loans', icon: Wallet, color: '#FF5A6E' },
  { href: ROUTES.RECURRING, label: 'Recurring', icon: Calendar, color: '#00D09C' },
  { href: ROUTES.ANALYTICS, label: 'Analytics', icon: BarChart3, color: '#FBBF24' },
  { href: ROUTES.CALENDAR, label: 'Calendar', icon: Calendar, color: '#3B82F6' },
  { href: ROUTES.REPORTS, label: 'Reports', icon: FileText, color: '#8B6FFF' },
  { href: ROUTES.SETTINGS, label: 'Settings', icon: Settings, color: '#8899AA' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { logOut } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex items-start justify-evenly bg-[#0A0C10]/92 backdrop-blur-2xl border-t border-white/[0.06] shadow-2xl shadow-black/30"
        style={{ height: 'calc(90px + env(safe-area-inset-bottom, 0px))', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
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
                <div className={`flex items-center justify-center h-7 w-7 mb-0.5 rounded-xl transition-all ${active ? '' : ''}`}>
                  <Icon
                    className="h-[22px] w-[22px] transition-all"
                    style={{ color: active ? activeColor : '#5A6B7D' }}
                  />
                </div>
                <span
                  className="text-[11px] font-semibold text-center transition-all leading-none"
                  style={{ color: active ? activeColor : '#5A6B7D' }}
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
                <span className="block w-[5px] h-[5px] rounded-full bg-[#5A6B7D]" />
                <span className="block w-[5px] h-[5px] rounded-full bg-[#5A6B7D]" />
                <span className="block w-[5px] h-[5px] rounded-full bg-[#5A6B7D]" />
              </div>
            </div>
            <span className="text-[11px] font-semibold text-center text-[#5A6B7D] leading-none">More</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="bg-[#0A0C10] border-t border-white/[0.06] rounded-t-3xl px-4 pt-5 pb-0 shadow-2xl shadow-black/40" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}18` }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <span className="text-[10px] font-medium text-center leading-tight text-[#8899AA]">{label}</span>
              </Link>
            ))}
          </div>
          <button
            onClick={() => { setMoreOpen(false); logOut(); }}
            className="touch-target w-full flex items-center justify-center gap-2 rounded-2xl bg-[#FF5A6E]/10 py-3.5 mb-2 text-sm font-semibold text-[#FF5A6E] hover:bg-[#FF5A6E]/20 transition-all active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </SheetContent>
      </Sheet>
    </>
  );
}
