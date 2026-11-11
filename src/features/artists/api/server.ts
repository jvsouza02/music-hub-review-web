import 'server-only';

import {
  getArtistById,
  getArtistByMbid,
  listArtistAlbums,
  listArtists,
} from '@/lib/api/generated/sdk.gen';

import type { PaginationParams } from '@/lib/api/pagination';

import { normalizePagination } from '@/lib/api/pagination';
import { unwrapApiResult } from '@/lib/api/unwrap';

export async function fetchArtistById(artistId: string) {
  const result = await getArtistById({
    path: {
      artist_id: artistId,
    },
  });

  return unwrapApiResult(result);
}

export async function fetchArtistByMbid(artistMbid: string) {
  const result = await getArtistByMbid({
    path: {
      artist_mbid: artistMbid,
    },
  });

  return unwrapApiResult(result);
}

export async function fetchArtists(params: PaginationParams = {}) {
  const result = await listArtists({
    query: normalizePagination(params),
  });

  return unwrapApiResult(result);
}

export async function fetchArtistAlbums(artistId: string) {
  const result = await listArtistAlbums({
    path: {
      artist_id: artistId,
    },
  });

  return unwrapApiResult(result);
}
