'use client';

import { Check, Clock, Loader2, Sparkles, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Modal } from '@/app/components/common/modal';
import { Button } from '@/components/ui/button';
import { billingService } from '@/services/billing.service';
import type { AiCreditPackageConfig, AiCredits } from '@/types/billing';
import { formatCurrency } from '@/utils/format';

interface BuyAiCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiCredits: AiCredits | null;
  onSuccess?: () => void;
}

export function BuyAiCreditsModal({
  isOpen,
  onClose,
  aiCredits,
  onSuccess,
}: BuyAiCreditsModalProps) {
  const [packages, setPackages] = useState<AiCreditPackageConfig[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [purchasing, setPurchasing] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    // Load available packages
    if (aiCredits?.availablePackages && aiCredits.availablePackages.length > 0) {
      setPackages(aiCredits.availablePackages);
      setSelectedPackageId(aiCredits.availablePackages[0]?.id || '');
    } else {
      setLoading(true);
      billingService
        .getAiCreditPackages()
        .then((data) => {
          setPackages(data);
          if (data && data.length > 0) {
            setSelectedPackageId(data[0]?.id || '');
          }
        })
        .catch(() => {
          toast.error('Erro ao carregar pacotes de créditos');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, aiCredits]);

  if (!isOpen) return null;

  async function handlePurchase() {
    if (!selectedPackageId) return;

    setPurchasing(true);
    try {
      const result = await billingService.purchaseAiCredits(selectedPackageId);
      if (result.url) {
        window.location.href = result.url;
      } else {
        toast.success('Sessão de checkout gerada com sucesso!');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Erro ao realizar a compra';
      toast.error(msg);
    } finally {
      setPurchasing(false);
    }
  }

  const currentAvailable = aiCredits?.availableCredits ?? 0;

  return (
    <Modal
      title="Recarregar Créditos de IA"
      description="Escolha um pacote de créditos para continuar utilizando os recursos com IA no VetAI."
      maxWidth="lg"
      onClose={onClose}
    >
      <div className="space-y-6">
        {/* Banner de Créditos Insuficientes / Saldo Atual */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Zap className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                {currentAvailable === 0
                  ? 'Seus créditos de IA esgotaram!'
                  : 'Saldo de créditos reduzido'}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Você tem <strong>{currentAvailable} créditos</strong> disponíveis no momento.
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Pacotes */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <p className="text-sm text-slate-500">Carregando pacotes de créditos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {packages.map((pkg) => {
              const isSelected = selectedPackageId === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackageId(pkg.id)}
                  className={`relative flex flex-col justify-between p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/20 shadow-md ring-2 ring-teal-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 p-1 rounded-full bg-teal-600 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      <span className="text-xs font-semibold tracking-wider text-teal-700 dark:text-teal-300 uppercase">
                        {pkg.name}
                      </span>
                    </div>

                    <div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {pkg.credits} <span className="text-sm font-normal text-slate-500">créditos</span>
                      </div>
                      <div className="text-lg font-semibold text-teal-600 dark:text-teal-400 mt-1">
                        {formatCurrency(pkg.price)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {pkg.durabilityDays ?? 30} dias
                    </span>
                    <span className="font-medium text-teal-600 dark:text-teal-400">
                      Acumulativo
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Informação sobre Retenção dos Créditos */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p className="font-medium text-slate-700 dark:text-slate-300">
            ℹ️ Como funcionam os créditos comprados?
          </p>
          <p>
            • Ao comprar um pacote, os créditos são adicionados imediatamente ao seu saldo.
          </p>
          <p>
            • Quando sua assinatura renovar no final do mês, <strong>seus créditos comprados não expirados serão mantidos</strong> e somados aos créditos da nova renovação.
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={purchasing}
          >
            Agora não
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={purchasing || !selectedPackageId}
            className="bg-teal-600 hover:bg-teal-700 text-white min-w-[160px]"
          >
            {purchasing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Comprar Créditos
          </Button>
        </div>
      </div>
    </Modal>
  );
}
