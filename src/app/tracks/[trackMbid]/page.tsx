import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { ArrowLeft, Music2 } from 'lucide-react';

import { ApiError } from '@/lib/api/api-error';

import { fetchTrackByMbid } from '@/features/tracks/api/server';
import { fetchReviewsByTrack } from '@/features/reviews/api/server';
import { fetchPublicUser } from '@/features/users/api/server';

import { ReviewForm } from '@/features/reviews/components/review-form';
import { ReviewList } from '@/features/reviews/components/review-list';

type TrackPageProps = {
  params: Promise<{
    trackMbid: string;
  }>;
};

function formatDuration(durationMs: number | null | undefined): string | null {
  if (durationMs == null) return null;

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function formatScore(score: number | null | undefined): string {
  if (score == null) return 'Sem avaliações';

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(score);
}

export default async function TrackDetailsPage({ params }: TrackPageProps) {
  const { trackMbid } = await params;

  if (!z.string().uuid().safeParse(trackMbid).success) {
    notFound();
  }

  let track;

  try {
    track = await fetchTrackByMbid(trackMbid);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  const reviewCount = track.review_count ?? 0;

  const reviews = track.id ? await fetchReviewsByTrack(track.id) : [];

  const uniqueUserIds = [...new Set(reviews.map((review) => review.user_id))];

  const authorEntries = await Promise.all(
    uniqueUserIds.map(async (userId) => {
      try {
        const user = await fetchPublicUser(userId);

        return [userId, user.username] as const;
      } catch {
        return [userId, 'Usuário indisponível'] as const;
      }
    }),
  );

  const authors = Object.fromEntries(authorEntries);

  const duration = formatDuration(track.duration_ms);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/explore"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Voltar à exploração
      </Link>

      <section className="mb-10 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:size-32">
            <Music2 aria-hidden="true" className="size-12 sm:size-16" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-2 text-sm font-medium text-primary">{track.artist_name}</p>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{track.title}</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              {track.album_title ?? 'Álbum não identificado'}
            </p>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {track.position !== null && track.position !== undefined && (
                <span>Faixa {track.position}</span>
              )}

              {duration && <span>Duração: {duration}</span>}
            </div>
          </div>

          <div className="shrink-0 rounded-xl bg-muted/50 p-4 text-center sm:min-w-36">
            <p className="text-2xl font-bold">{formatScore(track.average_score)}</p>

            <p className="mt-1 text-xs text-muted-foreground">Média da comunidade</p>

            <p className="mt-2 text-xs text-muted-foreground">
              {reviewCount} {reviewCount === 1 ? 'avaliação' : 'avaliações'}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
        <ReviewList reviews={reviews} authors={authors} totalCount={reviewCount} />

        <aside>
          <div className="lg:sticky lg:top-24">
            <ReviewForm trackMbid={track.mbid} />
          </div>
        </aside>
      </div>
    </main>
  );
}
