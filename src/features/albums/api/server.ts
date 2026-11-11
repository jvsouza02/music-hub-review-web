import "server-only";

import {
  getAlbumById,
  getAlbumByMbid,
  listAlbums,
  listAlbumTracks,
} from "@/lib/api/generated/sdk.gen";

import type { PaginationParams } from "@/lib/api/pagination";

import { normalizePagination } from "@/lib/api/pagination";
import { unwrapApiResult } from "@/lib/api/unwrap";

export async function fetchAlbumById(albumId: string) {
  const result = await getAlbumById({
    path: {
      album_id: albumId,
    },
  });

  return unwrapApiResult(result);
}

export async function fetchAlbumByMbid(albumMbid: string) {
  const result = await getAlbumByMbid({
    path: {
      album_mbid: albumMbid,
    },
  });

  return unwrapApiResult(result);
}

export async function fetchAlbums(params: PaginationParams = {}) {
  const result = await listAlbums({
    query: normalizePagination(params),
  });

  return unwrapApiResult(result);
}

export async function fetchAlbumTracks(albumId: string) {
  const result = await listAlbumTracks({
    path: {
      album_id: albumId,
    },
  });

  return unwrapApiResult(result);
}