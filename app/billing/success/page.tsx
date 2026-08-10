'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {confirmed ? <CheckCircle2 className="mx-auto h-12 w-12 text-teal-600" /> : <Loader2 className="mx-auto h-12 w-12 animate-spin text-teal-600" />}
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
          {confirmed ? 'Pagamento confirmado' : 'Confirmando seu pagamento'}
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          {confirmed
            ? 'Sua assinatura está ativa e o acesso ao VetAI foi liberado.'
            : timedOut
              ? 'Ainda estamos confirmando o pagamento. Atualize esta página em alguns instantes.'
              : 'A confirmação pode levar alguns segundos. Não feche esta página.'}
        </p>
        {confirmed && (
          <Button asChild className="mt-6 bg-teal-600 text-white hover:bg-teal-700">
            <Link href="/analytics/dashboard">Entrar no VetAI</Link>
          </Button>
        )}
      </section>
    </main>
  );
}
