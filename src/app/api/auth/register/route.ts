import { NextResponse } from 'next/server';

import { registerInputSchema } from '@/features/auth/schemas/auth.schema';
import { ServerAuthError, registerWithServer } from '@/lib/auth/server';
import { verifyCsrfRequest } from '@/lib/auth/csrf';

export const runtime = 'nodejs';

const GENERIC_REGISTER_MESSAGE = 'Solicitação recebida. Tente entrar com os dados informados.';

export async function POST(request: Request) {
  const csrfValid = await verifyCsrfRequest(request);

  if (!csrfValid) {
    return NextResponse.json(
      { message: 'Não foi possível validar a solicitação.' },
      { status: 403 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Dados inválidos.' }, { status: 400 });
  }

  const parsedInput = registerInputSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json({ message: 'Confira os dados informados.' }, { status: 400 });
  }

  try {
    await registerWithServer(parsedInput.data);

    return NextResponse.json({ message: GENERIC_REGISTER_MESSAGE }, { status: 200 });
  } catch (error) {
    if (error instanceof ServerAuthError && error.status >= 400 && error.status < 500) {
      return NextResponse.json({ message: GENERIC_REGISTER_MESSAGE }, { status: 200 });
    }

    console.error('[Auth] Registration request failed.');

    return NextResponse.json(
      { message: 'Não foi possível processar o cadastro.' },
      { status: 502 },
    );
  }
}
