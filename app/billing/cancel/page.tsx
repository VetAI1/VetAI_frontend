'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function BillingCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Pagamento não concluído
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Nenhuma cobrança foi feita. Você pode escolher um plano novamente quando estiver pronto.
        </p>
        <Button asChild className="mt-6 bg-teal-600 text-white hover:bg-teal-700">
          <Link href="/admin/subscription">Ver planos</Link>
        </Button>
      </section>
    </main>
  );
}
