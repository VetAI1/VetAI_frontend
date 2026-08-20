'use client';

import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

const REDIRECT_DELAY = 5;

function CancelIcon({ reducedMotion }: { reducedMotion: boolean | null }) {
  return (
    <div className="relative mx-auto size-20">
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-amber-600/15 dark:bg-amber-400/15"
        initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: reducedMotion ? 0 : 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
      <svg viewBox="0 0 52 52" className="relative size-20">
        <motion.circle
          cx="26"
          cy="26"
          r="24"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="stroke-amber-600 dark:stroke-amber-400"
          initial={{ pathLength: 0, rotate: -90 }}
          animate={{ pathLength: 1, rotate: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.6,
            ease: 'easeOut',
          }}
          style={{ transformOrigin: '50% 50%' }}
        />
        <motion.path
          d="M18 18l16 16M34 18l-16 16"
          fill="none"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="stroke-amber-600 dark:stroke-amber-400"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: reducedMotion ? 0 : 0.35,
            delay: reducedMotion ? 0 : 0.4,
            ease: 'easeOut',
          }}
        />
      </svg>
    </div>
  );
}

export default function BillingCancelPage() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_DELAY);

  useEffect(() => {
    if (secondsLeft <= 0) {
      router.push('/admin/subscription');
      return;
    }

    const timer = window.setTimeout(
      () => setSecondsLeft((value) => value - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [secondsLeft, router]);

  return (
    <main className="min-h-screen w-full bg-[oklch(0.985_0.01_95)] dark:bg-stone-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 text-center sm:p-6">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: reducedMotion ? 0 : 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <CancelIcon reducedMotion={reducedMotion} />
            <h1 className="mt-5 text-2xl font-bold text-stone-900 dark:text-stone-100">
              Pagamento não concluído
            </h1>
            <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
              Nenhuma cobrança foi feita. Você pode escolher um plano novamente
              quando estiver pronto.
            </p>
            <Button asChild className="mt-6">
              <Link href="/admin/subscription">Ver planos</Link>
            </Button>
            <div className="mt-6 h-1 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
              <div
                className="h-full rounded-full bg-teal-800 transition-[width] duration-1000 ease-linear dark:bg-teal-500"
                style={{ width: `${(secondsLeft / REDIRECT_DELAY) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
              Redirecionando em {secondsLeft}s...
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
