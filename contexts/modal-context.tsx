'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type ModalPosition = 'center' | 'top' | 'right' | 'bottom' | 'left';

export interface ModalInstance {
  id: string;
  close: () => void;
}

export interface OpenModalOptions {
  content: (modal: ModalInstance) => ReactNode;
  position?: ModalPosition | undefined;
  closeOnOutsideClick?: boolean | undefined;
  closeOnEscape?: boolean | undefined;
}

interface ManagedModal extends OpenModalOptions {
  id: string;
  isClosing: boolean;
  returnFocus: HTMLElement | null;
}

interface ModalContextValue {
  open: (options: OpenModalOptions) => string;
  close: (id?: string) => void;
  closeAll: () => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

const POSITION_CLASSES: Record<ModalPosition, string> = {
  center: 'items-center justify-center p-4',
  top: 'items-start justify-center p-4',
  right: 'items-stretch justify-end',
  bottom: 'items-end justify-center p-4',
  left: 'items-stretch justify-start',
};

const ANIMATION_CLASSES: Record<ModalPosition, string> = {
  center: 'animate-in fade-in zoom-in-95 duration-200',
  top: 'animate-in fade-in slide-in-from-top-4 duration-200',
  right: 'animate-in fade-in slide-in-from-right duration-200',
  bottom: 'animate-in fade-in slide-in-from-bottom-4 duration-200',
  left: 'animate-in fade-in slide-in-from-left duration-200',
};

const EXIT_ANIMATION_CLASSES: Record<ModalPosition, string> = {
  center: 'animate-out fade-out zoom-out-95 duration-200',
  top: 'animate-out fade-out slide-out-to-top-4 duration-200',
  right: 'animate-out fade-out slide-out-to-right duration-200',
  bottom: 'animate-out fade-out slide-out-to-bottom-4 duration-200',
  left: 'animate-out fade-out slide-out-to-left duration-200',
};

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<ManagedModal[]>([]);
  const [mounted, setMounted] = useState(false);
  const previousOverflow = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = (id?: string) => {
    setModals((current) => {
      const targetId = id ?? current.findLast((modal) => !modal.isClosing)?.id;
      if (!targetId) return current;

      return current.map((modal) =>
        modal.id === targetId ? { ...modal, isClosing: true } : modal,
      );
    });
  };

  const open = (options: OpenModalOptions) => {
    const id = crypto.randomUUID();
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    setModals((current) => [
      ...current,
      {
        ...options,
        id,
        isClosing: false,
        returnFocus,
      },
    ]);

    return id;
  };

  const closeAll = () => {
    setModals((current) => current.map((modal) => ({ ...modal, isClosing: true })));
  };

  useEffect(() => {
    if (modals.length === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      const topModal = modals.findLast((modal) => !modal.isClosing);
      if (topModal && topModal.closeOnEscape !== false) {
        close(topModal.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modals]);

  useEffect(() => {
    if (modals.length > 0) {
      if (previousOverflow.current === null) {
        previousOverflow.current = document.body.style.overflow;
      }
      document.body.style.overflow = 'hidden';
      return;
    }

    if (previousOverflow.current !== null) {
      document.body.style.overflow = previousOverflow.current;
      previousOverflow.current = null;
    }
  }, [modals.length]);

  useEffect(
    () => () => {
      if (previousOverflow.current !== null) {
        document.body.style.overflow = previousOverflow.current;
      }
    },
    [],
  );

  const removeModal = (modal: ManagedModal) => {
    setModals((current) => current.filter((item) => item.id !== modal.id));
    modal.returnFocus?.focus();
  };

  useEffect(() => {
    const timers = modals
      .filter((modal) => modal.isClosing)
      .map((modal) => window.setTimeout(() => removeModal(modal), 200));

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [modals]);

  return (
    <ModalContext.Provider value={{ open, close, closeAll }}>
      {children}
      {mounted &&
        createPortal(
          modals.map((modal, index) => {
            const isTop = index === modals.length - 1;
            const position = modal.position ?? 'center';
            const instance: ModalInstance = {
              id: modal.id,
              close: () => close(modal.id),
            };

            return (
              <div
                key={modal.id}
                className={`fixed inset-0 flex ${POSITION_CLASSES[position]}`}
                style={{ zIndex: 50 + index }}
              >
                <button
                  type='button'
                  className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${modal.isClosing ? 'animate-out fade-out duration-200' : 'animate-in fade-in duration-200'}`}
                  aria-label='Fechar modal'
                  disabled={!isTop || modal.closeOnOutsideClick === false}
                  onClick={() => close(modal.id)}
                />
                <div
                  className={`relative ${modal.isClosing ? EXIT_ANIMATION_CLASSES[position] : ANIMATION_CLASSES[position]}`}
                  role='dialog'
                  aria-modal='true'
                  tabIndex={-1}
                >
                  {modal.content(instance)}
                </div>
              </div>
            );
          }),
          document.body,
        )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }

  return context;
}
