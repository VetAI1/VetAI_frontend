export interface Plan {
  id: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  pricePerUser: number;
  userLimit: number;
  aiCredits: number;
  highlighted: boolean;
  billingMode: 'subscription' | 'invoice';
  paymentMethod: 'card' | 'bank_slip';
  features: Array<{
    key: string;
    label: string;
    description?: string;
  }>;
}

export interface AdditionalUserSeatPurchase {
  additional_user_seats: number;
  user_limit: number;
  price_per_user: number;
}
