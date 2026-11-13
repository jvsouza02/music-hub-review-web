import { NextResponse } from 'next/server';

import { createPreAuthCsrfToken } from '@/lib/auth/csrf';
import { clearSessionCookie } from '@/lib/auth/session-cookie';
import { getSessionIdFromCookie } from '@/lib/auth/session-cookie';
import { getSession } from '@/lib/auth/session-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
};

export async function GET() {
  const sessionId = await getSessionIdFromCookie();

  if (sessionId) {
    const session = await getSession(sessionId);

    if (session) {
      return NextResponse.json({ csrfToken: session.csrfToken }, { headers: NO_STORE_HEADERS });
    }

    await clearSessionCookie();
  }

  const csrfToken = await createPreAuthCsrfToken();

  return NextResponse.json({ csrfToken }, { headers: NO_STORE_HEADERS });
}
