'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { billingService } from '@/services/billing.service';
import type { AiCredits, BillingStatus } from '@/types/billing';

interface BillingContextValue {
  status: BillingStatus | null;
  aiCredits: AiCredits | null;
  isLoading: boolean;
  error: string | null;
  refetchBilling: () => Promise<void>;
  refetchAiCredits: () => Promise<void>;
}

const BillingContext = createContext<BillingContextValue | undefined>(undefined);

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [aiCredits, setAiCredits] = useState<AiCredits | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refetchAiCredits = useCallback(async () => {
    try {
      const credits = await billingService.getAiCredits();
      setAiCredits(credits);
    } catch (err) {
      // Ignore silently if user is unauthenticated or has no billing permission
      console.warn('Failed to fetch AI credits:', err);
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

  return (
    <BillingContext.Provider
      value={{
        status,
        aiCredits,
        isLoading,
        error,
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
