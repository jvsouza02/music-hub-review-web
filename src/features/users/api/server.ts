import "server-only";

import {
  createUser,
  deleteUser,
  getCurrentUser,
  getPublicUser,
  listUsers,
  updateUser,
} from "@/lib/api/generated/sdk.gen";

import type {
  UserCreateSchema,
  UserUpdateSchema,
} from "@/lib/api/generated/types.gen";

import {
  getAuthorizationHeaders,
  type AuthenticatedApiContext,
} from "@/lib/api/request-context";

import { unwrapApiResult, unwrapApiVoid } from "@/lib/api/unwrap";

export async function fetchUsers(context: AuthenticatedApiContext) {
  const result = await listUsers({
    headers: getAuthorizationHeaders(context),
  });

  return unwrapApiResult(result);
}

export async function fetchCurrentUser(
  context: AuthenticatedApiContext,
) {
  const result = await getCurrentUser({
    headers: getAuthorizationHeaders(context),
  });

  return unwrapApiResult(result);
}

export async function fetchPublicUser(userId: string) {
  const result = await getPublicUser({
    path: {
      user_id: userId,
    },
  });

  return unwrapApiResult(result);
}

export async function registerUser(data: UserCreateSchema) {
  const result = await createUser({
    body: data,
  });

  return unwrapApiResult(result);
}

export async function updateUserProfile(
  userId: string,
  data: UserUpdateSchema,
  context: AuthenticatedApiContext,
) {
  const result = await updateUser({
    path: {
      user_id: userId,
    },
    body: data,
    headers: getAuthorizationHeaders(context),
  });

  return unwrapApiResult(result);
}

export async function deleteUserAccount(
  userId: string,
  context: AuthenticatedApiContext,
) {
  const result = await deleteUser({
    path: {
      user_id: userId,
    },
    headers: getAuthorizationHeaders(context),
  });

  return unwrapApiVoid(result);
}