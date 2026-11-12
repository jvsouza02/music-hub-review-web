'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Music2 } from 'lucide-react';

import { ApiError } from '@/lib/api/api-error';
import { queryKeys } from '@/lib/query/query-keys';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';

import { useDebouncedValue } from '@/features/tracks/hooks/use-debounced-value';

import {
  trackSearchErrorSchema,
  trackSearchResultsSchema,
} from '@/features/tracks/schemas/track-search.schema.ts';

import type { TrackSearchItem } from '@/features/tracks/schemas/track-search.schema.ts';

function formatRating(averageScore: number | null, reviewCount: number | null): string {
  if (averageScore === null) {
    return reviewCount !== null && reviewCount > 0 ? 'Média indisponível' : 'Sem avaliações';
  }

  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
  }).format(averageScore);
}

function TrackSearchResultCard({ track }: { track: TrackSearchItem }) {
  const reviewLabel =
    track.review_count === null
      ? 'Contagem indisponível'
      : `${track.review_count} ${track.review_count === 1 ? 'avaliação' : 'avaliações'}`;

  return (
    <article className="flex min-w-0 items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Music2 aria-hidden="true" className="size-6" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold">{track.title}</h3>

        <p className="mt-1 truncate text-xs text-muted-foreground">
          {track.artist_name}
          {track.album_title ? ` · ${track.album_title}` : ''}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold">
          {formatRating(track.average_score, track.review_count)}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">{reviewLabel}</p>
      </div>
    </article>
  );
}

async function searchTracks(query: string, signal: AbortSignal) {
  const params = new URLSearchParams({ query });

  const response = await fetch(`/api/catalog/tracks/search?${params.toString()}`, {
    method: 'GET',
    signal,
    cache: 'no-store',
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const parsedError = trackSearchErrorSchema.safeParse(body);

    throw new ApiError(
      response.status,
      parsedError.success ? parsedError.data.code : 'TRACK_SEARCH_FAILED',
      parsedError.success ? parsedError.data.message : 'Não foi possível pesquisar as faixas.',
    );
  }

  const parsedResults = trackSearchResultsSchema.safeParse(body);

  if (!parsedResults.success) {
    throw new ApiError(
      502,
      'INVALID_TRACK_SEARCH_RESPONSE',
      'O serviço retornou dados em um formato inesperado.',
    );
  }

  return parsedResults.data;
}

function SearchSkeleton() {
  return (
    <div role="status" aria-label="Pesquisando faixas" className="space-y-3">
      <span className="sr-only">Pesquisando faixas...</span>

      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="flex items-center gap-4 rounded-xl border border-border p-4"
        >
          <div className="size-12 animate-pulse rounded-xl bg-muted" />

          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TrackSearch() {
  const [inputValue, setInputValue] = useState('');

  const debouncedValue = useDebouncedValue(inputValue, 300);
  const query = debouncedValue.trim();

  const isDebouncing = inputValue.trim() !== query;

  const searchQuery = useQuery({
    queryKey: queryKeys.tracks.search(query),
    queryFn: ({ signal }) => searchTracks(query, signal),
    enabled: query.length > 0,
  });

  function clearSearch() {
    setInputValue('');
  }

  return (
    <section
      id="track-search"
      aria-labelledby="track-search-title"
      className="scroll-mt-28 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-7"
    >
      <div className="max-w-2xl">
        <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
          Encontre sua próxima música
        </p>

        <h2 id="track-search-title" className="mt-2 font-heading text-2xl font-bold tracking-tight">
          Pesquisar faixas
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Pesquise pelo nome de uma faixa e descubra suas avaliações.
        </p>
      </div>

      {/* Search input */}
      <div className="relative mt-6">
        <label htmlFor="track-search-input" className="sr-only">
          Nome da faixa
        </label>

        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
        />

        <input
          id="track-search-input"
          type="search"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Digite o nome de uma faixa..."
          autoComplete="off"
          className="h-12 w-full rounded-xl border border-input bg-background pr-12 pl-12 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        />

        {inputValue ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearSearch}
            aria-label="Limpar pesquisa"
            className="absolute top-1/2 right-2 -translate-y-1/2"
          >
            <X aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      {/* Search results */}
      <div className="mt-6" aria-live="polite">
        {!inputValue.trim() ? (
          <div className="rounded-xl bg-muted/50 px-5 py-8 text-center">
            <Music2 aria-hidden="true" className="mx-auto size-8 text-muted-foreground" />

            <p className="mt-3 text-sm text-muted-foreground">
              Digite o nome de uma faixa para começar a pesquisar.
            </p>
          </div>
        ) : isDebouncing || searchQuery.isPending ? (
          <SearchSkeleton />
        ) : searchQuery.isError ? (
          <ErrorState
            title="Não foi possível pesquisar."
            description={searchQuery.error.message}
            onRetry={() => void searchQuery.refetch()}
          />
        ) : searchQuery.isSuccess && searchQuery.data.length === 0 ? (
          <EmptyState
            title="Nenhuma faixa encontrada"
            description="Tente pesquisar utilizando outro nome."
          />
        ) : searchQuery.isSuccess ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {searchQuery.data.length}{' '}
              {searchQuery.data.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </p>

            {searchQuery.data.map((track) => (
              <TrackSearchResultCard key={track.mbid} track={track} />
            ))}
          </div>
        ) : (
          <SearchSkeleton />
        )}
      </div>
    </section>
  );
}
