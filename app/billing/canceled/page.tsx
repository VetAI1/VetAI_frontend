'use client';

import { AlertTriangle, CreditCard, XCircle } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { SectionCard } from '@/app/components/data/section-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { billingService } from '@/services/billing.service';
import type { BillingStatus, Invoice, Plan } from '@/types/billing';
import { formatCurrency } from '@/utils/format';

export default function CanceledSubscriptionPage() {
  const reducedMotion = useReducedMotion();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const pendingInvoices = invoices.filter(
    (invoice) => invoice.status !== 'paid',
  );

  useEffect(() => {
    void Promise.all([
      billingService.getInvoices(),
      billingService.listPlans(),
      billingService.getBillingStatus(),
    ])
      .then(([invoiceData, planData, statusData]) => {
        setInvoices(invoiceData);
        setPlans(planData);
        setBillingStatus(statusData);
      })
      .finally(() => setLoading(false));
  }, []);

  async function restart(planId: string) {
    const checkout = await billingService.createSubscriptionCheckout(planId);
    window.location.assign(checkout.url);
  }

  return (
    <main className="min-h-screen w-full bg-[oklch(0.985_0.01_95)] dark:bg-stone-950">
      <section className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: reducedMotion ? 0 : 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="rounded-lg border border-red-600/30 dark:border-red-500/30 bg-white dark:bg-stone-900 p-5 sm:p-6"
        >
          <XCircle className="h-10 w-10 text-red-600 dark:text-red-500" />
          <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-100">
            {billingStatus?.subscription?.status === 'canceled'
              ? 'Assinatura cancelada'
              : 'Pagamento pendente'}
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            {billingStatus?.subscription?.status === 'canceled'
              ? 'O acesso ao VetAI está bloqueado. Quite as pendências abaixo e escolha um plano para criar uma nova assinatura.'
              : 'O acesso ao VetAI está bloqueado até a confirmação do pagamento. Você pode iniciar um novo Checkout caso o anterior tenha expirado ou sido abandonado.'}
          </p>
        </motion.div>

        {loading && (
          <SectionCard title={<Skeleton className="h-6 w-52" />}>
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </SectionCard>
        )}

        {!loading && pendingInvoices.length > 0 && (
          <SectionCard
            title={
              <span className="text-amber-600 dark:text-amber-400">Regularize as pendências</span>
            }
            className="border-amber-600/40 dark:border-amber-400/40 bg-amber-50 dark:bg-amber-900"
          >
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="w-full">
                <div className="space-y-3">
                  {pendingInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4"
                    >
                      <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
                        {formatCurrency(invoice.amount)}
                      </span>
                      {invoice.paymentInvoiceUrl ? (
                        <Button asChild size="sm">
                          <a
                            href={invoice.paymentInvoiceUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <CreditCard size={15} /> Pagar pendência
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-stone-500 dark:text-stone-400">
                          Pagamento em processamento
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {!loading && pendingInvoices.length === 0 && (
          <SectionCard
            title="Criar nova assinatura"
            subtitle="Escolha um plano para voltar a usar o sistema após a confirmação do pagamento."
            className="border-teal-800/40 dark:border-teal-500/40"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {plans.map((plan) => (
                <Button
                  key={plan.id}
                  onClick={() => void restart(plan.id)}
                  className="h-auto justify-between bg-teal-800 dark:bg-teal-500 py-4 text-left text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90"
                >
                  <span>{plan.name}</span>
                  <span>{formatCurrency(plan.monthlyPrice)}/mês</span>
                </Button>
              ))}
            </div>
          </SectionCard>
        )}
        <Link
          href="/login"
          className="block text-center text-sm text-teal-800 dark:text-teal-500 hover:underline"
        >
          Voltar para login
        </Link>
      </section>
    </main>
  );
}
