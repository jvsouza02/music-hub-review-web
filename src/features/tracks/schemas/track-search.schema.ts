import { z } from 'zod';

import type { TrackSearchResult as ApiTrackSearchResult } from '@/lib/api/generated/types.gen';

export const trackSearchQuerySchema = z.string().trim().min(1);

export const trackSearchResultSchema: z.ZodType<ApiTrackSearchResult> = z.object({
  mbid: z.string().uuid(),
  title: z.string(),
  artist_name: z.string(),
  album_title: z.string().nullable(),
  average_score: z.number().nullable(),
  review_count: z.number().int().nullable(),
});

export const trackSearchResultsSchema = z.array(trackSearchResultSchema);

export const trackSearchErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export type TrackSearchItem = z.infer<typeof trackSearchResultSchema>;
export type TrackSearchError = z.infer<typeof trackSearchErrorSchema>;
