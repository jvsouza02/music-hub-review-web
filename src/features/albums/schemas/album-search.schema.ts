import { z } from 'zod';

import type { AlbumSearchResult as ApiAlbumSearchResult } from '@/lib/api/generated/types.gen';

export const albumSearchQuerySchema = z.string().trim().min(1);

export const albumSearchResultSchema: z.ZodType<ApiAlbumSearchResult> = z.object({
  mbid: z.string().uuid(),
  title: z.string(),
  artist_name: z.string().nullable().optional(),
  artist_mbid: z.string().uuid().nullable().optional(),
  release_date: z.string().nullable().optional(),
  total_tracks: z.number().int().nullable().optional(),
  average_score: z.number().nullable().optional(),
  review_count: z.number().int().optional(),
});

export const albumSearchResultsSchema = z.array(albumSearchResultSchema);

export const albumSearchErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export type AlbumSearchItem = z.infer<typeof albumSearchResultSchema>;
export type AlbumSearchError = z.infer<typeof albumSearchErrorSchema>;