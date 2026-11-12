import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type CatalogPaginationProps = {
  label: string;
  currentPage: number;
  previousHref?: string;
  nextHref?: string;
};

export function CatalogPagination({
  label,
  currentPage,
  previousHref,
  nextHref,
}: CatalogPaginationProps) {
  if (!previousHref && !nextHref) {
    return null;
  }

  return (
    <nav
      aria-label={`Paginação de ${label}`}
      className="flex items-center justify-between gap-4 border-t border-border pt-5"
    >
      {previousHref ? (
        <Link
          href={previousHref}
          rel="prev"
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-offset-4"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Anterior
        </Link>
      ) : (
        <span />
      )}

      <span className="text-xs text-muted-foreground">Página {currentPage}</span>

      {nextHref ? (
        <Link
          href={nextHref}
          rel="next"
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-offset-4"
        >
          Próxima
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      ) : null}
    </nav>
  );
}
