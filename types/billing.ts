export interface Plan {
  id: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  basePrice?: number;
  pricePerUser: number;
  userLimit: number;
  aiCredits: number;
  creditPackages?: AiCreditPackageConfig[];
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

export interface Subscription {
  id: string;
  hospitalId: string;
  planId: Plan | string;
  status: 'active' | 'incomplete' | 'past_due' | 'canceled' | 'trialing';
  additionalUserSeats: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextRenewalAt?: string;
  canceledAt?: string;
  aiCreditBalance?: number;
  aiCreditReserved?: number;
}

export interface Invoice {
  id: string;
  hospitalId: string;
  subscriptionId: string;
  paymentProvider: 'stripe';
  paymentMethod: 'card' | 'bank_slip';
  paymentInvoiceId: string;
  paymentInvoiceUrl?: string;
  pdfUrl?: string;
  amount: number;
  userCount: number;
  kind: 'subscription' | 'late_fee';
  status: 'open' | 'paid' | 'uncollectible';
  dueDate: string;
  paidAt?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  hospitalId: string;
  subscriptionId: string;
  invoiceId: string;
  amount: number;
  provider: 'stripe';
  providerPaymentId: string;
  paymentMethod: 'card' | 'bank_slip';
  status: 'paid';
  paidAt: string;
  createdAt: string;
}

export interface BillingStatus {
  subscription: Subscription | null;
  hasPendingInvoices: boolean;
  blocked: boolean;
}

export interface AiCreditPackageConfig {
  id: string;
  name: string;
  credits: number;
  price: number;
}

export interface PurchasedAiCreditPackage {
  id: string;
  packageId: string;
  creditsTotal: number;
  creditsRemaining: number;
  price: number;
  purchasedAt: string;
}

export interface AiCredits {
  totalCredits: number;
  availableCredits: number;
  planCreditsBalance?: number;
  purchasedCreditsBalance?: number;
  reservedCredits: number;
  purchasedPackages?: PurchasedAiCreditPackage[];
  availablePackages?: AiCreditPackageConfig[];
  periodStart: string;
  periodEnd: string;
}

export type AiUsageOperation =
  | 'consultation'
  | 'study_analysis'
  | 'study_prevention';

export interface AiUsage {
  id: string;
  operation: AiUsageOperation;
  source_type: string;
  source_id: string;
  model: string;
  status: 'reserved' | 'completed' | 'failed';
  reserved_credits: number;
  charged_credits: number;
  created_at: string;
}
