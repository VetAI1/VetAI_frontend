import Link from 'next/link';
import type { ReactNode } from 'react';

import { AuthPanel } from './auth-panel';

import { BrandLogo } from '@/app/components/brand/brand-logo';
import { cn } from '@/infra/utils';

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  workspaceClassName?: string;
  cardClassName?: string;
  surface?: 'card' | 'plain';
}

export function AuthShell({
  title,
  description,
  children,
  workspaceClassName,
  cardClassName,
  surface = 'card',
}: AuthShellProps) {
  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-background lg:grid lg:h-dvh lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.28] [background-image:radial-gradient(var(--primary)_1px,transparent_1px)] [background-size:20px_20px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-20 size-80 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full bg-brand-sun/10 blur-3xl"
      />

      <AuthPanel title={title} description={description} />

      <main
        className={cn(
          'relative flex min-w-0 justify-center px-4 py-6 sm:px-8 sm:py-10 lg:overflow-y-auto lg:px-10 xl:px-14',
          surface === 'plain' && 'bg-background',
        )}
      >
        <div className={cn('my-auto w-full', workspaceClassName)}>
          <Link
            href="/"
            aria-label="VetAI - início"
            className="mb-6 inline-flex lg:hidden"
          >
            <BrandLogo />
          </Link>

          <div
            className={cn(
              'relative',
              surface === 'card' &&
                'overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-6 shadow-[var(--shadow-card)] backdrop-blur-sm sm:p-8 lg:p-10',
              cardClassName,
            )}
          >
            {surface === 'card' && (
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-primary/35"
              />
            )}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
