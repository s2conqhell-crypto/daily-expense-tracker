import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Redirect root to dashboard
  if (pathname === '/' || pathname === '') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Skip headers for static assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/icons') || pathname.startsWith('/manifest') || pathname.startsWith('/sw') || pathname === '/favicon.ico' || pathname.startsWith('/api')) {
    return response;
  }

  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()'
  );
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains'
  );
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseio.com https://*.googleapis.com https://*.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://*.googleapis.com",
      "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://*.firebasestorage.googleapis.com https://lh3.googleusercontent.com https://graph.facebook.com",
      "font-src 'self' https://*.gstatic.com",
      "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com wss://*.firebaseio.com",
      "frame-src 'self' https://*.firebaseapp.com",
      "manifest-src 'self'",
      "media-src 'self' https://*.firebasestorage.googleapis.com",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
