import type { ReviewResponse } from '@/lib/api/generated/types.gen';

type ReviewListProps = {
  reviews: ReviewResponse[];
  authors: Record<string, string>;
  totalCount: number;
};

function formatScore(score: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(score);
}

function formatDate(value: string | null): string | null {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeZone: 'America/Fortaleza',
  }).format(date);
}

export function ReviewList({ reviews, authors, totalCount }: ReviewListProps) {
  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Avaliações da comunidade</h2>

        <p className="text-sm text-muted-foreground">
          {totalCount} {totalCount === 1 ? 'avaliação publicada' : 'avaliações publicadas'}
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="font-medium">
            {totalCount === 0
              ? 'Esta faixa ainda não possui avaliações.'
              : 'Nenhuma avaliação foi retornada.'}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Seja o primeiro a compartilhar sua opinião!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => {
            const author = authors[review.user_id] ?? 'Usuário indisponível';
            const date = formatDate(review.created_at);

            return (
              <article
                key={review.id}
                className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      aria-hidden="true"
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary"
                    >
                      {author.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{author}</p>

                      {date && <p className="mt-0.5 text-xs text-muted-foreground">{date}</p>}
                    </div>
                  </div>

                  <span
                    aria-label={`Nota ${formatScore(review.score)} de 5`}
                    className="shrink-0 rounded-lg bg-primary/10 px-3 py-1 text-sm font-semibold text-primary"
                  >
                    {formatScore(review.score)} / 5
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {review.body?.trim() ? (
                    <span className="whitespace-pre-wrap">{review.body}</span>
                  ) : (
                    <span className="italic">Avaliação sem comentário.</span>
                  )}
                </p>
              </article>
            );
          })}
        </div>
      )}

      {reviews.length > 0 && reviews.length < totalCount && (
        <p className="text-center text-xs text-muted-foreground">
          Exibindo {reviews.length} de {totalCount} avaliações.
        </p>
      )}
    </section>
  );
}
