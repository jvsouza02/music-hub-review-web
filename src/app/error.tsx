'use client';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="max-w-md text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
          Erro inesperado
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Não foi possível carregar esta página.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Tente novamente. Se o problema continuar, volte mais tarde.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 min-h-11 rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground"
        >
          Tentar novamente
        </button>
      </section>
    </main>
  );
}
