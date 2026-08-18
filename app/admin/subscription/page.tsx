'use client';

import {
  AlertTriangle,
  Bot,
  Calendar,
  CheckCircle2,
  Crown,
  Info,
  RefreshCw,
  Sparkles,
  Users,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/app/components/common/badge';
import { ConfirmModal } from '@/app/components/common/confirm-modal';
import {
  DataTable,
  type DataTableColumn,
} from '@/app/components/data/data-table';
import { SectionCard } from '@/app/components/data/section-card';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { AI_OPERATION_LABELS } from '@/constants';
import { useAuth } from '@/infra/auth-context';
import { billingService } from '@/services/billing.service';
import { collaboratorsService } from '@/services/collaborators.service';
import type { AiCredits, AiUsage, Plan, Subscription } from '@/types/billing';
import { formatCurrency } from '@/utils/format';

function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return '—';
  }
}

function formatDateTime(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return '—';
  }
}

export default function AdminSubscriptionPage() {
  const { can } = useAuth();
  const router = useRouter();
  const canPay = can('billing:pay');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [aiCredits, setAiCredits] = useState<AiCredits | null>(null);
  const [aiUsageList, setAiUsageList] = useState<AiUsage[]>([]);
  const [collaboratorsCount, setCollaboratorsCount] = useState<number>(0);
  const [plans, setPlans] = useState<Plan[]>([]);

  async function loadData(showRefreshing = false) {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const [subData, creditsData, usageData, collabData, plansData] =
        await Promise.allSettled([
          billingService.getSubscription(),
          billingService.getAiCredits(),
          billingService.getAiUsage(),
          collaboratorsService.findAll(),
          billingService.listPlans(),
        ]);

      if (subData.status === 'fulfilled') setSubscription(subData.value);
      if (creditsData.status === 'fulfilled') setAiCredits(creditsData.value);
      if (usageData.status === 'fulfilled') setAiUsageList(usageData.value);
      if (collabData.status === 'fulfilled')
        setCollaboratorsCount(collabData.value.length);
      if (plansData.status === 'fulfilled') setPlans(plansData.value);
    } catch {
      toast.error('Erro ao carregar dados da assinatura.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.info('Pagamento recebido. Estamos confirmando seus créditos.');
    } else if (searchParams.get('canceled') === 'true') {
      toast.info('Compra de créditos cancelada.');
    }
  }, [searchParams]);

  useEffect(() => {
    void loadData();
  }, []);

  async function handleCancelSubscription() {
    setCanceling(true);
    try {
      await billingService.cancelSubscription();
      toast.success('Assinatura cancelada com sucesso.');
      setIsCancelModalOpen(false);
      router.replace('/billing/canceled');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao cancelar assinatura.';
      toast.error(errorMessage);
    } finally {
      setCanceling(false);
    }
  }

  // Obter detalhes do plano vinculado
  const currentPlan =
    subscription && typeof subscription.planId === 'object'
      ? (subscription.planId as Plan)
      : plans.find((p) => p.id === subscription?.planId);

  const userLimit = currentPlan?.userLimit ?? 1;
  const additionalSeats = subscription?.additionalUserSeats ?? 0;
  const totalSeats = userLimit + additionalSeats;
  const seatsUsagePercent = Math.min(
    100,
    Math.round((collaboratorsCount / totalSeats) * 100),
  );

  const totalCredits = aiCredits?.totalCredits ?? currentPlan?.aiCredits ?? 0;
  const availableCredits = aiCredits?.availableCredits ?? 0;
  const usedCredits = Math.max(0, totalCredits - availableCredits);
  const creditsUsagePercent =
    totalCredits > 0
      ? Math.min(100, Math.round((usedCredits / totalCredits) * 100))
      : 0;

  const usageColumns: DataTableColumn<AiUsage>[] = [
    {
      key: 'operation',
      header: 'Operação',
      render: (item) => (
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>
            {AI_OPERATION_LABELS[item.operation] ?? 'Processamento IA'}
          </span>
        </div>
      ),
    },
    {
      key: 'charged_credits',
      header: 'Créditos',
      render: (item) => (
        <span className="font-semibold text-foreground">
          {item.charged_credits || item.reserved_credits || 0}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Data/Hora',
      render: (item) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(item.created_at)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        if (item.status === 'completed') {
          return <Badge color="green">Concluído</Badge>;
        }
        if (item.status === 'reserved') {
          return <Badge color="yellow">Em uso</Badge>;
        }
        return <Badge color="red">Falhou</Badge>;
      },
    },
  ];

  function getStatusBadge(status?: string) {
    switch (status) {
    case 'active':
      return <Badge color="green">Ativa</Badge>;
    case 'trialing':
      return <Badge color="blue">Em Teste (Trial)</Badge>;
    case 'past_due':
      return <Badge color="yellow">Cobrança Atrasada</Badge>;
    case 'canceled':
      return <Badge color="red">Cancelada</Badge>;
    default:
      return <Badge color="yellow">Pendente</Badge>;
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Header
        title="Plano & Assinatura"
        showStorage={false}
        headerAction={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadData(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              size={16}
              className={refreshing ? 'animate-spin' : ''}
            />
            Atualizar
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-6">
          <div className="rounded-lg bg-card p-4 shadow sm:p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="grid gap-6 md:grid-cols-3 pt-2">
              <Skeleton className="h-28 w-full rounded-lg" />
              <Skeleton className="h-28 w-full rounded-lg" />
              <Skeleton className="h-28 w-full rounded-lg" />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-card p-4 shadow sm:p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
            <div className="rounded-lg bg-card p-4 shadow sm:p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* BANNER SE ESTIVER CANCELADA */}
          {subscription?.status === 'canceled' && (
            <div className="rounded-xl border border-danger/30 bg-danger-soft p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-danger-soft p-2.5 text-danger">
                    <XCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-danger">
                      Assinatura Cancelada
                    </h3>
                    <p className="mt-1 text-sm text-danger">
                      {subscription.canceledAt && (
                        <span>
                          Solicitação efetuada em{' '}
                          <strong>{formatDate(subscription.canceledAt)}</strong>.{' '}
                        </span>
                      )}
                      O acesso ao sistema está bloqueado. Regularize pendências e assine novamente para voltar a usar o VetAI.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BANNER SE ESTIVER TRIALING */}
          {subscription?.status === 'trialing' && (
            <div className="rounded-xl border border-info/30 bg-info-soft p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-info-soft p-2.5 text-info">
                  <Info className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-info">
                    Período de Teste Gratuito (Trial)
                  </h3>
                  <p className="mt-1 text-sm text-info">
                    Aproveite todos os recursos do plano. O período de teste encerra em{' '}
                    <strong>{formatDate(subscription.currentPeriodEnd || subscription.nextRenewalAt)}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* DETALHES DA ASSINATURA ATUAL */}
          <SectionCard
            title="Assinatura Atual"
            subtitle="Informações sobre o plano contratado e faturamento"
            headerAction={
              subscription?.status !== 'canceled' && canPay ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="border-danger/30 text-danger hover:bg-danger-soft hover:text-danger"
                >
                  Cancelar Plano
                </Button>
              ) : null
            }
          >
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-secondary p-4">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Crown size={15} className="text-brand-sun" /> Plano Atual
                </span>
                <span className="text-xl font-bold text-foreground">
                  {currentPlan?.name || 'Plano Personalizado'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {currentPlan?.basePrice || currentPlan?.monthlyPrice
                    ? `${formatCurrency(currentPlan.basePrice ?? currentPlan.monthlyPrice ?? 0)} / mês`
                    : 'Consulte suporte'}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-secondary p-4">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <CheckCircle2 size={15} className="text-primary" /> Status da Assinatura
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(subscription?.status)}
                </div>
                <span className="text-xs text-muted-foreground">
                  {subscription?.status === 'canceled'
                    ? 'Acesso bloqueado até uma nova assinatura'
                    : 'Renovação automática ativada'}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-secondary p-4">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Calendar size={15} className="text-info" /> Data de Renovação / Vigência
                </span>
                <span className="text-xl font-bold text-foreground">
                  {formatDate(
                    subscription?.nextRenewalAt || subscription?.currentPeriodEnd,
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  Ciclo atual: {formatDate(subscription?.currentPeriodStart)} até{' '}
                  {formatDate(subscription?.currentPeriodEnd)}
                </span>
              </div>
            </div>
          </SectionCard>

          {/* RESUMO DOS USOS (KPIS) */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* ASSENTOS / COLABORADORES */}
            <SectionCard
              title="Assentos de Colaboradores"
              subtitle="Usuários ativos cadastrados no sistema"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-3 text-primary">
                      <Users size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Assentos em Uso
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {collaboratorsCount} <span className="text-sm font-normal text-muted-foreground">/ {totalSeats}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {seatsUsagePercent}%
                  </span>
                </div>

                <Progress value={seatsUsagePercent} className="h-3" />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Plano Base: {userLimit} assentos</span>
                  <span>Adicionais: {additionalSeats} assentos</span>
                </div>

                {collaboratorsCount >= totalSeats && (
                  <div className="flex items-center gap-2 rounded-lg bg-warning-soft p-2.5 text-xs text-warning">
                    <AlertTriangle size={16} className="shrink-0" />
                    <span>
                      Você atingiu o limite de assentos contratados no seu plano.
                    </span>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* CRÉDITOS DE IA */}
            <SectionCard
              title="Créditos de Inteligência Artificial"
              subtitle="Consumo de créditos para análises e diagnósticos"
              headerAction={
                canPay ? (
                  <Button
                    size="sm"
                    asChild
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5"
                  >
                    <Link href="/admin/subscription/buy-credits">
                      <Sparkles size={14} />
                      Comprar Créditos
                    </Link>
                  </Button>
                ) : null
              }
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-500/10 p-3 text-indigo-600 dark:text-indigo-400">
                      <Bot size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Créditos Consumidos
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {usedCredits.toLocaleString('pt-BR')}{' '}
                        <span className="text-sm font-normal text-muted-foreground">
                          / {totalCredits.toLocaleString('pt-BR')}
                        </span>
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {creditsUsagePercent}%
                  </span>
                </div>

                <Progress value={creditsUsagePercent} className="h-3" />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Disponíveis: {availableCredits.toLocaleString('pt-BR')} créditos</span>
                  <span>Reservados: {(aiCredits?.reservedCredits ?? 0).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* TABELA DE USOS RECENTES DE IA */}
          <SectionCard
            title="Usos Recentes de IA"
            subtitle="Histórico das últimas operações e diagnósticos processados"
          >
            {aiUsageList.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Nenhum uso recente de Inteligência Artificial registrado neste período.
              </div>
            ) : (
              <DataTable
                data={aiUsageList}
                columns={usageColumns}
                getRowKey={(item) => item.id}
              />
            )}
          </SectionCard>
        </>
      )}

      {/* MODAL CONFIRMAÇÃO DE CANCELAMENTO */}
      {isCancelModalOpen && (
        <ConfirmModal
          title="Cancelar Assinatura"
          description={`Tem certeza de que deseja cancelar a assinatura do plano ${currentPlan?.name || ''}? Seu acesso ao sistema será bloqueado imediatamente. Para voltar, será necessário regularizar pendências e assinar novamente.`}
          confirmLabel="Sim, cancelar plano"
          cancelLabel="Manter plano"
          variant="danger"
          loading={canceling}
          onConfirm={() => void handleCancelSubscription()}
          onClose={() => setIsCancelModalOpen(false)}
        />
      )}
    </div>
  );
}
