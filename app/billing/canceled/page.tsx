'use client';

import { AlertTriangle, CreditCard, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { billingService } from '@/services/billing.service';
import type { BillingStatus, Invoice, Plan } from '@/types/billing';
import { formatCurrency } from '@/utils/format';

export default function CanceledSubscriptionPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const pendingInvoices = invoices.filter((invoice) => invoice.status !== 'paid');

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
    <main className="min-h-screen bg-background p-6">
      <section className="mx-auto max-w-3xl space-y-6 py-10">
        <div className="rounded-2xl border border-danger/30 bg-card p-7 shadow-sm">
          <XCircle className="h-10 w-10 text-danger" />
          <h1 className="mt-4 text-2xl font-bold text-foreground">
            {billingStatus?.subscription?.status === 'canceled'
              ? 'Assinatura cancelada'
              : 'Pagamento pendente'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {billingStatus?.subscription?.status === 'canceled'
              ? 'O acesso ao VetAI está bloqueado. Quite as pendências abaixo e escolha um plano para criar uma nova assinatura.'
              : 'O acesso ao VetAI está bloqueado até a confirmação do pagamento. Você pode iniciar um novo Checkout caso o anterior tenha expirado ou sido abandonado.'}
          </p>
        </div>

        {!loading && pendingInvoices.length > 0 && (
          <section className="rounded-2xl border border-warning/40 bg-warning-soft p-6">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
              <div className="w-full">
                <h2 className="font-semibold text-warning">Regularize as pendências</h2>
                <div className="mt-4 space-y-3">
                  {pendingInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-card p-4">
                      <span className="text-sm font-medium text-foreground">{formatCurrency(invoice.amount)}</span>
                      {invoice.paymentInvoiceUrl ? <Button asChild size="sm"><a href={invoice.paymentInvoiceUrl} target="_blank" rel="noreferrer"><CreditCard size={15} /> Pagar pendência</a></Button> : <span className="text-xs text-muted-foreground">Pagamento em processamento</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {!loading && pendingInvoices.length === 0 && (
          <section className="rounded-2xl border border-primary/40 bg-card p-6">
            <h2 className="text-lg font-bold text-foreground">Criar nova assinatura</h2>
            <p className="mt-1 text-sm text-muted-foreground">Escolha um plano para voltar a usar o sistema após a confirmação do pagamento.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {plans.map((plan) => <Button key={plan.id} onClick={() => void restart(plan.id)} className="h-auto justify-between bg-primary py-4 text-left text-primary-foreground hover:bg-primary/90"><span>{plan.name}</span><span>{formatCurrency(plan.monthlyPrice)}/mês</span></Button>)}
            </div>
          </section>
        )}
        <Link href="/login" className="block text-center text-sm text-primary hover:underline">Voltar para login</Link>
      </section>
    </main>
  );
}
