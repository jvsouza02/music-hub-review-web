'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { authMessageSchema } from '@/features/auth/schemas/auth.schema';

type LogoutButtonProps = {
  csrfToken: string;
};

export function LogoutButton({ csrfToken }: LogoutButtonProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({}),
      });

      const body: unknown = await response.json().catch(() => null);
      const parsed = authMessageSchema.safeParse(body);

      if (!response.ok || !parsed.success) {
        setError(parsed.success ? parsed.data.message : 'Não foi possível encerrar a sessão.');

        return;
      }

      router.replace('/login');
      router.refresh();
    } catch {
      setError('Não foi possível conectar ao serviço.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoading}
        className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'Saindo...' : 'Sair da conta'}
      </button>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
