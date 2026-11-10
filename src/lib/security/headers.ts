/**
 * Centralizes response security headers. Keep CSP generation here so Proxy
 * and automated tests use the same policy.
 */
export function buildContentSecurityPolicy(
  nonce: string,
  isProduction: boolean,
  isHttpsProduction: boolean,
): string {
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "form-action 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isProduction ? '' : " 'unsafe-eval'"}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${isProduction ? '' : ' ws://localhost:3000 ws://127.0.0.1:3000'}`,
    "media-src 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ];

  if (isHttpsProduction) {
    directives.push('upgrade-insecure-requests');
  }

  return directives.join('; ');
}

export function createSecurityHeaders(
  nonce: string,
  isProduction: boolean,
  isHttpsProduction: boolean,
): Headers {
  const headers = new Headers({
    'Content-Security-Policy': buildContentSecurityPolicy(nonce, isProduction, isHttpsProduction),
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
    ].join(', '),
    'X-Frame-Options': 'DENY',
  });

  if (isHttpsProduction) {
    headers.set('Strict-Transport-Security', 'max-age=31536000');
  }

  return headers;
}
