import 'server-only';

import { redirect } from 'next/navigation';

import { getCurrentSession } from '@/lib/auth/session';
import type { ServerSession, SessionUser } from '@/lib/auth/session-store';

export async function requireAuthenticatedSession(): Promise<ServerSession> {
  const session = await getCurrentSession();

  if (!session || !session.user.is_active) {
    redirect('/login');
  }

  return session;
}

export async function requireAuthenticatedUser(): Promise<SessionUser> {
  const session = await requireAuthenticatedSession();

  return session.user;
}
