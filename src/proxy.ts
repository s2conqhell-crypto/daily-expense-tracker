import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  if (pathname === '/' || pathname === '') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname.startsWith('/_next') || pathname.startsWith('/icons') || pathname.startsWith('/manifest') || pathname.startsWith('/sw') || pathname === '/favicon.ico' || pathname.startsWith('/api')) {
    return response;
  }

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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseio.com https://*.googleapis.com https://*.gstatic.com https://accounts.google.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://*.googleapis.com https://accounts.google.com",
      "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://*.firebasestorage.googleapis.com https://lh3.googleusercontent.com https://graph.facebook.com https://*.googleusercontent.com",
      "font-src 'self' https://*.gstatic.com",
      "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://firebase.googleapis.com https://accounts.google.com https://apis.google.com wss://*.firebaseio.com",
      "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://apis.google.com",
      "manifest-src 'self' https://vercel.com https://vercel.live",
      "media-src 'self' https://*.firebasestorage.googleapis.com",
      "base-uri 'self'",
      "form-action 'self' https://accounts.google.com https://*.firebaseapp.com",
      "frame-ancestors 'none'",
      "worker-src 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join('; ')
  );

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
