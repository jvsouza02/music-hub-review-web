import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { connection } from 'next/server';
import type { ReactNode } from 'react';
import { Geist_Mono, Inter, Manrope } from 'next/font/google';

import './globals.css';

import { Providers } from './providers';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Music Hub Review',
    template: '%s | Music Hub Review',
  },
  description:
    'Descubra artistas e álbuns, registre suas avaliações e compartilhe sua relação com a música.',
  applicationName: 'Music Hub Review',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F4FA' },
    { media: '(prefers-color-scheme: dark)', color: '#101019' },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  // Nonce-based CSP requires request-time rendering.
  await connection();

  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${manrope.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers nonce={nonce}>
          <a
            href="#main-content"
            className="sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:not-sr-only focus:rounded-lg focus:bg-primary focus:px-5 focus:py-3 focus:text-primary-foreground focus:shadow-popover"
          >
            Pular para o conteúdo
          </a>

          <SiteHeader />

          <main id="main-content" className="min-h-[60vh]">
            {children}
          </main>

          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
