'use client';

import { XCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function BillingCancelPage() {
  return (
    <main className="min-h-screen w-full bg-[oklch(0.985_0.01_95)] dark:bg-stone-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 text-center sm:p-6">
          <XCircle className="mx-auto h-12 w-12 text-amber-600 dark:text-amber-400" />
          <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-100">
            Pagamento não concluído
          </h1>
          <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
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
