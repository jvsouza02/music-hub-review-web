import { NextResponse } from 'next/server';

import { createReviewSchema } from '@/features/reviews/schemas/review.schema';

import { createUserReview } from '@/features/reviews/api/server';

import {
  createReviewErrorResponse,
  requireAuthenticatedMutation,
} from '@/lib/auth/protected-route';

export const runtime = 'nodejs';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store',
};

export async function POST(request: Request) {
  const authorization = await requireAuthenticatedMutation(request);

  if (!authorization.authenticated) {
    return authorization.response;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'O corpo da solicitação é inválido.' }, { status: 400 });
  }

  const parsedInput = createReviewSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      { message: 'Confira os dados informados na avaliação.' },
      { status: 422 },
    );
  }

  try {
    const review = await createUserReview(parsedInput.data, {
      accessToken: authorization.session.accessToken,
    });

    return NextResponse.json(review, {
      status: 201,
      headers: NO_STORE_HEADERS,
    });
  } catch (error) {
    return createReviewErrorResponse(error);
  }
}
