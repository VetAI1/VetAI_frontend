'use client';

import {
  ArrowLeft,
  Check,
  CreditCard,
  Infinity as InfinityIcon,
  Sparkles,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { SectionCard } from '@/app/components/data/section-card';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { billingService } from '@/services/billing.service';
import type { AiCreditPackageConfig, AiCredits } from '@/types/billing';
import { formatCurrency } from '@/utils/format';

function formatCreditUnitPrice(pkg: AiCreditPackageConfig): string {
  if (!pkg.credits) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(pkg.price / pkg.credits / 100);
}

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
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
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
        <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-primary/40 bg-primary/10 p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary p-3.5 text-primary-foreground">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Seu Saldo Atual de Créditos
              </h2>
              <p className="text-sm text-muted-foreground">
                {availableCredits === 0
                  ? 'Seus créditos esgotaram. Adquira um novo pacote para continuar gerando análises.'
                  : 'Créditos comprados acumulam com os créditos da sua renovação mensal.'}
              </p>
            </div>
          </div>
          <div className="shrink-0 rounded-lg border border-primary/40 bg-card px-5 py-2.5 text-center">
            <span className="text-xs uppercase tracking-wider text-primary font-semibold block">
              Saldo Disponível
            </span>
            <span className="text-2xl font-bold text-foreground">
              {availableCredits.toLocaleString('pt-BR')}{' '}
              <span className="text-xs font-normal text-muted-foreground">
                créditos
              </span>
            </span>
          </div>
        </div>

        {/* SELEÇÃO DE PACOTES */}
        <SectionCard
          title="Escolha o Pacote Ideal"
          subtitle="Selecione a quantidade de créditos desejada para recarregar sua conta"
        >
          {loading ? (
            <div aria-busy="true" className="grid gap-4 md:grid-cols-3">
              <span className="sr-only">Carregando pacotes de créditos</span>
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          ) : (
            <div className="space-y-6">
              <fieldset>
                <legend className="sr-only">Pacote de créditos</legend>
                <div className="grid gap-4 md:grid-cols-3">
                  {packages.map((pkg) => {
                    const isSelected = selectedPackageId === pkg.id;
                    return (
                      <div key={pkg.id} className="relative">
                        <input
                          id={`credit-package-${pkg.id}`}
                          type="radio"
                          name="credit-package"
                          value={pkg.id}
                          checked={isSelected}
                          onChange={() => setSelectedPackageId(pkg.id)}
                          className="peer sr-only"
                        />
                        <label
                          htmlFor={`credit-package-${pkg.id}`}
                          className="flex min-h-64 cursor-pointer flex-col justify-between rounded-lg border-2 border-border bg-card p-5 transition-colors peer-checked:border-primary peer-checked:bg-primary/10 peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2"
                        >
                          {isSelected && (
                            <span className="absolute right-4 top-4 rounded-full bg-primary p-1 text-primary-foreground">
                              <Check className="h-4 w-4" />
                            </span>
                          )}

                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-primary" />
                              <span className="text-xs font-bold tracking-wider text-primary uppercase">
                                {pkg.name}
                              </span>
                            </div>

                            <div>
                              <div className="text-3xl font-bold text-foreground">
                                {pkg.credits.toLocaleString('pt-BR')}{' '}
                                <span className="text-sm font-normal text-muted-foreground">
                                  créditos
                                </span>
                              </div>
                              <div className="text-xl font-bold text-primary mt-1">
                                {formatCurrency(pkg.price)}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatCreditUnitPrice(pkg)} por crédito
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5 font-medium">
                              <InfinityIcon className="h-4 w-4 text-muted-foreground/70" />
                              Sem prazo de validade
                            </span>
                            <span className="font-semibold text-primary">
                              Acumulativo
                            </span>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </fieldset>

              {/* CARD DE RESUMO E REDIRECIONAMENTO */}
              {selectedPackage && (
                <div className="flex flex-col items-center justify-between gap-4 rounded-lg border border-border bg-secondary p-5 sm:flex-row">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="text-sm text-muted-foreground">
                      Pacote selecionado:{' '}
                      <strong className="text-foreground">
                        {selectedPackage.name}
                      </strong>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      +{selectedPackage.credits} Créditos por{' '}
                      {formatCurrency(selectedPackage.price)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Você será redirecionado para o ambiente seguro de
                      pagamento (Cartão de Crédito ou Boleto).
                    </p>
                  </div>

                  <Button
                    size="lg"
                    onClick={handleCheckout}
                    loading={purchasing}
                    className="w-full shrink-0 px-8 sm:w-auto"
                  >
                    <CreditCard className="h-5 w-5" />
                    Ir para o Pagamento
                  </Button>
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* TERMOS E REGRAS DE RETENÇÃO DE CRÉDITOS */}
        <SectionCard title="Regras dos Pacotes de Créditos Comprados">
          <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
            <li>
              Ao finalizar o pagamento, os créditos são adicionados
              instantaneamente ao saldo da sua clínica.
            </li>
            <li>
              <strong>Sem prazo de validade</strong>: os créditos comprados
              valem até serem usados. Na renovação da assinatura eles{' '}
              <strong>não são zerados</strong> e continuam somados aos créditos
              do mês.
            </li>
            <li>
              Os créditos do plano mensal são consumidos primeiro. Os pacotes
              comprados só entram em uso após os créditos mensais do plano
              esgotarem.
            </li>
            <li>
              Cada operação de IA desconta créditos conforme o consumo real do
              modelo — perguntas curtas custam menos que a análise de um exame
              completo.
            </li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
