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
    <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-sm flex-col overflow-hidden rounded-xl bg-card shadow-2xl">
      <div className="flex shrink-0 items-center gap-3 p-6 pb-4">
        <div className="p-2 rounded-lg bg-warning-soft">
          <Star size={20} className="text-warning" />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          Marcar diagnóstico?
        </h3>
      </div>
      <div className="min-h-0 overflow-y-auto px-6 pb-5">
        <p className="text-sm text-muted-foreground">
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
          className="bg-warning text-white hover:bg-warning/90 dark:text-stone-950"
        >
          Finalizar assim mesmo
        </Button>
      </div>
    </div>
  );
}
