'use client';

import {
  AlertTriangle,
  Bot,
  Calendar,
  CheckCircle2,
  Crown,
  Info,
  Loader2,
  RefreshCw,
  Sparkles,
  Users,
  XCircle,
} from 'lucide-react';
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
import { useAuth } from '@/infra/auth-context';
import { billingService } from '@/services/billing.service';
import { collaboratorsService } from '@/services/collaborators.service';
import type { AiCredits, AiUsage, Plan, Subscription } from '@/types/billing';

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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export default function AdminSubscriptionPage() {
  const { can } = useAuth();
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

  useEffect(() => {
    void loadData();
  }, []);

  async function handleCancelSubscription() {
    setCanceling(true);
    try {
      await billingService.cancelSubscription();
      toast.success('Assinatura cancelada com sucesso.');
      setIsCancelModalOpen(false);
      await loadData(true);
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
        <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
          <Sparkles className="h-4 w-4 text-teal-500" />
          <span className="capitalize">
            {item.operation?.replace(/_/g, ' ') || 'Processamento IA'}
          </span>
        </div>
      ),
    },
    {
      key: 'model',
      header: 'Modelo',
      render: (item) => (
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {item.model || 'Gemini'}
        </span>
      ),
    },
    {
      key: 'chargedCredits',
      header: 'Créditos',
      render: (item) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {item.chargedCredits ?? item.reservedCredits ?? 0}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Data/Hora',
      render: (item) => (
        <span className="text-slate-500 text-xs dark:text-slate-400">
          {formatDateTime(item.createdAt)}
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-12">
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
        <div className="flex h-64 items-center justify-center text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : (
        <>
          {/* BANNER SE ESTIVER CANCELADA */}
          {subscription?.status === 'canceled' && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm dark:border-red-900/50 dark:bg-red-950/30">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-red-100 p-2.5 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                    <XCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-red-900 dark:text-red-200">
                      Assinatura Cancelada
                    </h3>
                    <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                      {subscription.canceledAt && (
                        <span>
                          Solicitação efetuada em{' '}
                          <strong>{formatDate(subscription.canceledAt)}</strong>.{' '}
                        </span>
                      )}
                      Seu acesso ao sistema continua <strong>liberado até {formatDate(subscription.currentPeriodEnd || subscription.nextRenewalAt)}</strong> (término do ciclo faturado).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BANNER SE ESTIVER TRIALING */}
          {subscription?.status === 'trialing' && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/30">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-blue-100 p-2.5 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                  <Info className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-blue-900 dark:text-blue-200">
                    Período de Teste Gratuito (Trial)
                  </h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
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
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  Cancelar Plano
                </Button>
              ) : null
            }
          >
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col gap-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <Crown size={15} className="text-amber-500" /> Plano Atual
                </span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {currentPlan?.name || 'Plano Personalizado'}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {currentPlan?.basePrice || currentPlan?.monthlyPrice
                    ? `${formatCurrency(currentPlan.basePrice ?? currentPlan.monthlyPrice ?? 0)} / mês`
                    : 'Consulte suporte'}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <CheckCircle2 size={15} className="text-teal-500" /> Status da Assinatura
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(subscription?.status)}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {subscription?.status === 'canceled'
                    ? `Encerrará em ${formatDate(subscription.currentPeriodEnd || subscription.nextRenewalAt)}`
                    : 'Renovação automática ativada'}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <Calendar size={15} className="text-blue-500" /> Data de Renovação / Vigência
                </span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {formatDate(
                    subscription?.nextRenewalAt || subscription?.currentPeriodEnd,
                  )}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
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
                    <div className="rounded-xl bg-teal-500/10 p-3 text-teal-600 dark:text-teal-400">
                      <Users size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Assentos em Uso
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {collaboratorsCount} <span className="text-sm font-normal text-slate-500">/ {totalSeats}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                    {seatsUsagePercent}%
                  </span>
                </div>

                <Progress value={seatsUsagePercent} className="h-3" />

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Plano Base: {userLimit} assentos</span>
                  <span>Adicionais: {additionalSeats} assentos</span>
                </div>

                {collaboratorsCount >= totalSeats && (
                  <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
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
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-600 dark:text-indigo-400">
                      <Bot size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Créditos Consumidos
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {usedCredits.toLocaleString('pt-BR')}{' '}
                        <span className="text-sm font-normal text-slate-500">
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

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
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
              <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                Nenhum uso recente de Inteligência Artificial registrado neste período.
              </div>
            ) : (
              <DataTable data={aiUsageList} columns={usageColumns} />
            )}
          </SectionCard>
        </>
      )}

      {/* MODAL CONFIRMAÇÃO DE CANCELAMENTO */}
      {isCancelModalOpen && (
        <ConfirmModal
          title="Cancelar Assinatura"
          description={`Tem certeza de que deseja cancelar a assinatura do plano ${currentPlan?.name || ''}? Seu acesso ao sistema continuará disponível normalmente até ${formatDate(subscription?.currentPeriodEnd || subscription?.nextRenewalAt)}.`}
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
