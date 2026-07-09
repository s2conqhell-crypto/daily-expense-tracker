'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, TrendingDown, ArrowUpFromLine, Wallet,
  PiggyBank, BarChart3, Calendar, FileText, Settings, LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ROUTES } from '@/constants';

const mainNav = [
  { href: ROUTES.DASHBOARD, label: 'Home', icon: LayoutDashboard },
  { href: ROUTES.EXPENSES, label: 'Expenses', icon: TrendingDown },
  { href: ROUTES.INCOME, label: 'Income', icon: ArrowUpFromLine },
  { href: ROUTES.BUDGETS, label: 'Budget', icon: Wallet },
];

const moreItems = [
  { href: ROUTES.SAVINGS, label: 'Savings', icon: PiggyBank },
  { href: ROUTES.SUBSCRIPTIONS, label: 'Subscriptions', icon: Calendar },
  { href: ROUTES.LOANS, label: 'Loans', icon: Wallet },
  { href: ROUTES.RECURRING, label: 'Recurring', icon: Calendar },
  { href: ROUTES.ANALYTICS, label: 'Analytics', icon: BarChart3 },
  { href: ROUTES.CALENDAR, label: 'Calendar', icon: Calendar },
  { href: ROUTES.REPORTS, label: 'Reports', icon: FileText },
  { href: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { logOut } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <nav className="fixed bottom-3 left-3 right-3 z-50 flex h-14 items-center justify-evenly rounded-2xl border border-white/[0.08] bg-[#0E1116]/95 backdrop-blur-2xl safe-area-bottom shadow-lg shadow-black/30">
        {mainNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`touch-target flex-col gap-0.5 rounded-xl px-3 py-1 transition-colors relative ${
              isActive(href) ? 'text-white' : 'text-[#5A6B7D] hover:text-[#8899AA]'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive(href) ? 'text-[#8B6FFF]' : ''}`} />
            <span className="text-[9px] font-medium leading-none">{label}</span>
          </Link>
        ))}
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger asChild>
            <button className={`touch-target flex-col gap-0.5 rounded-xl px-3 py-1 text-[#5A6B7D] hover:text-[#8899AA] transition-colors`}>
              <div className="h-5 w-5 flex items-center justify-center">
                <div className="flex flex-col gap-[3px]">
                  <span className="block w-[4px] h-[4px] rounded-full bg-current" />
                  <span className="block w-[4px] h-[4px] rounded-full bg-current" />
                  <span className="block w-[4px] h-[4px] rounded-full bg-current" />
                </div>
              </div>
              <span className="text-[9px] font-medium leading-none">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-[#0E1116] border-t border-white/[0.06] rounded-t-2xl px-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] pt-4 shadow-2xl shadow-black/40">
            <SheetHeader className="mb-2">
              <SheetTitle className="text-white text-center text-base font-bold">More</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {moreItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={`touch-target flex-col gap-1.5 rounded-xl py-3 px-2 transition-all ${
                    isActive(href) ? 'bg-white/10 text-white' : 'bg-white/5 text-[#8899AA] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[11px] font-medium">{label}</span>
                </Link>
              ))}
            </div>
            <button
              onClick={() => { setMoreOpen(false); logOut(); }}
              className="touch-target w-full gap-3 rounded-xl bg-[#FF5A6E]/10 py-3 text-sm font-medium text-[#FF5A6E] hover:bg-[#FF5A6E]/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </SheetContent>
        </Sheet>
      </nav>
    </>
  );
}
