'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { LoginInput } from '@/features/auth/schemas/auth.schema';

import {
  authMessageSchema,
  bffLoginResponseSchema,
  loginInputSchema,
} from '@/features/auth/schemas/auth.schema';

import { useCsrfToken } from '@/features/auth/hooks/use-csrf-token';

const inputClassName =
  'h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30';

export function LoginForm() {
  const router = useRouter();

  const {
    csrfToken,
    setCsrfToken,
    isLoading: isCsrfLoading,
    error: csrfError,
    retry,
  } = useCsrfToken();

  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginInput) {
    setFormError(null);

    if (!csrfToken) {
      setFormError('Não foi possível validar o formulário. Tente novamente.');
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(values),
      });

      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const parsedError = authMessageSchema.safeParse(body);

        setFormError(
          parsedError.success ? parsedError.data.message : 'Não foi possível realizar o login.',
        );

        return;
      }

      const parsedResponse = bffLoginResponseSchema.safeParse(body);

      if (!parsedResponse.success) {
        throw new Error('Resposta de autenticação inválida.');
      }

      setCsrfToken(parsedResponse.data.csrfToken);

      router.replace('/account');
      router.refresh();
    } catch {
      setFormError('Não foi possível conectar ao serviço. Tente novamente.');
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          E-mail
        </label>

        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          className={inputClassName}
          aria-invalid={Boolean(form.formState.errors.email)}
          aria-describedby={form.formState.errors.email ? 'email-error' : undefined}
          {...form.register('email')}
        />

        {form.formState.errors.email && (
          <p id="email-error" className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Senha
        </label>

        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Digite sua senha"
          className={inputClassName}
          aria-invalid={Boolean(form.formState.errors.password)}
          aria-describedby={form.formState.errors.password ? 'password-error' : undefined}
          {...form.register('password')}
        />

        {form.formState.errors.password && (
          <p id="password-error" className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      {csrfError && (
        <div className="space-y-2" role="alert">
          <p className="text-sm text-destructive">{csrfError}</p>

          <button
            type="button"
            onClick={retry}
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {formError && (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || isCsrfLoading || !csrfToken}
        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Entrando...' : isCsrfLoading ? 'Preparando...' : 'Entrar'}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Ainda não possui conta?{' '}
        <Link href="/register" className="font-medium text-primary underline underline-offset-4">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
