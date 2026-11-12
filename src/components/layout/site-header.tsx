import Link from 'next/link';
import { Disc3, Search } from 'lucide-react';

import { MobileNavigation } from '@/components/layout/mobile-navigation';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="relative mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-page">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline-offset-4"
          aria-label="Music Hub Review - página inicial"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-brand-cyan text-primary-foreground shadow-card">
            <Disc3 aria-hidden="true" className="size-6" />
          </span>

          <span className="text-sm font-bold tracking-tight sm:text-base">
            Music Hub <span className="font-normal text-muted-foreground">Review</span>
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-2 md:flex">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Início
          </Link>

          <Link
            href="/explore"
            className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Explorar
          </Link>

          <Link
            href="/#como-funciona"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Como funciona
          </Link>

          <Link
            href="/#sobre"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Sobre
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/explore#track-search"
            className="hidden h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground xl:inline-flex"
          >
            <Search aria-hidden="true" className="size-4" />
            Buscar faixas
          </Link>

          <ThemeToggle />

          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}
