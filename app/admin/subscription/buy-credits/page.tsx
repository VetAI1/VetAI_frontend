'use client';

import {
  ArrowLeft,
  Check,
  CreditCard,
  Infinity as InfinityIcon,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { SectionCard } from '@/app/components/data/section-card';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-xl border border-primary/40 bg-primary/10 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-lg bg-primary text-primary-foreground">
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
        <div className="bg-card border border-primary/40 px-5 py-2.5 rounded-lg text-center shadow-sm shrink-0">
          <span className="text-xs uppercase tracking-wider text-primary font-semibold block">
            Saldo Disponível
          </span>
          <span className="text-2xl font-bold text-foreground">
            {availableCredits.toLocaleString('pt-BR')} <span className="text-xs font-normal text-muted-foreground">créditos</span>
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
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando pacotes de créditos...</p>
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
                    className={`relative flex flex-col justify-between p-6 rounded-xl border-2 cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/40 bg-card'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4 p-1 rounded-full bg-primary text-primary-foreground">
                        <Check className="h-4 w-4" />
                      </div>
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
                          <span className="text-sm font-normal text-muted-foreground">créditos</span>
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
                  </div>
                );
              })}
            </div>

            {/* CARD DE RESUMO E REDIRECIONAMENTO */}
            {selectedPackage && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-xl border border-border bg-secondary gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="text-sm text-muted-foreground">
                    Pacote selecionado:{' '}
                    <strong className="text-foreground">
                      {selectedPackage.name}
                    </strong>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    +{selectedPackage.credits} Créditos por {formatCurrency(selectedPackage.price)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Você será redirecionado para o ambiente seguro de pagamento (Cartão de Crédito ou Boleto).
                  </p>
                </div>

                <Button
                  size="lg"
                  onClick={handleCheckout}
                  disabled={purchasing}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 shrink-0 w-full sm:w-auto"
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
      <div className="p-5 rounded-xl bg-card border border-border shadow-sm text-xs text-muted-foreground space-y-2">
        <h4 className="font-bold text-foreground text-sm">
          ℹ️ Regras dos Pacotes de Créditos Comprados
        </h4>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            Ao finalizar o pagamento, os créditos são adicionados instantaneamente ao saldo da sua clínica.
          </li>
          <li>
            <strong>Sem prazo de validade</strong>: os créditos comprados valem até serem usados. Na renovação da assinatura eles <strong>não são zerados</strong> e continuam somados aos créditos do mês.
          </li>
          <li>
            Os créditos do plano mensal são consumidos primeiro. Os pacotes comprados só entram em uso após os créditos mensais do plano esgotarem.
          </li>
          <li>
            Cada operação de IA desconta créditos conforme o consumo real do modelo — perguntas curtas custam menos que a análise de um exame completo.
          </li>
        </ul>
      </div>
    </div>
  );
}
