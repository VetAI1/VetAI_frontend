import { httpClient } from '@/infra/http-client';
import type {
  AdditionalUserSeatPurchase,
  AiCreditPackageConfig,
  AiCredits,
  AiUsage,
  BillingStatus,
  Invoice,
  Payment,
  Plan,
  Subscription,
} from '@/types/billing';

export const billingService = {
  listPlans: () => httpClient<Plan[]>('billing/plans', { method: 'GET' }),

  getSubscription: () =>
    httpClient<Subscription>('billing/subscription', { method: 'GET' }),

  getInvoices: () =>
    httpClient<Invoice[]>('billing/invoices', { method: 'GET' }),

  getInvoice: (id: string) =>
    httpClient<Invoice>(`billing/invoices/${id}`, { method: 'GET' }),

  getPayments: () =>
    httpClient<Payment[]>('billing/payments', { method: 'GET' }),

  getBillingStatus: () =>
    httpClient<BillingStatus>('billing/status', { method: 'GET' }),

  getAiCredits: () =>
    httpClient<AiCredits>('billing/ai-credits', { method: 'GET' }),

  getAiCreditPackages: () =>
    httpClient<AiCreditPackageConfig[]>('billing/ai-credits/packages', {
      method: 'GET',
    }),

  purchaseAiCredits: (packageId: string) =>
    httpClient<{
      url: string;
      sessionId?: string;
    }>('billing/ai-credits/purchase', {
      method: 'POST',
      body: JSON.stringify({ packageId }),
    }),

  getAiUsage: () =>
    httpClient<AiUsage[]>('billing/ai-usage', { method: 'GET' }),

  purchaseAdditionalUserSeats: (quantity: number) =>
    httpClient<AdditionalUserSeatPurchase>(
      'billing/subscriptions/additional-user-seats',
      {
        method: 'POST',
        body: JSON.stringify({ quantity }),
      },
    ),

  activateAddOn: (addOnId: string) =>
    httpClient<Subscription>(`billing/add-ons/${addOnId}/activate`, {
      method: 'POST',
    }),

  deactivateAddOn: (addOnId: string) =>
    httpClient<Subscription>(`billing/add-ons/${addOnId}`, {
      method: 'DELETE',
    }),

  createSubscriptionCheckout: (planId: string) =>
    httpClient<{ url: string }>(`billing/subscriptions/checkout/${planId}`, {
      method: 'POST',
    }),

  cancelSubscription: () =>
    httpClient<{ canceled: boolean }>('billing/subscriptions/cancel', {
      method: 'POST',
    }),
};
