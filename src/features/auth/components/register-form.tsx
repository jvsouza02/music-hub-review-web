'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { RegisterInput } from '@/features/auth/schemas/auth.schema';

import { authMessageSchema, registerInputSchema } from '@/features/auth/schemas/auth.schema';

import { useCsrfToken } from '@/features/auth/hooks/use-csrf-token';

const inputClassName =
  'h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30';

export function RegisterForm() {
  const { csrfToken, isLoading: isCsrfLoading, error: csrfError, retry } = useCsrfToken();

  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerInputSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: RegisterInput) {
    setFormError(null);
    setSuccessMessage(null);

    if (!csrfToken) {
      setFormError('Não foi possível validar o formulário. Tente novamente.');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
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

      const parsedMessage = authMessageSchema.safeParse(body);

      if (!response.ok || !parsedMessage.success) {
        setFormError(
          parsedMessage.success
            ? parsedMessage.data.message
            : 'Não foi possível processar o cadastro.',
        );

        return;
      }

      setSuccessMessage(parsedMessage.data.message);
      form.reset();
    } catch {
      setFormError('Não foi possível conectar ao serviço. Tente novamente.');
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium">
          Nome de usuário
        </label>

        <input
          id="username"
          type="text"
          autoComplete="username"
          placeholder="Como deseja ser identificado?"
          className={inputClassName}
          aria-invalid={Boolean(form.formState.errors.username)}
          aria-describedby={form.formState.errors.username ? 'username-error' : undefined}
          {...form.register('username')}
        />

        {form.formState.errors.username && (
          <p id="username-error" className="text-sm text-destructive">
            {form.formState.errors.username.message}
          </p>
        )}
      </div>

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
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
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

      {successMessage && (
        <div role="status" className="rounded-lg border border-border bg-muted p-3 text-sm">
          {successMessage}{' '}
          <Link href="/login" className="font-medium text-primary underline underline-offset-4">
            Fazer login
          </Link>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || isCsrfLoading || !csrfToken}
        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Criando conta...' : isCsrfLoading ? 'Preparando...' : 'Criar conta'}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Já possui uma conta?{' '}
        <Link href="/login" className="font-medium text-primary underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </form>
  );
}
