'use client';

import { ArrowLeft, Check, Clock, CreditCard, Loader2, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { SectionCard } from '@/app/components/data/section-card';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { billingService } from '@/services/billing.service';
import type { AiCreditPackageConfig, AiCredits } from '@/types/billing';
import { formatCurrency } from '@/utils/format';

export default function BuyCreditsPage() {
  const [packages, setPackages] = useState<AiCreditPackageConfig[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [aiCredits, setAiCredits] = useState<AiCredits | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [purchasing, setPurchasing] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [creditsData, packagesData] = await Promise.allSettled([
        billingService.getAiCredits(),
        billingService.getAiCreditPackages(),
      ]);

      if (creditsData.status === 'fulfilled') {
        setAiCredits(creditsData.value);
        const availPkgs = creditsData.value?.availablePackages;
        if (availPkgs?.length) {
          setPackages(availPkgs);
          setSelectedPackageId((prev) => prev || availPkgs[0]?.id || '');
        }
      }

      if (packagesData.status === 'fulfilled' && packagesData.value?.length) {
        setPackages(packagesData.value);
        setSelectedPackageId((prev) => prev || packagesData.value[0]?.id || '');
      }
    } catch {
      toast.error('Erro ao carregar pacotes de créditos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleCheckout() {
    if (!selectedPackageId) return;

    setPurchasing(true);
    try {
      const result = await billingService.purchaseAiCredits(selectedPackageId);
      if (result.url) {
        toast.loading('Iniciando checkout de pagamento...');
        window.location.href = result.url;
      } else {
        toast.error('Não foi possível gerar a sessão de pagamento.');
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Erro ao iniciar o pagamento.';
      toast.error(msg);
    } finally {
      setPurchasing(false);
    }
  }

  const selectedPackage = packages.find((p) => p.id === selectedPackageId);
  const availableCredits = aiCredits?.availableCredits ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-12">
      <Header
        title="Comprar Créditos de IA"
        showStorage={false}
        headerAction={
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex items-center gap-2"
          >
            <Link href="/admin/subscription">
              <ArrowLeft size={16} />
              Voltar para Assinatura
            </Link>
          </Button>
        }
      />

      {/* BANNER SALDO ATUAL */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/5 border border-teal-500/20 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-teal-600 text-white shadow-md">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Seu Saldo Atual de Créditos
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {availableCredits === 0
                ? 'Seus créditos esgotaram. Adquira um novo pacote para continuar gerando análises.'
                : 'Créditos comprados acumulam com os créditos da sua renovação mensal.'}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-900/50 px-5 py-2.5 rounded-xl text-center shadow-sm shrink-0">
          <span className="text-xs uppercase tracking-wider text-teal-600 dark:text-teal-400 font-semibold block">
            Saldo Disponível
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {availableCredits.toLocaleString('pt-BR')} <span className="text-xs font-normal text-slate-500">créditos</span>
          </span>
        </div>
      </div>

      {/* SELEÇÃO DE PACOTES */}
      <SectionCard
        title="Escolha o Pacote Ideal"
        subtitle="Selecione a quantidade de créditos desejada para recarregar sua conta"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <p className="text-sm text-slate-500">Carregando pacotes de créditos...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {packages.map((pkg) => {
                const isSelected = selectedPackageId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`relative flex flex-col justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/40 dark:bg-teal-950/30 shadow-lg ring-2 ring-teal-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4 p-1 rounded-full bg-teal-600 text-white">
                        <Check className="h-4 w-4" />
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                        <span className="text-xs font-bold tracking-wider text-teal-700 dark:text-teal-300 uppercase">
                          {pkg.name}
                        </span>
                      </div>

                      <div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">
                          {pkg.credits}{' '}
                          <span className="text-sm font-normal text-slate-500">créditos</span>
                        </div>
                        <div className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1">
                          {formatCurrency(pkg.price)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="h-4 w-4 text-slate-400" />
                        Válido por {pkg.durabilityDays ?? 30} dias
                      </span>
                      <span className="font-semibold text-teal-600 dark:text-teal-400">
                        Acumulativo
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CARD DE RESUMO E REDIRECIONAMENTO */}
            {selectedPackage && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl bg-slate-900 text-white shadow-xl gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="text-sm text-slate-400">
                    Pacote selecionado: <strong className="text-white">{selectedPackage.name}</strong>
                  </div>
                  <div className="text-2xl font-bold">
                    +{selectedPackage.credits} Créditos por {formatCurrency(selectedPackage.price)}
                  </div>
                  <p className="text-xs text-slate-400">
                    Você será redirecionado para o ambiente seguro de pagamento (Cartão de Crédito ou Boleto).
                  </p>
                </div>

                <Button
                  size="lg"
                  onClick={handleCheckout}
                  disabled={purchasing}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-8 shadow-lg shrink-0 w-full sm:w-auto"
                >
                  {purchasing ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="h-5 w-5 mr-2" />
                  )}
                  Ir para o Pagamento
                </Button>
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* TERMOS E REGRAS DE RETENÇÃO DE CRÉDITOS */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
          ℹ️ Regras dos Pacotes de Créditos Comprados
        </h4>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            Ao finalizar o pagamento, os créditos são adicionados instantaneamente ao saldo da sua clínica.
          </li>
          <li>
            <strong>Retenção na Renovação Mensal</strong>: Quando o ciclo da sua assinatura renovar, os créditos comprados que ainda possuírem validade (30 dias) <strong>não serão zerados</strong> e continuarão disponíveis.
          </li>
          <li>
            Os créditos do plano mensal são consumidos primeiro. Os pacotes comprados só entram em uso após os créditos mensais do plano esgotarem.
          </li>
        </ul>
      </div>
    </div>
  );
}
