import 'server-only';

export type AuthenticatedApiContext = {
  accessToken: string;
};

export function getAuthorizationHeaders(context: AuthenticatedApiContext) {
  return {
    Authorization: `Bearer ${context.accessToken}`,
  };
}
