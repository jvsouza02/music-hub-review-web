import { randomBytes } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { createSecurityHeaders } from '@/lib/security/headers';

export function proxy(request: NextRequest) {
  const nonce = randomBytes(16).toString('base64');
  const isProduction = process.env.NODE_ENV === 'production';
  const isHttpsProduction = isProduction && process.env.APP_ORIGIN?.startsWith('https://') === true;
  const securityHeaders = createSecurityHeaders(nonce, isProduction, isHttpsProduction);
  const contentSecurityPolicy = securityHeaders.get('Content-Security-Policy');

  if (!contentSecurityPolicy) {
    throw new Error('Content-Security-Policy header was not generated.');
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicy);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  securityHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
