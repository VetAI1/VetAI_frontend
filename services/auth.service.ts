import { httpClient } from '@/infra/http-client';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  TeamMember,
  User,
  UserAddress,
} from '@/types/auth';

export interface UpdateProfilePayload {
  name?: string;
  crmv?: string;
  phone?: string;
  address?: Partial<UserAddress>;
}

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

  listTeam: () =>
    httpClient<TeamMember[]>('auth/team'),

  updateProfile: (data: UpdateProfilePayload) =>
    httpClient<User>('auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
