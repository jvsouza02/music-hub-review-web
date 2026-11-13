'use client';

import { useCallback, useEffect, useState } from 'react';

import { csrfResponseSchema } from '@/features/auth/schemas/auth.schema';

export function useCsrfToken() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setAttempt((current) => current + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCsrfToken() {
      try {
        const response = await fetch('/api/auth/csrf', {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Não foi possível obter a proteção CSRF.');
        }

        const body: unknown = await response.json();
        const parsed = csrfResponseSchema.safeParse(body);

        if (!parsed.success) {
          throw new Error('Resposta CSRF inválida.');
        }

        if (!controller.signal.aborted) {
          setCsrfToken(parsed.data.csrfToken);
          setError(null);
        }
      } catch {
        if (!controller.signal.aborted) {
          setCsrfToken(null);
          setError('Não foi possível preparar o formulário. Tente novamente.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadCsrfToken();

    return () => controller.abort();
  }, [attempt]);

  return {
    csrfToken,
    setCsrfToken,
    isLoading,
    error,
    retry,
  };
}
