'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Receipt, TrendingUp, PiggyBank,
  BarChart3, Calendar, FileText, Settings, Search,
  Wallet, LogOut, ArrowUpRight, Repeat, Banknote, Clock,
} from 'lucide-react';
import { cn } from '@/utils/helpers';
import { Avatar, AvatarFallback } from '@/components/ui';
import { ROUTES } from '@/constants';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/utils/helpers';
import { motion } from 'framer-motion';

const navTop = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.EXPENSES, label: 'Expenses', icon: Receipt },
  { href: ROUTES.INCOME, label: 'Income', icon: TrendingUp },
  { href: ROUTES.BUDGETS, label: 'Budgets', icon: Wallet },
  { href: ROUTES.SAVINGS, label: 'Savings', icon: PiggyBank },
  { href: ROUTES.SUBSCRIPTIONS, label: 'Subscriptions', icon: Repeat },
  { href: ROUTES.LOANS, label: 'Loans / EMI', icon: Banknote },
  { href: ROUTES.RECURRING, label: 'Recurring', icon: Clock },
];

const navBottom = [
  { href: ROUTES.ANALYTICS, label: 'Analytics', icon: BarChart3 },
  { href: ROUTES.CALENDAR, label: 'Calendar', icon: Calendar },
  { href: ROUTES.REPORTS, label: 'Reports', icon: FileText },
  { href: ROUTES.SEARCH, label: 'Search', icon: Search },
  { href: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { user, userData, logOut } = useAuth();

  if (isMobile) return null;

  const NavItem = ({ item }: { item: { href: string; label: string; icon: React.ComponentType<{ className?: string }> } }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        className={cn(
          'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group',
          isActive
            ? 'text-white'
            : 'text-[#8899AA] hover:text-white'
        )}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-[#8B6FFF]"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <div className={cn(
          'flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200',
          isActive ? 'bg-[#8B6FFF]/15' : 'group-hover:bg-white/5'
        )}>
          <item.icon className={cn('h-4 w-4', isActive ? 'text-[#8B6FFF]' : 'text-[#8899AA] group-hover:text-white')} />
        </div>
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-30 flex w-[232px] flex-col border-r border-white/[0.06] bg-[#0E1116] shadow-xl shadow-black/20">
      <div className="flex items-center px-4 pt-5 pb-4">
        <Link href={ROUTES.DASHBOARD} className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B6FFF] to-[#6B4FF5] shadow-lg shadow-[#8B6FFF]/20">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white">ExpenseFlow</span>
            <p className="text-[10px] text-[#8899AA] leading-none">Finance Tracker</p>
          </div>
        </Link>
      </div>

      <div className="px-2.5 mb-2">
        <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#5A6B7D]">Main</p>
        <nav className="space-y-0.5">
          {navTop.map((item) => <NavItem key={item.href} item={item} />)}
        </nav>
      </div>

      <div className="px-2.5 mb-2">
        <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#5A6B7D]">Insights</p>
        <nav className="space-y-0.5">
          {navBottom.map((item) => <NavItem key={item.href} item={item} />)}
        </nav>
      </div>

      <div className="flex-1" />

      <div className="mx-3 mb-3 p-3 rounded-xl bg-[#141822] border border-white/[0.08]">
        <Link href={ROUTES.PROFILE} className="flex items-center gap-3 group">
          <Avatar className="h-9 w-9 ring-2 ring-[#8B6FFF]/20 group-hover:ring-[#8B6FFF]/40 transition-all">
            <AvatarFallback className="text-xs font-semibold bg-[#8B6FFF]/10 text-[#8B6FFF]">
              {getInitials(userData?.name || user?.displayName || 'U')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{userData?.name || user?.displayName || 'User'}</p>
            <p className="text-[10px] text-[#8899AA] truncate">{user?.email || ''}</p>
          </div>
          <div className="h-6 w-6 rounded-lg bg-[#8B6FFF]/10 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="h-3 w-3 text-[#8B6FFF]" />
          </div>
        </Link>
      </div>

      <button
        onClick={logOut}
        className="mx-3 mb-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#8899AA] hover:bg-[#FF5A6E]/10 hover:text-[#FF5A6E] transition-all duration-200 group"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg group-hover:bg-[#FF5A6E]/10 transition-colors">
          <LogOut className="h-4 w-4" />
        </div>
        <span>Logout</span>
      </button>
    </aside>
  );
}
