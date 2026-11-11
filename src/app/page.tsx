import Link from 'next/link';
import { ArrowDownRight, Compass, Star, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-page">
      {/* Hero */}
      <section aria-labelledby="hero-title" className="py-12 sm:py-16 lg:py-20">
        <div className="relative isolate overflow-hidden rounded-4xl border border-border bg-card px-6 py-12 shadow-card sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 -right-24 -z-10 size-96 rounded-full bg-primary/20 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -left-20 -z-10 size-96 rounded-full bg-brand-cyan/15 blur-3xl"
          />

          <div className="max-w-4xl">
            <p className="mb-6 text-xs font-bold tracking-[0.24em] text-muted-foreground uppercase">
              Música para ouvir. Histórias para guardar.
            </p>

            <h1
              id="hero-title"
              className="max-w-4xl font-heading text-4xl leading-[1.08] font-extrabold tracking-[-0.055em] sm:text-6xl lg:text-7xl"
            >
              Cada álbum tem uma história.{' '}
              <span className="bg-linear-to-r from-primary to-brand-cyan bg-clip-text text-transparent">
                Qual é a sua?
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              Um espaço para descobrir artistas, avaliar faixas e álbuns e registrar o que cada
              música significa para você — tudo em um só lugar.
            </p>

            <Link
              href="#como-funciona"
              className="mt-10 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-offset-4"
            >
              Conheça o projeto
              <ArrowDownRight aria-hidden="true" className="size-4" />
            </Link>
          </div>

          <div className="mt-16 grid gap-5 border-t border-border pt-8 sm:grid-cols-3 sm:gap-8">
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

      {/* Como funciona */}
      <section
        id="como-funciona"
        aria-labelledby="features-title"
        className="scroll-mt-28 py-section"
      >
        <div className="mb-9 max-w-2xl">
          <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
            Sua experiência musical
          </p>

          <h2
            id="features-title"
            className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Sua música, suas descobertas.
          </h2>

          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Organize suas experiências musicais e transforme suas descobertas em um histórico que
            tenha a sua identidade.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
            <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Compass aria-hidden="true" className="size-6" />
            </div>

            <h3 className="font-heading text-lg font-bold">Descubra</h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Explore artistas, conheça novos álbuns e encontre músicas que combinam com seus
              interesses.
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
            <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-brand-cyan/10 text-brand-cyan">
              <Star aria-hidden="true" className="size-6" />
            </div>

            <h3 className="font-heading text-lg font-bold">Avalie</h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Registre suas notas, escreva reviews e construa seu próprio histórico musical.
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
            <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users aria-hidden="true" className="size-6" />
            </div>

            <h3 className="font-heading text-lg font-bold">Compartilhe</h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Conheça pessoas, acompanhe avaliações e compartilhe suas experiências com música.
            </p>
          </article>
        </div>
      </section>

      {/* Sobre */}
      <section
        id="sobre"
        aria-labelledby="about-title"
        className="scroll-mt-28 grid gap-5 border-t border-border py-12 sm:grid-cols-[1fr_2fr] sm:py-16"
      >
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
            Sobre o Music Hub
          </p>

          <h2 id="about-title" className="mt-3 font-heading text-2xl font-bold tracking-tight">
            Mais do que dar estrelas.
          </h2>
        </div>

        <p className="max-w-3xl text-lg leading-8 tracking-tight text-muted-foreground sm:text-xl">
          Construir um histórico pessoal de descobertas, opiniões e conexões através da música. Um
          lugar onde cada avaliação representa uma experiência e cada álbum conta uma história.
        </p>
      </section>
    </div>
  );
}
