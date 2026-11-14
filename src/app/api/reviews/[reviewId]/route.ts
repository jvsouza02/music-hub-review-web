import { NextResponse } from 'next/server';

import { updateReviewSchema, reviewIdSchema } from '@/features/reviews/schemas/review.schema';

import { updateUserReview, deleteUserReview } from '@/features/reviews/api/server';

import {
  createReviewErrorResponse,
  requireAuthenticatedMutation,
} from '@/lib/auth/protected-route';

export const runtime = 'nodejs';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store',
};

type ReviewRouteContext = {
  params: Promise<{
    reviewId: string;
  }>;
};

export async function PUT(request: Request, context: ReviewRouteContext) {
  const authorization = await requireAuthenticatedMutation(request);

  if (!authorization.authenticated) {
    return authorization.response;
  }

  const { reviewId } = await context.params;

  if (!reviewIdSchema.safeParse(reviewId).success) {
    return NextResponse.json({ message: 'Identificador de avaliação inválido.' }, { status: 400 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'O corpo da solicitação é inválido.' }, { status: 400 });
  }

  const parsedInput = updateReviewSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      { message: 'Confira os dados informados na avaliação.' },
      { status: 422 },
    );
  }

  try {
    const review = await updateUserReview(reviewId, parsedInput.data, {
      accessToken: authorization.session.accessToken,
    });

    return NextResponse.json(review, {
      status: 200,
      headers: NO_STORE_HEADERS,
    });
  } catch (error) {
    return createReviewErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: ReviewRouteContext) {
  const authorization = await requireAuthenticatedMutation(request);

  if (!authorization.authenticated) {
    return authorization.response;
  }

  const { reviewId } = await context.params;

  if (!reviewIdSchema.safeParse(reviewId).success) {
    return NextResponse.json({ message: 'Identificador de avaliação inválido.' }, { status: 400 });
  }

  try {
    await deleteUserReview(reviewId, {
      accessToken: authorization.session.accessToken,
    });

    return new NextResponse(null, {
      status: 204,
      headers: NO_STORE_HEADERS,
    });
  } catch (error) {
    return createReviewErrorResponse(error);
  }
}
