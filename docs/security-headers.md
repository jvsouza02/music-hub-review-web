# Security headers

All application security response headers are defined in `src/lib/security/headers.ts` and applied by `src/proxy.ts`. Do not duplicate them in `next.config.ts`, route handlers, or individual pages. The reverse proxy/CDN must be configured not to weaken or replace this policy.

## Content Security Policy

The policy is nonce-based. `proxy.ts` creates a cryptographically random nonce for each request, forwards it as `x-nonce` and as part of the request CSP, and sets the CSP on the response. Next.js reads the request CSP and attaches the nonce to framework-generated scripts and styles.

- `default-src 'self'`: default source for resource types not given a more specific rule; same origin only.
- `base-uri 'self'`: prevents injected `<base>` elements from changing relative URL resolution to another origin.
- `object-src 'none'`: disables plugin content such as Flash or embedded objects.
- `frame-ancestors 'none'`: prevents this site from being embedded in a frame, mitigating clickjacking.
- `frame-src 'none'`: prevents this page from loading nested frames.
- `form-action 'self'`: restricts form submissions to the application's own origin.
- `script-src 'self' 'nonce-…' 'strict-dynamic'`: scripts must be same-origin or carry the request nonce; `strict-dynamic` propagates trust from nonce-authorized scripts in supporting browsers. `unsafe-eval` is added only in development for framework debugging.
- `style-src 'self' 'nonce-…'`: permits same-origin stylesheets and nonce-authorized inline styles without enabling `unsafe-inline`.
- `img-src 'self' data: blob:`: images may load from the app, data URLs, and blob URLs. Album covers should use `next/image`; remote image origins remain constrained by `next.config.ts` to Cover Art Archive.
- `font-src 'self' data:`: fonts are served locally or through data URLs. `next/font` self-hosts its output.
- `connect-src 'self'`: API and fetch connections stay on the app origin. Development additionally allows the local HMR WebSocket.
- `media-src 'self'`: media files are same-origin only until an explicit media provider is introduced.
- `worker-src 'self' blob:`: workers may be loaded from this origin or a blob URL.
- `manifest-src 'self'`: web app manifests must be same-origin.
- `upgrade-insecure-requests`: enabled only when `NODE_ENV=production` and `APP_ORIGIN` starts with `https://`, upgrading accidental HTTP subresource requests to HTTPS.

## Other headers

- `Strict-Transport-Security: max-age=31536000`: tells browsers that have received the header to use HTTPS for one year. It is emitted only when `NODE_ENV=production` and `APP_ORIGIN` starts with `https://`. Add `includeSubDomains` only after confirming every subdomain supports HTTPS; `preload` is intentionally omitted.
- `X-Content-Type-Options: nosniff`: prevents browsers from MIME-sniffing a response away from its declared content type.
- `Referrer-Policy: strict-origin-when-cross-origin`: sends the full referrer for same-origin navigation and only the origin for cross-origin requests.
- `Permissions-Policy`: disables camera, microphone, geolocation, payment and USB APIs because the MVP does not need them.
- `X-Frame-Options: DENY`: legacy clickjacking defense for browsers that do not fully support CSP `frame-ancestors`.

## Nonce and rendering trade-off

A fresh nonce must be generated per request. Therefore `src/app/layout.tsx` calls `connection()` to opt into request-time rendering. Nonce-based CSP makes routes dynamic and disables ordinary static prerendering/ISR for those routes; it can also reduce CDN cacheability. Revisit this trade-off before adding large public catalog pages. Do not reuse a nonce across requests.

In development only, `unsafe-eval` is added to `script-src` for React/Next debugging. It is never sent in production.
