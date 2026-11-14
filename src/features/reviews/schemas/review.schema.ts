import { z } from 'zod';

const reviewScoreSchema = z.number().min(0.5).max(5).multipleOf(0.5);

export const createReviewSchema = z
  .object({
    track_mbid: z.string().length(36),
    score: reviewScoreSchema,
    body: z.string().max(5000).nullable().optional(),
  })
  .strict();

export const updateReviewSchema = z
  .object({
    new_score_value: reviewScoreSchema.nullable().optional(),
    new_body: z.string().max(5000).nullable().optional(),
  })
  .strict();

export const reviewIdSchema = z.string().uuid();

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
