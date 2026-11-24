'use client';

import Link from 'next/link';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { Music2, Search, X } from 'lucide-react';

import { queryKeys } from '@/lib/query/query-keys';

import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/feedback/error-state';

import { AlbumCover } from '@/components/media/album-cover';
import { ArtistImage } from '@/components/media/artist-image';

import { getReleaseCoverUrl } from '@/lib/media/cover-art';

import { useDebouncedValue } from '@/features/tracks/hooks/use-debounced-value';

import {
  artistSearchErrorSchema,
  artistSearchResultsSchema,
} from '@/features/artists/schemas/artist-search.schema';

import type { ArtistSearchItem } from '@/features/artists/schemas/artist-search.schema';

import {
  albumSearchErrorSchema,
  albumSearchResultsSchema,
} from '@/features/albums/schemas/album-search.schema';

import type { AlbumSearchItem } from '@/features/albums/schemas/album-search.schema';

import {
  trackSearchErrorSchema,
  trackSearchResultsSchema,
} from '@/features/tracks/schemas/track-search.schema';

import type { TrackSearchItem } from '@/features/tracks/schemas/track-search.schema';

import { fetchCatalogSearch } from '@/features/catalog-search/api/search';

function formatRating(
  averageScore: number | null | undefined,
  reviewCount: number | null | undefined,
): string {
  if (averageScore === null || averageScore === undefined) {
    return reviewCount === 0 ? 'Sem avaliações' : 'Nota indisponível';
  }

  return `Nota ${new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
  }).format(averageScore)}`;
}

function formatReviewCount(reviewCount: number | null | undefined): string {
  if (reviewCount === null || reviewCount === undefined) {
    return 'Contagem indisponível';
  }

  return `${reviewCount} ${reviewCount === 1 ? 'avaliação' : 'avaliações'}`;
}

function SearchSkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={`Pesquisando ${label}`}
      className="space-y-3"
    >
      <span className="sr-only">Pesquisando {label}...</span>

      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="flex items-center gap-3 rounded-xl border border-border p-3"
        >
          <div className="size-12 shrink-0 animate-pulse rounded-xl bg-muted" />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

type SearchResultSectionProps<T> = {
  title: string;
  label: string;
  query: UseQueryResult<T[], Error>;
  isDebouncing: boolean;
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
};

function SearchResultSection<T>({
  title,
  label,
  query,
  isDebouncing,
  getKey,
  renderItem,
}: SearchResultSectionProps<T>) {
  let content: ReactNode;

  if (isDebouncing || query.isPending) {
    content = <SearchSkeleton label={label.toLowerCase()} />;
  } else if (query.isError) {
    content = (
      <ErrorState
        title={`Não foi possível pesquisar ${label.toLowerCase()}.`}
        description={query.error.message}
        onRetry={() => void query.refetch()}
      />
    );
  } else if (query.isSuccess && query.data.length === 0) {
    content = (
      <div className="rounded-xl bg-muted/40 px-4 py-8 text-center">
        <p className="text-sm font-medium">Nenhum resultado encontrado.</p>

        <p className="mt-1 text-xs text-muted-foreground">
          Tente pesquisar utilizando outro termo.
        </p>
      </div>
    );
  } else if (query.isSuccess) {
    content = (
      <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
        {query.data.map((item) => (
          <div key={getKey(item)}>{renderItem(item)}</div>
        ))}
      </div>
    );
  } else {
    content = <SearchSkeleton label={label.toLowerCase()} />;
  }

  return (
    <section className="min-w-0 rounded-xl border border-border bg-background/60 p-4">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-heading text-base font-bold">{title}</h3>

        {query.isSuccess && !isDebouncing ? (
          <span className="shrink-0 text-xs text-muted-foreground">
            {query.data.length}{' '}
            {query.data.length === 1 ? 'resultado' : 'resultados'}
          </span>
        ) : null}
      </header>

      {content}
    </section>
  );
}

