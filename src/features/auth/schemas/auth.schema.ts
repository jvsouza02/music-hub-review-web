import { z } from 'zod';

export const registerInputSchema = z.object({
  username: z.string().trim().min(2).max(50),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export const loginInputSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const authUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email(),
  role: z.enum(['user', 'moderator', 'admin']),
  is_active: z.boolean(),
});

export const loginResponseSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.string(),
  message: z.string(),
});

export const csrfResponseSchema = z.object({
  csrfToken: z.string().length(43),
});

export const bffLoginResponseSchema = z.object({
  user: authUserSchema,
  csrfToken: z.string().length(43),
});

export const authMessageSchema = z.object({
  message: z.string(),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
