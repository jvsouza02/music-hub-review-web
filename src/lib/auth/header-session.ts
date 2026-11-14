import 'server-only';

import { getCurrentSession } from '@/lib/auth/session';
import type { HeaderAuthState } from '@/features/auth/types';

export async function getHeaderAuthState(): Promise<HeaderAuthState | null> {
  try {
    const session = await getCurrentSession();

    if (!session || !session.user.is_active) {
      return null;
    }

    return {
      username: session.user.username,
      csrfToken: session.csrfToken,
    };
  } catch {
    console.error('[Auth] Could not resolve header session. Rendering guest navigation.');

    return null;
  }
}
