'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Receipt, TrendingUp, PiggyBank,
  Wallet, BarChart3, Calendar, FileText, Search, Settings,
  ChevronUp, X, LogOut, Repeat, Banknote, Clock,
} from 'lucide-react';
import { cn } from '@/utils/helpers';
import { ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';

const mainNav = [
  { href: ROUTES.DASHBOARD, label: 'Home', icon: LayoutDashboard },
  { href: ROUTES.EXPENSES, label: 'Expenses', icon: Receipt },
  { href: ROUTES.INCOME, label: 'Income', icon: TrendingUp },
  { href: ROUTES.BUDGETS, label: 'Budget', icon: Wallet },
  { href: ROUTES.SAVINGS, label: 'Savings', icon: PiggyBank },
];

const moreNav = [
  { href: ROUTES.ANALYTICS, label: 'Analytics', icon: BarChart3 },
  { href: ROUTES.CALENDAR, label: 'Calendar', icon: Calendar },
  { href: ROUTES.REPORTS, label: 'Reports', icon: FileText },
  { href: ROUTES.SUBSCRIPTIONS, label: 'Subscriptions', icon: Repeat },
  { href: ROUTES.LOANS, label: 'Loans', icon: Banknote },
  { href: ROUTES.RECURRING, label: 'Recurring', icon: Clock },
  { href: ROUTES.SEARCH, label: 'Search', icon: Search },
  { href: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const { logOut } = useAuth();

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-[#0E1116]/95 backdrop-blur-2xl md:hidden safe-area-bottom">
        <div className="flex items-center justify-around px-1 py-0.5">
          {mainNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[10px] font-medium transition-all duration-200 relative min-w-0 flex-1',
                  isActive ? 'text-[#8B6FFF]' : 'text-[#8899AA]'
                )}
              >
                <div className={cn(
                  'relative p-1.5 rounded-lg transition-all duration-200',
                  isActive && 'bg-[#8B6FFF]/15'
                )}>
                  <item.icon className={cn('h-5 w-5 transition-transform', isActive && 'scale-110')} />
                </div>
                <span className="text-[9px] leading-tight">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowMore(true)}
            className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[10px] font-medium text-[#8899AA] transition-all duration-200 min-w-0 flex-1"
          >
            <div className="p-1.5 rounded-lg">
              <ChevronUp className="h-5 w-5" />
            </div>
            <span className="text-[9px] leading-tight">More</span>
          </button>
        </div>
      </nav>

      {showMore && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMore(false)} />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t border-white/[0.06] bg-[#0E1116]/95 backdrop-blur-2xl p-5 pb-10 animate-slide-up safe-area-bottom">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold tracking-tight text-white">All Sections</h3>
              <button onClick={() => setShowMore(false)} className="p-2 rounded-xl hover:bg-white/5 transition-colors touch-target">
                <X className="h-5 w-5 text-[#8899AA]" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {moreNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-xl p-3 text-xs font-medium transition-all duration-200',
                      isActive ? 'bg-[#8B6FFF]/15 text-[#8B6FFF]' : 'hover:bg-white/5 text-[#8899AA]'
                    )}
                  >
                    <item.icon className={cn('h-6 w-6', isActive && 'text-[#8B6FFF]')} />
                    <span className="text-[10px] leading-tight text-center">{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <button onClick={logOut} className="flex w-full items-center justify-center gap-2 rounded-xl p-3 text-sm font-medium text-[#8899AA] hover:bg-[#FF5A6E]/10 hover:text-[#FF5A6E] transition-colors">
                <LogOut className="h-5 w-5" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
