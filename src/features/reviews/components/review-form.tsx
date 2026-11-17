'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import {
  createReviewSchema,
  type CreateReviewInput,
} from '@/features/reviews/schemas/review.schema';

type ReviewFormProps = {
  trackMbid: string;
};

type Feedback = {
  type: 'success' | 'error';
  message: string;
  showLoginLink?: boolean;
};

const scoreOptions = Array.from({ length: 10 }, (_, index) => (index + 1) * 0.5);

function isCsrfResponse(value: unknown): value is { csrfToken: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'csrfToken' in value &&
    typeof value.csrfToken === 'string'
  );
}

async function getCsrfToken(): Promise<string> {
  const response = await fetch('/api/auth/csrf', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok || !isCsrfResponse(payload)) {
    throw new Error('Não foi possível validar a solicitação. Tente novamente.');
  }

  return payload.csrfToken;
}

async function getResponseMessage(response: Response): Promise<string | null> {
  const payload: unknown = await response.json().catch(() => null);

  if (typeof payload !== 'object' || payload === null) {
    return null;
  }

  if ('message' in payload && typeof payload.message === 'string') {
    return payload.message;
  }

  if ('detail' in payload && typeof payload.detail === 'string') {
    return payload.detail;
  }

  return null;
}

export function ReviewForm({ trackMbid }: ReviewFormProps) {
  return <ReviewFormFields key={trackMbid} trackMbid={trackMbid} />;
}

function ReviewFormFields({ trackMbid }: ReviewFormProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const router = useRouter();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      track_mbid: trackMbid,
      score: 3,
      body: '',
    },
  });

  const bodyValue =
    useWatch({
      control,
      name: 'body',
    }) ?? '';

  async function onSubmit(values: CreateReviewInput) {
    setFeedback(null);

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          track_mbid: values.track_mbid,
          score: values.score,
          body: values.body?.trim() || null,
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        const serverMessage = await getResponseMessage(response);

        if (response.status === 401) {
          setFeedback({
            type: 'error',
            message: 'Você precisa entrar na sua conta para publicar uma avaliação.',
            showLoginLink: true,
          });
          return;
        }

        if (response.status === 422) {
          setFeedback({
            type: 'error',
            message: 'Os dados da avaliação são inválidos. Verifique a nota e tente novamente.',
          });
          return;
        }

        if (response.status === 429) {
          setFeedback({
            type: 'error',
            message: 'Muitas tentativas em sequência. Aguarde um pouco antes de tentar novamente.',
          });
          return;
        }

        setFeedback({
          type: 'error',
          message:
            serverMessage ?? `Não foi possível publicar sua avaliação (HTTP ${response.status}).`,
        });

        return;
      }

      setFeedback({
        type: 'success',
        message: 'Sua avaliação foi publicada com sucesso!',
      });

      reset({
        track_mbid: trackMbid,
        score: 3,
        body: '',
      });

      router.refresh();
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Ocorreu um erro ao publicar sua avaliação.',
      });
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
      <div className="mb-6 space-y-1">
        <h2 className="text-xl font-semibold">Avalie esta faixa</h2>

        <p className="text-sm text-muted-foreground">
          Compartilhe sua opinião e atribua uma nota de 0,5 a 5.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <input type="hidden" {...register('track_mbid')} />

        {errors.track_mbid && (
          <p role="alert" className="text-sm text-destructive">
            Não foi possível identificar a faixa que será avaliada.
          </p>
        )}

        <div className="space-y-2">
          <label htmlFor="review-score" className="text-sm font-medium">
            Sua nota
          </label>

          <select
            id="review-score"
            {...register('score', { valueAsNumber: true })}
            aria-invalid={Boolean(errors.score)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {scoreOptions.map((score) => (
              <option key={score} value={score}>
                {score.toLocaleString('pt-BR', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}{' '}
                / 5
              </option>
            ))}
          </select>

          {errors.score && (
            <p role="alert" className="text-sm text-destructive">
              Selecione uma nota entre 0,5 e 5, em intervalos de 0,5.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="review-body" className="text-sm font-medium">
            Sua opinião (opcional)
          </label>

          <textarea
            id="review-body"
            {...register('body')}
            maxLength={5000}
            rows={6}
            placeholder="O que você achou dessa faixa?"
            aria-invalid={Boolean(errors.body)}
            className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />

          <div className="flex justify-between gap-4">
            {errors.body ? (
              <p role="alert" className="text-sm text-destructive">
                O texto deve ter no máximo 5.000 caracteres.
              </p>
            ) : (
              <span className="text-sm text-muted-foreground">
                O texto da avaliação não é obrigatório.
              </span>
            )}

            <span className="shrink-0 text-sm text-muted-foreground">
              {bodyValue.length.toLocaleString('pt-BR')} / 5.000
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Publicando...' : 'Publicar avaliação'}
        </button>

        {feedback && (
          <div
            role={feedback.type === 'error' ? 'alert' : 'status'}
            className={
              feedback.type === 'success'
                ? 'rounded-lg bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400'
                : 'rounded-lg bg-destructive/10 p-3 text-sm text-destructive'
            }
          >
            <p>{feedback.message}</p>

            {feedback.showLoginLink && (
              <Link
                href="/login"
                className="mt-2 inline-block font-semibold underline underline-offset-4"
              >
                Entrar na minha conta
              </Link>
            )}
          </div>
        )}
      </form>
    </section>
  );
}
