'use client';

import { Star } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ConfirmFinishModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmFinishModal({
  onConfirm,
  onCancel,
}: ConfirmFinishModalProps) {
  return (
    <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-sm flex-col overflow-hidden rounded-xl bg-white dark:bg-stone-900 shadow-2xl">
      <div className="flex shrink-0 items-center gap-3 p-6 pb-4">
        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900">
          <Star size={20} className="text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          Marcar diagnóstico?
        </h3>
      </div>
      <div className="min-h-0 overflow-y-auto px-6 pb-5">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Você ainda não marcou nenhuma doença como a mais provável. Deseja
          continuar sem marcar ou voltar para selecionar?
        </p>
      </div>
      <div className="flex shrink-0 justify-end gap-2 px-6 py-4">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Voltar e marcar
        </Button>
        <Button
          size="sm"
          onClick={onConfirm}
          className="bg-amber-600 dark:bg-amber-400 text-white hover:bg-amber-600/90 dark:hover:bg-amber-400/90 dark:text-stone-950"
        >
          Finalizar assim mesmo
        </Button>
      </div>
    </div>
  );
}
