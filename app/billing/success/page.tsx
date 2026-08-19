'use client';

import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { billingService } from '@/services/billing.service';

export default function BillingSuccessPage() {
  const [confirmed, setConfirmed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const confirm = async () => {
      try {
        const subscription = await billingService.getSubscription();
        if (subscription.status === 'active') {
          if (!cancelled) setConfirmed(true);
          return;
        }
      } catch {
        // The Stripe webhook can arrive after the customer returns from Checkout.
      }
      attempts += 1;
      if (attempts >= 12) {
        if (!cancelled) setTimedOut(true);
        return;
      }
      window.setTimeout(() => void confirm(), 2500);
    };
    void confirm();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen w-full bg-[oklch(0.985_0.01_95)] dark:bg-stone-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div
          className="w-full max-w-lg rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 text-center sm:p-6"
          aria-live="polite"
        >
          {confirmed ? (
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-700 dark:text-emerald-500" />
          ) : timedOut ? (
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-600 dark:text-amber-400" />
          ) : (
            <div aria-busy="true">
              <span className="sr-only">Confirmando seu pagamento</span>
              <Skeleton className="mx-auto size-12 rounded-full" />
            </div>
          )}
          <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-100">
            {confirmed ? 'Pagamento confirmado' : 'Confirmando seu pagamento'}
          </h1>
          <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
            {confirmed
              ? 'Sua assinatura está ativa e o acesso ao VetAI foi liberado.'
              : timedOut
                ? 'Ainda estamos confirmando o pagamento. Atualize esta página em alguns instantes.'
                : 'A confirmação pode levar alguns segundos. Não feche esta página.'}
          </p>
          {confirmed && (
            <Button asChild className="mt-6">
              <Link href="/analytics/dashboard">Entrar no VetAI</Link>
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}
