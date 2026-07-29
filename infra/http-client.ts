import { toast } from 'sonner';

import type { RefreshResponse } from '@/types/auth';
import type { QueryParams } from '@/types/common';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let token: string | null = null;
let refreshPromise: Promise<RefreshResponse> | null = null;
const sessionExpiredListeners = new Set<() => void>();
const insufficientAiCreditsListeners = new Set<() => void>();

export function getToken(): string | null {
  return token;
}

export function setToken(accessToken: string): void {
  token = accessToken;
}

export function removeToken(): void {
  token = null;
}

export function onSessionExpired(listener: () => void): () => void {
  sessionExpiredListeners.add(listener);
  return () => sessionExpiredListeners.delete(listener);
}

function notifySessionExpired(): void {
  removeToken();
  sessionExpiredListeners.forEach((listener) => listener());
}

export function onInsufficientAiCredits(listener: () => void): () => void {
  insufficientAiCreditsListeners.add(listener);
  return () => insufficientAiCreditsListeners.delete(listener);
}

export function notifyInsufficientAiCredits(): void {
  insufficientAiCreditsListeners.forEach((listener) => listener());
}

export interface HttpClientOptions extends RequestInit {
  skipToast?: boolean;
  skipAuthRefresh?: boolean;
}

export async function refreshAccessToken(): Promise<RefreshResponse> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new ApiError(
            response.status,
            (errorData as { message?: string })?.message ?? 'Sessão expirada',
            errorData,
          );
        }
        return response.json() as Promise<RefreshResponse>;
      })
      .then((response) => {
        setToken(response.access_token);
        return response;
      })
      .catch((error: unknown) => {
        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          notifySessionExpired();
        }
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function httpClient<T>(
  endpoint: string,
  options: HttpClientOptions = {},
): Promise<T> {
  const {
    skipToast = false,
    skipAuthRefresh = false,
    ...fetchOptions
  } = options;
  return request<T>(endpoint, fetchOptions, skipToast, skipAuthRefresh);
}

async function request<T>(
  endpoint: string,
  fetchOptions: RequestInit,
  skipToast: boolean,
  skipAuthRefresh: boolean,
  retried = false,
): Promise<T> {
  const currentToken = getToken();
  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }

  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      ...fetchOptions,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        (errorData as { message?: string })?.message ?? 'Erro na requisição';

      const shouldRefresh =
        response.status === 401 &&
        !retried &&
        !skipAuthRefresh &&
        ![
          'auth/login',
          'auth/register',
          'auth/refresh',
          'auth/logout',
        ].includes(endpoint);

      if (shouldRefresh) {
        try {
          await refreshAccessToken();
          return request<T>(
            endpoint,
            fetchOptions,
            skipToast,
            skipAuthRefresh,
            true,
          );
        } catch {
          removeToken();
        }
      }

      const isInsufficientCredits =
        response.status === 403 &&
        ((errorData as { code?: string })?.code === 'INSUFFICIENT_AI_CREDITS' ||
          errorMessage.toLowerCase().includes('insufficient ai credits') ||
          errorMessage.toLowerCase().includes('créditos de ia insuficientes'));

      if (isInsufficientCredits) {
        notifyInsufficientAiCredits();
      }

      if (!skipToast && !shouldRefresh && !isInsufficientCredits) {
        toast.error(errorMessage);
      }

      throw new ApiError(response.status, errorMessage, errorData);
    }

    if (response.status === 204) return undefined as T;

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const genericMessage = 'Erro de conexão com o servidor';
    if (!skipToast) {
      toast.error(genericMessage);
    }

    throw new Error(genericMessage);
  }
}

export function buildQuery(params?: QueryParams): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.size) searchParams.set('size', String(params.size));
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.direction) searchParams.set('direction', params.direction);
  if (params.search) searchParams.set('search', params.search);
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}
