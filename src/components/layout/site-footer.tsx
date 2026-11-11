import Link from 'next/link';
import { Disc3 } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-page py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold tracking-tight"
          >
            <Disc3 aria-hidden="true" className="size-5 text-primary" />
            Music Hub Review
          </Link>

          <p className="mt-2 max-w-md text-xs leading-6 text-muted-foreground">
            Um projeto independente feito para quem vive música.
          </p>
        </div>

        <nav
          aria-label="Links do rodapé"
          className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground"
        >
          <Link href="/" className="transition-colors hover:text-foreground">
            Início
          </Link>

          <Link href="/#como-funciona" className="transition-colors hover:text-foreground">
            Como funciona
          </Link>

          <Link href="/#sobre" className="transition-colors hover:text-foreground">
            Sobre
          </Link>
        </nav>

        <p className="text-xs text-muted-foreground sm:text-right">
          © {new Date().getFullYear()} Music Hub Review.
        </p>
      </div>
    </footer>
  );
}
