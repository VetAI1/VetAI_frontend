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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-warning-soft">
            <Star size={20} className="text-warning" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            Marcar diagnóstico?
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Você ainda não marcou nenhuma doença como a mais provável. Deseja
          continuar sem marcar ou voltar para selecionar?
        </p>
        <div className="flex gap-2 justify-end">
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
    </div>
  );
}
