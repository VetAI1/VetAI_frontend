'use client';

import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

import { HospitalizationDetailContent } from './components/hospitalization-detail-content';

import { Header } from '@/app/components/layout/header';

export default function HospitalizationDetailPage() {
  return (
    <div className="min-h-screen bg-background w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header title="Ficha de Internação" showStorage={false} />
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          }
        >
          <HospitalizationDetailContent />
        </Suspense>
      </div>
    </div>
  );
}
