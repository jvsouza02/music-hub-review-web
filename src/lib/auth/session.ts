import 'server-only';

import { getSessionIdFromCookie } from '@/lib/auth/session-cookie';
import { getSessionWithRefresh } from '@/lib/auth/session-refresh';

export async function getCurrentSession() {
  const sessionId = await getSessionIdFromCookie();

  if (!sessionId) {
    return null;
  }

  return getSessionWithRefresh(sessionId);
}

export async function getCurrentUser() {
  const session = await getCurrentSession();

  return session?.user ?? null;
}
