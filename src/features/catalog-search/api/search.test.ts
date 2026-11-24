import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { fetchCatalogSearch } from './search';

const resultsSchema = z.array(
  z.object({
    id: z.string(),
  }),
);

const errorSchema = z.object({
  code: z.string(),
  message: z.string(),
});

function createOptions(signal: AbortSignal) {
  return {
    endpoint: '/api/catalog/test/search',
    query: 'Linkin Park',
    signal,
    resultsSchema,
    errorSchema,
    fallbackCode: 'SEARCH_FAILED',
    fallbackMessage: 'Não foi possível pesquisar.',
    invalidResponseCode: 'INVALID_SEARCH_RESPONSE',
    invalidResponseMessage: 'A resposta da pesquisa é inválida.',
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchCatalogSearch', () => {
  it('retorna os resultados quando a resposta é válida', async () => {
    const controller = new AbortController();

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ id: '123' }]), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchCatalogSearch(createOptions(controller.signal));

    expect(result).toEqual([{ id: '123' }]);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/catalog/test/search?query=Linkin+Park',
      expect.objectContaining({
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      }),
    );
  });

  it('lança erro com a mensagem retornada pelo servidor', async () => {
    const controller = new AbortController();

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Limite de pesquisas excedido.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      fetchCatalogSearch(createOptions(controller.signal)),
    ).rejects.toThrow('Limite de pesquisas excedido.');
  });

  it('rejeita respostas com estrutura inválida', async () => {
    const controller = new AbortController();

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ name: 'Linkin Park' }]), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      fetchCatalogSearch(createOptions(controller.signal)),
    ).rejects.toThrow('A resposta da pesquisa é inválida.');
  });
});