'use client';

import {
  Check,
  Infinity as InfinityIcon,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react';
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
        <div className="flex items-center justify-between p-4 rounded-xl bg-warning-soft border border-warning/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-warning/10 text-warning">
              <Zap className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-warning">
                {currentAvailable === 0
                  ? 'Seus créditos de IA esgotaram!'
                  : 'Saldo de créditos reduzido'}
              </p>
              <p className="text-xs text-warning">
                Você tem <strong>{currentAvailable} créditos</strong> disponíveis no momento.
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Pacotes */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando pacotes de créditos...</p>
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
                      ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/40 bg-card'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 p-1 rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold tracking-wider text-primary uppercase">
                        {pkg.name}
                      </span>
                    </div>

                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {pkg.credits} <span className="text-sm font-normal text-muted-foreground">créditos</span>
                      </div>
                      <div className="text-lg font-semibold text-primary mt-1">
                        {formatCurrency(pkg.price)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <InfinityIcon className="h-3.5 w-3.5 text-muted-foreground/70" />
                      Sem validade
                    </span>
                    <span className="font-medium text-primary">
                      Acumulativo
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Informação sobre Retenção dos Créditos */}
        <div className="p-3.5 rounded-lg bg-muted border border-border text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">
            ℹ️ Como funcionam os créditos comprados?
          </p>
          <p>
            • Ao comprar um pacote, os créditos são adicionados imediatamente ao seu saldo.
          </p>
          <p>
            • Os créditos comprados <strong>não têm prazo de validade</strong>: valem até serem usados e são somados aos créditos de cada renovação.
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
            className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[160px]"
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
