'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/infra/auth-context';
import { onInsufficientAiCredits } from '@/infra/http-client';
import type { Account } from '@/types/auth';

interface BillingContextValue {
  account: Account | null;
  isLoading: boolean;
  error: string | null;
  isBuyAiCreditsModalOpen: boolean;
  openBuyAiCreditsModal: () => void;
  closeBuyAiCreditsModal: () => void;
  refetchAccount: () => Promise<void>;
}

const BillingContext = createContext<BillingContextValue | undefined>(undefined);

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    user,
    can,
    refreshUser,
  } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(isAuthLoading);
  const [error, setError] = useState<string | null>(null);
  const [isBuyAiCreditsModalOpen, setIsBuyAiCreditsModalOpen] = useState<boolean>(false);

  const openBuyAiCreditsModal = useCallback(() => {
    router.push('/admin/subscription/buy-credits');
  }, [router]);

  const closeBuyAiCreditsModal = useCallback(() => {
    setIsBuyAiCreditsModalOpen(false);
  }, []);

  const refetchAccount = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);
    try {
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar a conta');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, refreshUser]);

  useEffect(() => {
    setIsLoading(isAuthLoading);
    if (!isAuthenticated) setError(null);
  }, [isAuthenticated, isAuthLoading]);

  useEffect(() => {
    if (
      isAuthenticated &&
      user?.account?.subscription.blocked &&
      !pathname.startsWith('/billing/')
    ) {
      router.replace('/billing/canceled');
    }
  }, [isAuthenticated, pathname, router, user?.account?.subscription.blocked]);

  useEffect(() => {
    const unsubscribe = onInsufficientAiCredits(() => {
      if (!isAuthenticated) return;
      void refetchAccount();
      if (can('billing:pay')) {
        router.push('/admin/subscription/buy-credits');
      } else {
        toast.error('Os créditos de IA da clínica acabaram. Contate um administrador.');
      }
    });
    return unsubscribe;
  }, [can, isAuthenticated, refetchAccount, router]);

  return (
    <BillingContext.Provider
      value={{
        account: user?.account ?? null,
        isLoading,
        error,
        isBuyAiCreditsModalOpen,
        openBuyAiCreditsModal,
        closeBuyAiCreditsModal,
        refetchAccount,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
}

export function useBilling(): BillingContextValue {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
}
