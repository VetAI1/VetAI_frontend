'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function BillingCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">
          Pagamento não concluído
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Nenhuma cobrança foi feita. Você pode escolher um plano novamente quando estiver pronto.
        </p>
        <Button asChild className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/admin/subscription">Ver planos</Link>
        </Button>
      </section>
    </main>
  );
}
