'use client';

import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

import { PatientDetailContent } from '../../patients/detail/components/patient-detail-content';

import { Header } from '@/app/components/layout/header';

export default function PatientDetailPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.985_0.01_95)] dark:bg-stone-950 w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header title="Detalhes do Paciente" showStorage={false} />
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-teal-800 dark:text-teal-500" />
            </div>
          }
        >
          <PatientDetailContent />
        </Suspense>
      </div>
    </div>
  );
}
