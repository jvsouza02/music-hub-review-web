type LoadingSkeletonProps = {
  count?: number;
};

export function LoadingSkeleton({ count = 4 }: LoadingSkeletonProps) {
  const safeCount = Math.min(12, Math.max(1, Math.floor(count)));

  return (
    <div role="status" aria-label="Carregando conteúdo">
      <span className="sr-only">Carregando conteúdo...</span>

      <div aria-hidden="true" className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: safeCount }, (_, index) => (
          <div key={index} className="space-y-3">
            <div className="aspect-square animate-pulse rounded-xl bg-muted" />

            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />

            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
