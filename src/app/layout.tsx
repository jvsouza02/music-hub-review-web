import type { Metadata, Viewport } from 'next';
import { connection } from 'next/server';
import type { ReactNode } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from "./providers";

const geistSans = Geist({
  variable: '--font-geist-sans',
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
    { media: '(prefers-color-scheme: light)', color: '#f5f5f0' },
    { media: '(prefers-color-scheme: dark)', color: '#10120f' },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  // Nonce-based CSP requires request-time rendering so each response gets a fresh nonce.
  await connection();

  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
