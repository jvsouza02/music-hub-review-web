import "server-only";

import {
  createReview,
  deleteReview,
  getReviewById,
  listReviewsByTrack,
  listReviewsByUser,
  updateReview,
} from "@/lib/api/generated/sdk.gen";

import type {
  ReviewCreateRequest,
  ReviewUpdateRequest,
} from "@/lib/api/generated/types.gen";

import type { PaginationParams } from "@/lib/api/pagination";

import {
  getAuthorizationHeaders,
  type AuthenticatedApiContext,
} from "@/lib/api/request-context";

import { normalizePagination } from "@/lib/api/pagination";

import { unwrapApiResult, unwrapApiVoid } from "@/lib/api/unwrap";

export async function fetchReviewById(reviewId: string) {
  const result = await getReviewById({
    path: {
      review_id: reviewId,
    },
  });

  return unwrapApiResult(result);
}

export async function fetchReviewsByUser(
  userId: string,
  params: PaginationParams = {},
) {
  const result = await listReviewsByUser({
    path: {
      user_id: userId,
    },
    query: normalizePagination(params),
  });

  return unwrapApiResult(result);
}

export async function fetchReviewsByTrack(
  trackId: string,
  params: PaginationParams = {},
) {
  const result = await listReviewsByTrack({
    path: {
      track_id: trackId,
    },
    query: normalizePagination(params),
  });

  return unwrapApiResult(result);
}

export async function createUserReview(
  data: ReviewCreateRequest,
  context: AuthenticatedApiContext,
) {
  const result = await createReview({
    body: data,
    headers: getAuthorizationHeaders(context),
  });

  return unwrapApiResult(result);
}

export async function updateUserReview(
  reviewId: string,
  data: ReviewUpdateRequest,
  context: AuthenticatedApiContext,
) {
  const result = await updateReview({
    path: {
      review_id: reviewId,
    },
    body: data,
    headers: getAuthorizationHeaders(context),
  });

  return unwrapApiResult(result);
}

export async function deleteUserReview(
  reviewId: string,
  context: AuthenticatedApiContext,
) {
  const result = await deleteReview({
    path: {
      review_id: reviewId,
    },
    headers: getAuthorizationHeaders(context),
  });

  return unwrapApiVoid(result);
}