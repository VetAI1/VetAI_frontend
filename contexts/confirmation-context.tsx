'use client';

import { AlertTriangle, CircleAlert, CircleCheck, type LucideIcon } from 'lucide-react';
import { createContext, useContext, useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { type ModalInstance, useModal } from '@/contexts/modal-context';

type ConfirmationVariant = 'default' | 'alert' | 'danger';

export interface ConfirmationOptions {
  title: string;
  description?: string | undefined;
  variant?: ConfirmationVariant | undefined;
  icon?: LucideIcon | undefined;
  confirmLabel?: string | undefined;
  cancelLabel?: string | undefined;
  closeOnOutsideClick?: boolean | undefined;
  closeOnEscape?: boolean | undefined;
  onConfirm?: (() => void | Promise<void>) | undefined;
  onCancel?: (() => void) | undefined;
}

interface ConfirmationContextValue {
  confirm: (options: ConfirmationOptions) => string;
}

const ConfirmationContext = createContext<ConfirmationContextValue | undefined>(undefined);

const VARIANT_CONFIG: Record<
  ConfirmationVariant,
  { icon: LucideIcon; iconClassName: string; buttonVariant: 'default' | 'destructive' }
> = {
  default: {
    icon: CircleCheck,
    iconClassName: 'bg-primary/10 text-primary',
    buttonVariant: 'default',
  },
  alert: {
    icon: AlertTriangle,
    iconClassName: 'bg-warning-soft text-warning',
    buttonVariant: 'default',
  },
  danger: {
    icon: CircleAlert,
    iconClassName: 'bg-danger-soft text-danger',
    buttonVariant: 'destructive',
  },
};

function ConfirmationDialog({
  options,
  modal,
}: {
  options: ConfirmationOptions;
  modal: ModalInstance;
}) {
  const [loading, setLoading] = useState(false);
  const variant = options.variant ?? 'default';
  const config = VARIANT_CONFIG[variant];
  const Icon = options.icon ?? config.icon;

  const handleConfirm = async () => {
    if (loading) return;

    try {
      setLoading(true);
      await options.onConfirm?.();
      modal.close();
    } catch {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (loading) return;

    options.onCancel?.();
    modal.close();
  };

  return (
    <div className='w-[min(calc(100vw-2rem),26rem)] rounded-xl bg-card p-6 shadow-[var(--shadow-card)]'>
      <div className='flex gap-4'>
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${config.iconClassName}`}>
          <Icon size={20} />
        </div>
        <div className='min-w-0 pt-0.5'>
          <h2 className='text-lg font-bold text-foreground'>{options.title}</h2>
          {options.description && (
            <p className='mt-1 text-sm text-muted-foreground'>
              {options.description}
            </p>
          )}
        </div>
      </div>
      <div className='mt-6 flex justify-end gap-3'>
        <Button variant='outline' onClick={handleCancel} disabled={loading}>
          {options.cancelLabel ?? 'Cancelar'}
        </Button>
        <Button variant={config.buttonVariant} onClick={() => void handleConfirm()} loading={loading}>
          {options.confirmLabel ?? 'Confirmar'}
        </Button>
      </div>
    </div>
  );
}

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const { open } = useModal();

  const confirm = (options: ConfirmationOptions) =>
    open({
      content: (modal) => <ConfirmationDialog options={options} modal={modal} />,
      closeOnOutsideClick: options.closeOnOutsideClick,
      closeOnEscape: options.closeOnEscape,
    });

  return <ConfirmationContext.Provider value={{ confirm }}>{children}</ConfirmationContext.Provider>;
}

export function useConfirmation() {
  const context = useContext(ConfirmationContext);
  if (context === undefined) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider');
  }

  return context;
}
