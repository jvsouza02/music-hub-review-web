import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-border py-6">
          <Link href="/" className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-xl bg-accent text-sm font-black tracking-tight text-accent-foreground"
            >
              mh
            </span>
            <span className="text-sm font-semibold tracking-tight sm:text-base">
              music hub <span className="text-muted-foreground">review</span>
            </span>
          </Link>
          <span className="hidden text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase sm:block">
            Seu diário musical
          </span>
        </header>

        <section className="flex flex-1 items-center py-14 sm:py-20" aria-labelledby="hero-title">
          <div className="relative isolate w-full overflow-hidden rounded-4xl border border-border bg-surface px-6 py-12 shadow-[0_24px_80px_-48px_rgba(20,25,15,0.28)] sm:px-12 sm:py-16 lg:px-16 lg:py-20">
            <div
              aria-hidden="true"
              className="absolute -top-28 -right-20 -z-10 size-80 rounded-full bg-accent/25 blur-3xl"
            />
            <div className="max-w-4xl">
              <p className="mb-6 text-xs font-bold tracking-[0.24em] text-muted-foreground uppercase">
                Música para ouvir. Histórias para guardar.
              </p>
              <h1
                id="hero-title"
                className="max-w-4xl text-5xl leading-[1.04] font-semibold tracking-[-0.055em] sm:text-6xl lg:text-7xl"
              >
                Cada álbum tem uma história.{' '}
                <span className="decoration-accent decoration-[0.18em] underline underline-offset-4">
                  Qual é a sua?
                </span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                Um espaço para descobrir artistas, avaliar faixas e álbuns e registrar o que cada
                música significa para você — tudo em um só lugar.
              </p>
              <a
                href="#sobre"
                className="mt-10 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground transition-transform hover:-translate-y-0.5 focus-visible:outline-offset-4"
              >
                Conheça o projeto
                <span aria-hidden="true">↘</span>
              </a>
            </div>

            <div className="mt-16 grid gap-3 border-t border-border pt-6 sm:grid-cols-3 sm:gap-6">
              <div>
                <p className="text-sm font-semibold">Descubra</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Explore artistas, álbuns e faixas.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold">Avalie</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Dê notas e escreva suas reviews.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold">Compartilhe</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Encontre pessoas com gosto musical parecido.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="sobre"
          className="grid gap-5 border-t border-border py-10 sm:grid-cols-[1fr_2fr] sm:py-12"
        >
          <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
            Sobre o Music Hub
          </p>
          <p className="max-w-3xl text-lg leading-8 tracking-tight sm:text-xl">
            Mais do que dar estrelas: construir um histórico pessoal de descobertas, opiniões e
            conexões através da música.
          </p>
        </section>

        <footer className="flex flex-col gap-2 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Music Hub Review</span>
          <span>Um projeto independente feito para quem vive música.</span>
        </footer>
      </div>
    </main>
  );
}
