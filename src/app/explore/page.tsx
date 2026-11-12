import type { Metadata } from 'next';
import Link from 'next/link';

import { fetchArtists } from '@/features/artists/api/server';
import { fetchAlbums } from '@/features/albums/api/server';
import { fetchTracks } from '@/features/tracks/api/server';

import type { PaginationParams } from '@/lib/api/pagination';
import type { AlbumResponse, ArtistResponse, TrackResponse } from '@/lib/api/generated/types.gen';

import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';

import { AlbumCard } from '@/features/explore/components/album-card';
import { ArtistCard } from '@/features/explore/components/artist-card';
import { TrackCard } from '@/features/explore/components/track-card';
import { CatalogPagination } from '@/features/explore/components/catalog-pagination';

import { TrackSearch } from '@/features/tracks/components/track-search';

export const metadata: Metadata = {
  title: 'Explorar',
  description: 'Explore artistas, descubra álbuns e pesquise faixas no Music Hub Review.',
};

const PAGE_SIZE = 12;

type SearchParamValue = string | string[] | undefined;

type ExploreSearchParams = {
  artistsPage?: SearchParamValue;
  albumsPage?: SearchParamValue;
  tracksPage?: SearchParamValue;
};

type CatalogPage<T> = {
  items: T[];
  hasNext: boolean;
  failed: boolean;
};

type CatalogFetcher<T> = (params: PaginationParams) => Promise<T[]>;

function parsePage(value: SearchParamValue): number {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const page = Number(rawValue);

  if (!Number.isSafeInteger(page) || page < 1) {
    return 1;
  }

  if ((page - 1) * PAGE_SIZE > Number.MAX_SAFE_INTEGER) {
    return 1;
  }

  return page;
}

async function loadCatalogPage<T>(
  fetcher: CatalogFetcher<T>,
  page: number,
): Promise<CatalogPage<T>> {
  try {
    const params: PaginationParams = {
      limit: PAGE_SIZE + 1,
      offset: (page - 1) * PAGE_SIZE,
    };

    const result = await fetcher(params);

    return {
      items: result.slice(0, PAGE_SIZE),
      hasNext: result.length > PAGE_SIZE,
      failed: false,
    };
  } catch {
    return {
      items: [],
      hasNext: false,
      failed: true,
    };
  }
}

function buildPageHref(
  currentParams: ExploreSearchParams,
  pageKey: keyof ExploreSearchParams,
  page: number,
  sectionId: string,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(currentParams)) {
    if (key === pageKey) continue;

    const normalizedValue = Array.isArray(value) ? value[0] : value;

    if (normalizedValue) {
      params.set(key, normalizedValue);
    }
  }

  params.set(pageKey, String(page));

  return `/explore?${params.toString()}#${sectionId}`;
}

