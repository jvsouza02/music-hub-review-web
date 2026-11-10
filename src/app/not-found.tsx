import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="max-w-md text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
          Erro 404
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Esta página não existe.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          O endereço pode estar incorreto ou o conteúdo foi movido.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground"
        >
          Voltar ao início
        </Link>
      </section>
    </main>
  );
}
