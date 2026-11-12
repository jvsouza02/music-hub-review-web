import { Mic2 } from 'lucide-react';

import type { ArtistResponse } from '@/lib/api/generated/types.gen';

import { RatingSummary } from '@/features/explore/components/rating-summary';

type ArtistCardProps = {
  artist: ArtistResponse;
};

export function ArtistCard({ artist }: ArtistCardProps) {
  const initials = artist.name.trim().charAt(0).toUpperCase() || '?';

  return (
    <article className="flex min-w-0 items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
      <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-brand-cyan/15 font-heading text-xl font-bold text-primary">
        <span aria-hidden="true">{initials}</span>
        <span className="sr-only">Artista: {artist.name}</span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-heading text-base font-bold">{artist.name}</h3>

        <p className="mt-1 truncate text-xs text-muted-foreground">
          {artist.country ?? artist.disambiguation ?? 'Artista'}
        </p>

        <div className="mt-3">
          <RatingSummary averageScore={artist.average_score} reviewCount={artist.review_count} />
        </div>
      </div>

      <Mic2 aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground" />
    </article>
  );
}
