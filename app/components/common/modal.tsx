'use client';

import { X } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/infra/utils';

export interface ModalProps {
  title: string;
  description?: string | undefined;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const MAX_WIDTH_MAP = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export function Modal({
  title,
  description,
  children,
  onClose,
  footer,
  maxWidth = 'md',
  className,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative bg-white dark:bg-stone-900 rounded-xl shadow-[var(--shadow-card)] w-full animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col',
          MAX_WIDTH_MAP[maxWidth],
          className,
        )}
      >
        <div className="flex items-start justify-between p-5 border-b border-stone-200 dark:border-stone-800 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Fechar"
            className="ml-4 shrink-0 text-stone-500 dark:text-stone-400"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="shrink-0 border-t border-stone-200 dark:border-stone-800 p-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
