import { z } from 'zod';

import type { ArtistSearchResult as ApiArtistSearchResult } from '@/lib/api/generated/types.gen';

export const artistSearchQuerySchema = z.string().trim().min(1);

export const artistSearchResultSchema: z.ZodType<ApiArtistSearchResult> = z.object({
  mbid: z.string().uuid(),
  name: z.string(),
  disambiguation: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  average_score: z.number().nullable().optional(),
  review_count: z.number().int().optional(),
});

export const artistSearchResultsSchema = z.array(artistSearchResultSchema);

export const artistSearchErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export type ArtistSearchItem = z.infer<typeof artistSearchResultSchema>;
export type ArtistSearchError = z.infer<typeof artistSearchErrorSchema>;