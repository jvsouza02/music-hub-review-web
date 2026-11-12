import { Disc3 } from 'lucide-react';

import type { AlbumResponse } from '@/lib/api/generated/types.gen';

import { AlbumCover } from '@/components/media/album-cover';
import { RatingSummary } from '@/features/explore/components/rating-summary';

type AlbumCardProps = {
  album: AlbumResponse;
};

export function AlbumCard({ album }: AlbumCardProps) {
  const coverUrl = album.mbid
    ? `https://coverartarchive.org/release/${encodeURIComponent(album.mbid)}/front-250`
    : null;

  return (
    <article className="group min-w-0 overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
      <AlbumCover
        src={coverUrl}
        alt={`Capa do álbum ${album.title}`}
        className="rounded-xl"
        sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 220px"
      />

      <div className="px-1 pt-4">
        <h3
          className="line-clamp-2 min-h-10 font-heading text-sm font-bold leading-5"
          title={album.title}
        >
          {album.title}
        </h3>

        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Disc3 aria-hidden="true" className="size-3.5 shrink-0" />
          {album.total_tracks} {album.total_tracks === 1 ? 'faixa' : 'faixas'}
        </p>

        <p className="mt-1 truncate text-xs text-muted-foreground">
          Lançamento: {album.release_date || 'Não informado'}
        </p>

        <div className="mt-3 border-t border-border pt-3">
          <RatingSummary averageScore={album.average_score} reviewCount={album.review_count} />
        </div>
      </div>
    </article>
  );
}