function ArtistResultCard({ artist }: { artist: ArtistSearchItem }) {
  const subtitle = [artist.disambiguation, artist.country]
    .filter(Boolean)
    .join(' · ') || 'Artista';

  return (
    <Link
      href={`/artists/${artist.mbid}`}
      aria-label={`Ver detalhes de ${artist.name}`}
      className="group flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <ArtistImage name={artist.name} image={null} />

      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-semibold">{artist.name}</h4>

        <p className="mt-1 truncate text-xs text-muted-foreground">
          {subtitle}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-xs font-semibold">
          {formatRating(artist.average_score, artist.review_count)}
        </p>

        <p className="mt-1 text-[11px] text-muted-foreground">
          {formatReviewCount(artist.review_count)}
        </p>
      </div>
    </Link>
  );
}

function AlbumResultCard({ album }: { album: AlbumSearchItem }) {
  const metadata = [
    album.artist_name,
    album.release_date,
    album.total_tracks !== null && album.total_tracks !== undefined
      ? `${album.total_tracks} ${album.total_tracks === 1 ? 'faixa' : 'faixas'}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link
      href={`/albums/${album.mbid}`}
      aria-label={`Ver detalhes do álbum ${album.title}`}
      className="group flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="size-12 shrink-0">
        <AlbumCover
          src={getReleaseCoverUrl(album.mbid)}
          alt={`Capa do álbum ${album.title}`}
          className="rounded-xl"
          sizes="48px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-semibold">{album.title}</h4>

        <p className="mt-1 truncate text-xs text-muted-foreground">
          {metadata || 'Álbum'}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-xs font-semibold">
          {formatRating(album.average_score, album.review_count)}
        </p>

        <p className="mt-1 text-[11px] text-muted-foreground">
          {formatReviewCount(album.review_count)}
        </p>
      </div>
    </Link>
  );
}

function TrackResultCard({ track }: { track: TrackSearchItem }) {
  return (
    <Link
      href={`/tracks/${track.mbid}`}
      aria-label={`Ver detalhes de ${track.title}, por ${track.artist_name}`}
      className="group flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="size-12 shrink-0">
        <AlbumCover
          src={getReleaseCoverUrl(track.album_mbid)}
          alt={`Capa do álbum de ${track.title}`}
          className="rounded-xl"
          sizes="48px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-semibold">{track.title}</h4>

        <p className="mt-1 truncate text-xs text-muted-foreground">
          {track.artist_name}
          {track.album_title ? ` · ${track.album_title}` : ''}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-xs font-semibold">
          {formatRating(track.average_score, track.review_count)}
        </p>

        <p className="mt-1 text-[11px] text-muted-foreground">
          {formatReviewCount(track.review_count)}
        </p>
      </div>
    </Link>
  );
}

export function CatalogSearch() {
  const [inputValue, setInputValue] = useState('');

  const queryClient = useQueryClient();

  const debouncedValue = useDebouncedValue(inputValue, 300);
  const query = debouncedValue.trim();

  const isDebouncing = inputValue.trim() !== query;

  const artistQuery = useQuery({
    queryKey: queryKeys.artists.search(query),
    queryFn: ({ signal }) =>
      fetchCatalogSearch({
        endpoint: '/api/catalog/artists/search',
        query,
        signal,
        resultsSchema: artistSearchResultsSchema,
        errorSchema: artistSearchErrorSchema,
        fallbackCode: 'ARTIST_SEARCH_FAILED',
        fallbackMessage: 'Não foi possível pesquisar artistas.',
        invalidResponseCode: 'INVALID_ARTIST_SEARCH_RESPONSE',
        invalidResponseMessage: 'O serviço retornou dados inválidos para artistas.',
      }),
    enabled: query.length > 0,
    staleTime: 30_000,
  });

  const albumQuery = useQuery({
    queryKey: queryKeys.albums.search(query),
    queryFn: ({ signal }) =>
      fetchCatalogSearch({
        endpoint: '/api/catalog/albums/search',
        query,
        signal,
        resultsSchema: albumSearchResultsSchema,
        errorSchema: albumSearchErrorSchema,
        fallbackCode: 'ALBUM_SEARCH_FAILED',
        fallbackMessage: 'Não foi possível pesquisar álbuns.',
        invalidResponseCode: 'INVALID_ALBUM_SEARCH_RESPONSE',
        invalidResponseMessage: 'O serviço retornou dados inválidos para álbuns.',
      }),
    enabled: query.length > 0,
    staleTime: 30_000,
  });

  const trackQuery = useQuery({
    queryKey: queryKeys.tracks.search(query),
    queryFn: ({ signal }) =>
      fetchCatalogSearch({
        endpoint: '/api/catalog/tracks/search',
        query,
        signal,
        resultsSchema: trackSearchResultsSchema,
        errorSchema: trackSearchErrorSchema,
        fallbackCode: 'TRACK_SEARCH_FAILED',
        fallbackMessage: 'Não foi possível pesquisar faixas.',
        invalidResponseCode: 'INVALID_TRACK_SEARCH_RESPONSE',
        invalidResponseMessage: 'O serviço retornou dados inválidos para faixas.',
      }),
    enabled: query.length > 0,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!isDebouncing) {
      return;
    }

    void Promise.all([
      queryClient.cancelQueries({
        queryKey: queryKeys.artists.search(query),
        exact: true,
      }),
      queryClient.cancelQueries({
        queryKey: queryKeys.albums.search(query),
        exact: true,
      }),
      queryClient.cancelQueries({
        queryKey: queryKeys.tracks.search(query),
        exact: true,
      }),
    ]);
  }, [isDebouncing, query, queryClient]);

  function clearSearch() {
    setInputValue('');
  }

  return (
    <section
      id="catalog-search"
      aria-labelledby="catalog-search-title"
      className="scroll-mt-28 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-7"
    >
      <div className="max-w-2xl">
        <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
          Encontre sua próxima descoberta
        </p>

        <h2
          id="catalog-search-title"
          className="mt-2 font-heading text-2xl font-bold tracking-tight"
        >
          Pesquisar catálogo
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Pesquise artistas, álbuns e faixas em um só lugar.
        </p>
      </div>

      <div className="relative mt-6">
        <label htmlFor="catalog-search-input" className="sr-only">
          Artista, álbum ou faixa
        </label>

        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
        />

        <input
          id="catalog-search-input"
          type="search"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Digite o nome de um artista, álbum ou faixa..."
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

      <div className="mt-6" aria-live="polite">
        {!inputValue.trim() ? (
          <div className="rounded-xl bg-muted/50 px-5 py-8 text-center">
            <Music2
              aria-hidden="true"
              className="mx-auto size-8 text-muted-foreground"
            />

            <p className="mt-3 text-sm text-muted-foreground">
              Digite um termo para pesquisar artistas, álbuns e faixas.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <SearchResultSection
              title="Artistas"
              label="artistas"
              query={artistQuery}
              isDebouncing={isDebouncing}
              getKey={(artist) => artist.mbid}
              renderItem={(artist) => <ArtistResultCard artist={artist} />}
            />

            <SearchResultSection
              title="Álbuns"
              label="álbuns"
              query={albumQuery}
              isDebouncing={isDebouncing}
              getKey={(album) => album.mbid}
              renderItem={(album) => <AlbumResultCard album={album} />}
            />

            <SearchResultSection
              title="Faixas"
              label="faixas"
              query={trackQuery}
              isDebouncing={isDebouncing}
              getKey={(track) => track.mbid}
              renderItem={(track) => <TrackResultCard track={track} />}
            />
          </div>
        )}
      </div>
    </section>
  );
}