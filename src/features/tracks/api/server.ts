import "server-only";

import {
  getTrackById,
  getTrackByMbid,
  listTracks,
  searchTracks,
} from "@/lib/api/generated/sdk.gen";

import type { PaginationParams } from "@/lib/api/pagination";

import { normalizePagination } from "@/lib/api/pagination";
import { unwrapApiResult } from "@/lib/api/unwrap";

export async function fetchTrackById(trackId: string) {
  const result = await getTrackById({
    path: {
      track_id: trackId,
    },
  });

  return unwrapApiResult(result);
}

export async function fetchTrackByMbid(trackMbid: string) {
  const result = await getTrackByMbid({
    path: {
      track_mbid: trackMbid,
    },
  });

  return unwrapApiResult(result);
}

export async function fetchTracks(params: PaginationParams = {}) {
  const result = await listTracks({
    query: normalizePagination(params),
  });

  return unwrapApiResult(result);
}

export async function searchTracksByTerm(query: string) {
  const result = await searchTracks({
    query: {
      query,
    },
  });

  return unwrapApiResult(result);
}