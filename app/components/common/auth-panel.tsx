'use client';

import Link from 'next/link';

import { BrandLogo } from '@/app/components/brand/brand-logo';
import { AuthExamAnimation } from '@/app/components/common/auth-exam-animation';

interface AuthPanelProps {
  title: string;
  description: string;
}

export function AuthPanel({ title, description }: AuthPanelProps) {
  return (
    <aside className="relative hidden min-h-0 overflow-hidden bg-teal-800 dark:bg-teal-500 lg:flex">
      <div className="relative z-10 flex w-full flex-col px-12 py-12 xl:px-16">
        <Link href="/" aria-label="VetAI - início" className="shrink-0">
          <BrandLogo light />
        </Link>

        {/* flex-1 + justify-center mantem o bloco centrado na altura restante;
            com justify-between no pai ele afundava para o rodape em telas
            altas, deixando a animacao colada na base. */}
        <div className="flex min-h-0 flex-1 flex-col justify-center py-10">
          <div className="w-full max-w-lg xl:max-w-xl">
            <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-[-0.06em] text-white dark:text-stone-950 xl:text-5xl">
              {title}
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-white/80 dark:text-stone-950/80">
              {description}
            </p>

            <div className="mt-8">
              <AuthExamAnimation />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
