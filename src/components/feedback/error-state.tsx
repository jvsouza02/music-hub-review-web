import { AlertCircle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Não foi possível carregar o conteúdo.',
  description = 'Ocorreu um problema ao buscar os dados. Tente novamente.',
  onRetry,
}: ErrorStateProps) {
  return (
    <section
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-14 text-center"
    >
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertCircle aria-hidden="true" className="size-7" />
      </div>

      <h2 className="font-heading text-xl font-bold tracking-tight">{title}</h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>

      {onRetry ? (
        <Button type="button" variant="outline" className="mt-6" onClick={onRetry}>
          <RefreshCw aria-hidden="true" />
          Tentar novamente
        </Button>
      ) : null}
    </section>
  );
}
