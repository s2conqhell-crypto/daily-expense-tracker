'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Search, Moon, Sun, LogOut,
  Menu, Wallet,
} from 'lucide-react';
import { Button, Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ROUTES } from '@/constants';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { getInitials } from '@/utils/helpers';
import { useIsMobile } from '@/hooks/useMediaQuery';

const navItems = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard' },
  { href: ROUTES.EXPENSES, label: 'Expenses' },
  { href: ROUTES.INCOME, label: 'Income' },
  { href: ROUTES.BUDGETS, label: 'Budgets' },
  { href: ROUTES.SAVINGS, label: 'Savings' },
  { href: ROUTES.ANALYTICS, label: 'Analytics' },
  { href: ROUTES.CALENDAR, label: 'Calendar' },
  { href: ROUTES.REPORTS, label: 'Reports' },
  { href: ROUTES.SETTINGS, label: 'Settings' },
];

export function Header() {
  const { user, userData, logOut } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>{!isMobile && <div className="h-16" />}
      <header className="fixed right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#0E1116] shadow-sm px-4 lg:px-6 transition-all duration-300"
        style={{ left: isMobile ? 0 : '240px' }}
      >
        <div className="flex items-center gap-3">
          {isMobile && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl text-[#8899AA] hover:text-white hover:bg-white/5">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] p-0 bg-[#0E1116] border-r border-white/[0.06]">
                <SheetHeader className="border-b border-white/[0.06] px-4 py-4">
                  <SheetTitle className="flex items-center gap-2 text-white">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#8B6FFF] to-[#6B4FF5]">
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold tracking-tight">ExpenseFlow</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 p-3">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#8899AA] hover:bg-white/5 hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          )}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B6FFF] to-[#6B4FF5] shadow-lg shadow-[#8B6FFF]/20 lg:hidden">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-white hidden sm:block">
              {typeof window !== 'undefined' && window.location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ')?.replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Dashboard'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Link href={ROUTES.SEARCH}>
            <Button variant="ghost" size="icon" className="rounded-xl text-[#8899AA] hover:text-white hover:bg-white/5">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl text-[#8899AA] hover:text-white hover:bg-white/5"
            onClick={toggleTheme}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <NotificationBell />

          <div className="flex items-center gap-2 pl-2 ml-1 border-l border-white/[0.06]">
            <Link href={ROUTES.PROFILE}>
              <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-[#8B6FFF]/20 hover:ring-[#8B6FFF]/40 transition-all duration-200">
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback className="text-xs font-medium bg-[#8B6FFF]/10 text-[#8B6FFF]">{getInitials(userData?.name || user?.displayName || 'U')}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="hidden md:block">
              <p className="text-sm font-medium leading-tight text-white">{userData?.name || user?.displayName || 'User'}</p>
              <p className="text-xs text-[#8899AA]">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-xl text-[#8899AA] hover:text-white hover:bg-white/5 ml-1" onClick={logOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
