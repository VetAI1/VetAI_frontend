'use client';

import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

import { PreventionContent } from '../../prevention/components/prevention-content';

import { Header } from '@/app/components/layout/header';

export default function PreventionPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.985_0.01_95)] dark:bg-stone-950 w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header title="Prevenção" showStorage={false} />
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-teal-800 dark:text-teal-500" />
            </div>
          }
        >
          <PreventionContent />
        </Suspense>
      </div>
    </div>
  );
}
