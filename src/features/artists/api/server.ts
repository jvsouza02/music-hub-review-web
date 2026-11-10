import "server-only";

import {
  getArtistById,
  getArtistByMbid,
  listArtistAlbums,
  listArtists,
} from "@/lib/api/generated/sdk.gen";

import { unwrapApiResult } from "@/lib/api/unwrap";

type PaginationParams = {
  limit?: number;
  offset?: number;
};

export async function fetchArtistById(artistId: string) {
  const result = await getArtistById({
    path: { artist_id: artistId },
  });

  return unwrapApiResult(result);
}

export async function fetchArtistByMbid(artistMbid: string) {
  const result = await getArtistByMbid({
    path: { artist_mbid: artistMbid },
  });

  return unwrapApiResult(result);
}

export async function fetchArtists(params: PaginationParams = {}) {
  const result = await listArtists({
    query: {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    },
  });

  return unwrapApiResult(result);
}

export async function fetchArtistAlbums(artistId: string) {
  const result = await listArtistAlbums({
    path: { artist_id: artistId },
  });

  return unwrapApiResult(result);
}