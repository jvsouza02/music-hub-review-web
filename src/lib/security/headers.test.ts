import { describe, expect, it } from 'vitest';
import { buildContentSecurityPolicy, createSecurityHeaders } from './headers';

describe('security headers', () => {
  it('creates a nonce-based CSP without unsafe-inline', () => {
    const policy = buildContentSecurityPolicy('test-nonce', true, true);

    expect(policy).toContain("script-src 'self' 'nonce-test-nonce' 'strict-dynamic'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).not.toContain("'unsafe-inline'");
  });

  it('enables unsafe-eval only in development', () => {
    const developmentPolicy = buildContentSecurityPolicy('dev-nonce', false, false);
    const productionPolicy = buildContentSecurityPolicy('prod-nonce', true, true);

    expect(developmentPolicy).toContain("'unsafe-eval'");
    expect(productionPolicy).not.toContain("'unsafe-eval'");
  });

  it('enables HSTS and insecure request upgrades only for HTTPS production', () => {
    const developmentHeaders = createSecurityHeaders('dev-nonce', false, false);
    const httpProductionHeaders = createSecurityHeaders('http-nonce', true, false);
    const httpsProductionHeaders = createSecurityHeaders('https-nonce', true, true);

    expect(developmentHeaders.get('Strict-Transport-Security')).toBeNull();
    expect(httpProductionHeaders.get('Strict-Transport-Security')).toBeNull();
    expect(httpProductionHeaders.get('Content-Security-Policy')).not.toContain(
      'upgrade-insecure-requests',
    );
    expect(httpsProductionHeaders.get('Strict-Transport-Security')).toBe('max-age=31536000');
    expect(httpsProductionHeaders.get('Content-Security-Policy')).toContain(
      'upgrade-insecure-requests',
    );
  });

  it('always emits the baseline response headers', () => {
    const headers = createSecurityHeaders('test-nonce', false, false);

    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headers.get('Permissions-Policy')).toContain('camera=()');
    expect(headers.get('X-Frame-Options')).toBe('DENY');
  });
});
