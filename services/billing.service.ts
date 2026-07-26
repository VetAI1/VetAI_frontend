import { httpClient } from '@/infra/http-client';
import type { AdditionalUserSeatPurchase, Plan } from '@/types/billing';

export const billingService = {
  listPlans: () => httpClient<Plan[]>('billing/plans', { method: 'GET' }),
  purchaseAdditionalUserSeats: (quantity: number) =>
    httpClient<AdditionalUserSeatPurchase>(
      'billing/subscriptions/additional-user-seats',
      {
        method: 'POST',
        body: JSON.stringify({ quantity }),
      },
    ),
};
