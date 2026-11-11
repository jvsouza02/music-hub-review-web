import 'server-only';

import type { CreateClientConfig } from '@/lib/api/generated/client.gen';

export const createClientConfig: CreateClientConfig = (config) => {
  const baseUrl = process.env.API_BASE_URL;

  if (!baseUrl) {
    throw new Error('API_BASE_URL is not configured.');
  }

  return {
    ...config,
    baseUrl,
  };
};
