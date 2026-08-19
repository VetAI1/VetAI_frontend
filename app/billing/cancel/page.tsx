'use client';

import { XCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function BillingCancelPage() {
  return (
    <main className="min-h-screen w-full bg-background">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg rounded-lg border border-border bg-card p-5 text-center sm:p-6">
          <XCircle className="mx-auto h-12 w-12 text-warning" />
          <h1 className="mt-4 text-2xl font-bold text-foreground">
            Pagamento não concluído
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Nenhuma cobrança foi feita. Você pode escolher um plano novamente
            quando estiver pronto.
          </p>
          <Button asChild className="mt-6">
            <Link href="/admin/subscription">Ver planos</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
