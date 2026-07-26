import { httpClient } from '@/infra/http-client';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from '@/types/auth';

export const authService = {
  login: (data: LoginPayload) =>
    httpClient<AuthResponse>('auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuthRefresh: true,
    }),

  register: (data: RegisterPayload) =>
    httpClient<AuthResponse>('auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuthRefresh: true,
    }),

  me: () =>
    httpClient<User>('auth/me', {
      method: 'GET',
      skipToast: true,
    }),

  logout: () =>
    httpClient<void>('auth/logout', {
      method: 'POST',
      skipToast: true,
      skipAuthRefresh: true,
    }),
};
