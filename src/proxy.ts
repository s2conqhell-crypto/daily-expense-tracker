import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = [
  '/dashboard',
  '/expenses',
  '/income',
  '/budgets',
  '/savings',
  '/analytics',
  '/calendar',
  '/reports',
  '/settings',
  '/profile',
  '/search',
];

const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/' || pathname === '') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

  if (pathname.startsWith('/_next') || pathname.startsWith('/icons') || pathname.startsWith('/manifest') || pathname.startsWith('/sw') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
