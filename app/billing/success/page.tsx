'use client';

import { AlertTriangle } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { billingService } from '@/services/billing.service';

const REDIRECT_DELAY = 4;

function SuccessCheck({ reducedMotion }: { reducedMotion: boolean | null }) {
  return (
    <div className="relative mx-auto size-20">
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-emerald-700/15 dark:bg-emerald-500/15"
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
          className="stroke-emerald-700 dark:stroke-emerald-500"
          initial={{ pathLength: 0, rotate: -90 }}
          animate={{ pathLength: 1, rotate: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.6,
            ease: 'easeOut',
          }}
          style={{ transformOrigin: '50% 50%' }}
        />
        <motion.path
          d="M14 27l8 8 16-16"
          fill="none"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-emerald-700 dark:stroke-emerald-500"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: reducedMotion ? 0 : 0.4,
            delay: reducedMotion ? 0 : 0.45,
            ease: 'easeOut',
          }}
        />
      </svg>
    </div>
  );
}

export default function BillingSuccessPage() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [confirmed, setConfirmed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_DELAY);

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

  useEffect(() => {
    if (!confirmed) return;

    if (secondsLeft <= 0) {
      router.push('/analytics/dashboard');
      return;
    }

    const timer = window.setTimeout(
      () => setSecondsLeft((value) => value - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [confirmed, secondsLeft, router]);

  return (
    <main className="min-h-screen w-full bg-[oklch(0.985_0.01_95)] dark:bg-stone-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div
          className="w-full max-w-lg rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 text-center sm:p-6"
          aria-live="polite"
        >
          {confirmed ? (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: reducedMotion ? 0 : 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <SuccessCheck reducedMotion={reducedMotion} />
              <motion.h1
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.35,
                  delay: reducedMotion ? 0 : 0.55,
                  ease: 'easeOut',
                }}
                className="mt-5 text-2xl font-bold text-stone-900 dark:text-stone-100"
              >
                Pagamento confirmado
              </motion.h1>
              <motion.p
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.35,
                  delay: reducedMotion ? 0 : 0.7,
                  ease: 'easeOut',
                }}
                className="mt-3 text-sm text-stone-500 dark:text-stone-400"
              >
                Sua assinatura está ativa e o acesso ao VetAI foi liberado.
              </motion.p>
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.35,
                  delay: reducedMotion ? 0 : 0.85,
                  ease: 'easeOut',
                }}
              >
                <Button asChild className="mt-6">
                  <Link href="/analytics/dashboard">Entrar no VetAI</Link>
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
            </motion.div>
          ) : timedOut ? (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: reducedMotion ? 0 : 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <AlertTriangle className="mx-auto h-12 w-12 text-amber-600 dark:text-amber-400" />
              <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-100">
                Confirmando seu pagamento
              </h1>
              <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
                Ainda estamos confirmando o pagamento. Atualize esta página em
                alguns instantes.
              </p>
            </motion.div>
          ) : (
            <div aria-busy="true">
              <span className="sr-only">Confirmando seu pagamento</span>
              <Skeleton className="mx-auto size-12 rounded-full" />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