function CatalogFailure({
  sectionName,
  currentHref,
}: {
  sectionName: string;
  currentHref: string;
}) {
  return (
    <div className="space-y-4">
      <ErrorState
        title={`Não foi possível carregar ${sectionName}.`}
        description="Verifique a disponibilidade do serviço e tente novamente."
      />

      <div className="text-center">
        <Link
          href={currentHref}
          className="text-sm font-semibold text-primary underline underline-offset-4 hover:opacity-80"
        >
          Tentar novamente
        </Link>
      </div>
    </div>
  );
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<ExploreSearchParams>;
}) {
  const params = await searchParams;

  const artistsPage = parsePage(params.artistsPage);
  const albumsPage = parsePage(params.albumsPage);
  const tracksPage = parsePage(params.tracksPage);

  const [artists, albums, tracks] = await Promise.all([
    loadCatalogPage<ArtistResponse>(fetchArtists, artistsPage),
    loadCatalogPage<AlbumResponse>(fetchAlbums, albumsPage),
    loadCatalogPage<TrackResponse>(fetchTracks, tracksPage),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-14 px-page py-10 sm:py-14">
      {/* Page heading */}
      <header className="max-w-3xl">
        <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
          Music Hub Review
        </p>

        <h1 className="mt-3 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
          Explore o universo da música.
        </h1>

        <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
          Descubra artistas, conheça álbuns e encontre faixas para ouvir e avaliar.
        </p>
      </header>

      {/* Track search */}
      <TrackSearch />

      {/* Artists */}
      <section id="artists" aria-labelledby="artists-title" className="scroll-mt-28 space-y-6">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
            Pessoas por trás da música
          </p>

          <h2
            id="artists-title"
            className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Artistas
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Conheça os artistas presentes no catálogo.
          </p>
        </div>

        {artists.failed ? (
          <CatalogFailure
            sectionName="os artistas"
            currentHref={buildPageHref(params, 'artistsPage', artistsPage, 'artists')}
          />
        ) : artists.items.length === 0 ? (
          <EmptyState
            title="Nenhum artista encontrado"
            description="Ainda não existem artistas disponíveis nesta página."
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {artists.items.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>

            <CatalogPagination
              label="artistas"
              currentPage={artistsPage}
              previousHref={
                artistsPage > 1
                  ? buildPageHref(params, 'artistsPage', artistsPage - 1, 'artists')
                  : undefined
              }
              nextHref={
                artists.hasNext
                  ? buildPageHref(params, 'artistsPage', artistsPage + 1, 'artists')
                  : undefined
              }
            />
          </>
        )}
      </section>

      {/* Albums */}
      <section id="albums" aria-labelledby="albums-title" className="scroll-mt-28 space-y-6">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
            Arte e sonoridade
          </p>

          <h2
            id="albums-title"
            className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Álbuns
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Explore lançamentos e descubra novas experiências musicais.
          </p>
        </div>

        {albums.failed ? (
          <CatalogFailure
            sectionName="os álbuns"
            currentHref={buildPageHref(params, 'albumsPage', albumsPage, 'albums')}
          />
        ) : albums.items.length === 0 ? (
          <EmptyState
            title="Nenhum álbum encontrado"
            description="Ainda não existem álbuns disponíveis nesta página."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {albums.items.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>

            <CatalogPagination
              label="álbuns"
              currentPage={albumsPage}
              previousHref={
                albumsPage > 1
                  ? buildPageHref(params, 'albumsPage', albumsPage - 1, 'albums')
                  : undefined
              }
              nextHref={
                albums.hasNext
                  ? buildPageHref(params, 'albumsPage', albumsPage + 1, 'albums')
                  : undefined
              }
            />
          </>
        )}
      </section>

      {/* Tracks */}
      <section id="tracks" aria-labelledby="tracks-title" className="scroll-mt-28 space-y-6">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
            Cada música tem seu lugar
          </p>

          <h2
            id="tracks-title"
            className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Faixas
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Confira as faixas registradas no catálogo.
          </p>
        </div>

        {tracks.failed ? (
          <CatalogFailure
            sectionName="as faixas"
            currentHref={buildPageHref(params, 'tracksPage', tracksPage, 'tracks')}
          />
        ) : tracks.items.length === 0 ? (
          <EmptyState
            title="Nenhuma faixa encontrada"
            description="Ainda não existem faixas disponíveis nesta página."
          />
        ) : (
          <>
            <div className="grid gap-3 lg:grid-cols-2">
              {tracks.items.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>

            <CatalogPagination
              label="faixas"
              currentPage={tracksPage}
              previousHref={
                tracksPage > 1
                  ? buildPageHref(params, 'tracksPage', tracksPage - 1, 'tracks')
                  : undefined
              }
              nextHref={
                tracks.hasNext
                  ? buildPageHref(params, 'tracksPage', tracksPage + 1, 'tracks')
                  : undefined
              }
            />
          </>
        )}
      </section>
    </div>
  );
}
