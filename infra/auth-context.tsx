'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { refreshAccessToken, removeToken, setToken } from '@/infra/http-client';
import { disconnectSocket } from '@/infra/socket';
import { authService } from '@/services/auth.service';
import type { User } from '@/types/auth';

export function useAuthProvider() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    void refreshAccessToken()
      .then(({ user }) => {
        setState({ user, isLoading: false, isAuthenticated: true });
      })
      .catch(() => {
        removeToken();
        setState({ user: null, isLoading: false, isAuthenticated: false });
      });
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authService.login({ email, password });
      setToken(response.access_token);
      setState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
      });
      router.push('/analytics/dashboard');
    },
    [router],
  );

  const register = useCallback(
    async (data: Parameters<typeof authService.register>[0]) => {
      const response = await authService.register(data);
      setToken(response.access_token);
      setState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
      });
      if (response.checkout_url) {
        window.location.assign(response.checkout_url);
        return;
      }
      router.push('/analytics/dashboard');
    },
    [router],
  );

  const logout = useCallback(async () => {
    await authService.logout().catch(() => undefined);
    removeToken();
    disconnectSocket();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  const can = useCallback(
    (permission: string): boolean => {
      if (!state.user) return false;
      const permissions = state.user.permissions ?? [];
      if (permissions.includes('*')) return true;
      const expanded = new Set<string>(permissions);
      permissions.forEach((p: string) => {
        if (p.endsWith(':edit')) {
          expanded.add(p.replace(':edit', ':view'));
        }
      });
      return expanded.has(permission);
    },
    [state.user],
  );

  return { ...state, login, register, logout, can };
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: Parameters<typeof authService.register>[0]) => Promise<void>;
  logout: () => Promise<void>;
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value = useAuthProvider();

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
