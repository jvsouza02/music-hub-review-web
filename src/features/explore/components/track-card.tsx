import { Clock3, Music2 } from 'lucide-react';

import type { TrackResponse } from '@/lib/api/generated/types.gen';

import { RatingSummary } from '@/features/explore/components/rating-summary';

type TrackCardProps = {
  track: TrackResponse;
};

function formatDuration(durationMs: number | null): string {
  if (durationMs === null) {
    return 'Duração indisponível';
  }

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function TrackCard({ track }: TrackCardProps) {
  return (
    <article className="flex min-w-0 items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card transition-colors hover:border-primary/40">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-cyan/10 text-brand-cyan">
        <Music2 aria-hidden="true" className="size-5" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold">{track.title}</h3>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>Faixa {track.position}</span>

          <span className="inline-flex items-center gap-1">
            <Clock3 aria-hidden="true" className="size-3" />
            {formatDuration(track.duration_ms)}
          </span>
        </div>
      </div>

      <div className="shrink-0">
        <RatingSummary averageScore={track.average_score} reviewCount={track.review_count} />
      </div>
    </article>
  );
}
