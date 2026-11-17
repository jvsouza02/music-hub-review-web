import { Mic2 } from 'lucide-react';

import type { ArtistResponse } from '@/lib/api/generated/types.gen';
import type { ArtistImageInfo } from '@/lib/media/artist-images.server';

import { ArtistImage } from '@/components/media/artist-image';
import { RatingSummary } from '@/features/explore/components/rating-summary';

type ArtistCardProps = {
  artist: ArtistResponse;
  image?: ArtistImageInfo | null;
};

export function ArtistCard({ artist, image = null }: ArtistCardProps) {
  return (
    <article className="flex min-w-0 items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
      <ArtistImage name={artist.name} image={image} />

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-heading text-base font-bold">
          {artist.name}
        </h3>

        <p className="mt-1 truncate text-xs text-muted-foreground">
          {artist.country ?? artist.disambiguation ?? 'Artista'}
        </p>

        <div className="mt-3">
          <RatingSummary
            averageScore={artist.average_score}
            reviewCount={artist.review_count}
          />
        </div>
      </div>

      <Mic2
        aria-hidden="true"
        className="mt-1 size-4 shrink-0 text-muted-foreground"
      />
    </article>
  );
}