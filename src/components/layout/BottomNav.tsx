'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ArrowUpFromLine, TrendingDown, Wallet, PiggyBank,
  BarChart3, Calendar, FileText, Settings, ChevronRight, LogOut, X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ROUTES } from '@/constants';

const mainNav = [
  { href: ROUTES.DASHBOARD, label: 'Home', icon: LayoutDashboard },
  { href: ROUTES.EXPENSES, label: 'Expenses', icon: TrendingDown },
  { href: ROUTES.INCOME, label: 'Income', icon: ArrowUpFromLine },
  { href: ROUTES.BUDGETS, label: 'Budgets', icon: Wallet },
];

const moreItems = [
  { href: ROUTES.SAVINGS, label: 'Savings', icon: PiggyBank },
  { href: ROUTES.ANALYTICS, label: 'Analytics', icon: BarChart3 },
  { href: ROUTES.CALENDAR, label: 'Calendar', icon: Calendar },
  { href: ROUTES.REPORTS, label: 'Reports', icon: FileText },
  { href: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const { logOut } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-center justify-around border-t border-white/[0.06] bg-[#0E1116]/95 backdrop-blur-2xl safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        {mainNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`touch-target flex-col gap-0.5 rounded-xl px-2 py-1 transition-colors relative ${
              isActive(href)
                ? 'text-white'
                : 'text-[#5A6B7D] hover:text-[#8899AA]'
            }`}
          >
            <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full transition-opacity ${
              isActive(href) ? 'bg-[#8B6FFF] opacity-100' : 'opacity-0'
            }`} />
            <Icon className={`h-[22px] w-[22px] ${isActive(href) ? 'drop-shadow-[0_0_8px_rgba(139,111,255,0.3)]' : ''}`} />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </Link>
        ))}
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger asChild>
            <button className="touch-target flex-col gap-0.5 rounded-xl px-2 py-1 text-[#5A6B7D] hover:text-[#8899AA] transition-colors relative">
              <div className="h-[22px] w-[22px] flex items-center justify-center">
                <div className="flex flex-col gap-[3px]">
                  <span className="block w-[4px] h-[4px] rounded-full bg-current" />
                  <span className="block w-[4px] h-[4px] rounded-full bg-current" />
                  <span className="block w-[4px] h-[4px] rounded-full bg-current" />
                </div>
              </div>
              <span className="text-[10px] font-medium leading-none">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-[#0E1116] border-t border-white/[0.06] rounded-t-2xl px-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] pt-4 shadow-2xl shadow-black/40">
            <SheetHeader className="mb-2">
              <SheetTitle className="flex items-center justify-between text-white px-1">
                <span className="text-base font-bold">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl text-[#8899AA] hover:text-white hover:bg-white/5 h-9 w-9 touch-target"
                  onClick={() => setMoreOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {moreItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={`touch-target flex-col gap-1.5 rounded-xl py-3 px-2 transition-all ${
                    isActive(href)
                      ? 'bg-white/10 text-white'
                      : 'bg-white/5 text-[#8899AA] hover:bg-white/10 hover:text-white'
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
