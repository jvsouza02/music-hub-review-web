import { Star } from 'lucide-react';

type RatingSummaryProps = {
  averageScore: number | null | undefined;
  reviewCount: number | null | undefined;
};

export function RatingSummary({ averageScore, reviewCount }: RatingSummaryProps) {
  const ratingLabel =
    averageScore === null || averageScore === undefined
      ? reviewCount !== null && reviewCount !== undefined && reviewCount > 0
        ? 'Média indisponível'
        : 'Sem avaliações'
      : new Intl.NumberFormat('pt-BR', {
          maximumFractionDigits: 1,
        }).format(averageScore);

  const reviewLabel =
    reviewCount === null || reviewCount === undefined
      ? 'Contagem indisponível'
      : `${new Intl.NumberFormat('pt-BR').format(reviewCount)} ${
          reviewCount === 1 ? 'avaliação' : 'avaliações'
        }`;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
      <span className="inline-flex items-center gap-1 font-semibold">
        {averageScore !== null && averageScore !== undefined ? (
          <Star aria-hidden="true" className="size-3.5 fill-amber-400 text-amber-400" />
        ) : null}

        {ratingLabel}
      </span>

      <span className="text-muted-foreground" aria-label={reviewLabel}>
        {reviewLabel}
      </span>
    </div>
  );
}
