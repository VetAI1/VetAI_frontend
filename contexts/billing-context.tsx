'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { useAuth } from '@/infra/auth-context';
import { onInsufficientAiCredits } from '@/infra/http-client';
import { billingService } from '@/services/billing.service';
import type { AiCredits, BillingStatus } from '@/types/billing';

interface BillingContextValue {
  status: BillingStatus | null;
  aiCredits: AiCredits | null;
  isLoading: boolean;
  error: string | null;
  isBuyAiCreditsModalOpen: boolean;
  openBuyAiCreditsModal: () => void;
  closeBuyAiCreditsModal: () => void;
  refetchBilling: () => Promise<void>;
  refetchAiCredits: () => Promise<void>;
}

const BillingContext = createContext<BillingContextValue | undefined>(undefined);

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [aiCredits, setAiCredits] = useState<AiCredits | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isBuyAiCreditsModalOpen, setIsBuyAiCreditsModalOpen] = useState<boolean>(false);

  const openBuyAiCreditsModal = useCallback(() => {
    router.push('/admin/subscription/buy-credits');
  }, [router]);

  const closeBuyAiCreditsModal = useCallback(() => {
    setIsBuyAiCreditsModalOpen(false);
  }, []);

  const refetchAiCredits = useCallback(async () => {
    try {
      const credits = await billingService.getAiCredits();
      setAiCredits(credits);
    } catch {
      // Ignore silently if user is unauthenticated or has no billing permission
    }
  }, []);

  const refetchBilling = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [billingStatus, credits] = await Promise.all([
        billingService.getBillingStatus().catch(() => null),
        billingService.getAiCredits().catch(() => null),
      ]);
      setStatus(billingStatus);
      setAiCredits(credits);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching billing state');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetchBilling();
  }, [refetchBilling]);

  useEffect(() => {
    if (
      isAuthenticated &&
      status?.blocked &&
      !pathname.startsWith('/billing/')
    ) {
      router.replace('/billing/canceled');
    }
  }, [isAuthenticated, pathname, router, status?.blocked]);

  useEffect(() => {
    const unsubscribe = onInsufficientAiCredits(() => {
      router.push('/admin/subscription/buy-credits');
    });
    return unsubscribe;
  }, [router]);

  return (
    <BillingContext.Provider
      value={{
        status,
        aiCredits,
        isLoading,
        error,
        isBuyAiCreditsModalOpen,
        openBuyAiCreditsModal,
        closeBuyAiCreditsModal,
        refetchBilling,
        refetchAiCredits,
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
