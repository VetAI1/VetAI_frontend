'use client';

import { Suspense } from 'react';

import { HospitalizationDetailContent } from '../../monitoring/detail/components/hospitalization-detail-content';

import { Header } from '@/app/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';

export default function HospitalizationDetailPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.985_0.01_95)] dark:bg-stone-950 w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header title="Ficha de Internação" showStorage={false} />
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 shrink-0" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-6 w-56" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5">
                <Skeleton className="h-5 w-40 mb-4" />
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              </div>
            </div>
          }
        >
          <HospitalizationDetailContent />
        </Suspense>
      </div>
    </div>
  );
}
