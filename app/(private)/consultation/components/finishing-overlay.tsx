import { Loader2 } from 'lucide-react';

export function FinishingOverlay() {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg">
      <Loader2 size={40} className="animate-spin text-primary mb-4" />
      <p className="text-lg font-semibold text-foreground">
        Salvando dados da consulta...
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        Gerando resumo e diagnósticos finais
      </p>
    </div>
  );
}
