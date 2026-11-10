import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('home page renders with the expected security headers', async ({ page }) => {
  const response = await page.goto('/');

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Cada álbum tem uma história.',
  );

  const responseHeaders = response ? await response.allHeaders() : {};
  const contentSecurityPolicy = responseHeaders['content-security-policy'] ?? '';

  expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
  expect(contentSecurityPolicy).toMatch(/'nonce-[^']+'/);
  expect(responseHeaders['x-content-type-options']).toBe('nosniff');
  expect(responseHeaders['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(responseHeaders['permissions-policy']).toContain('camera=()');
});

test('home page has no automated WCAG 2.2 AA violations', async ({ page }) => {
  await page.goto('/');

  const accessibilityResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  expect(accessibilityResults.violations).toEqual([]);
});
