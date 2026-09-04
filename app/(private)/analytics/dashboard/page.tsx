'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { CreditsMeter } from './components/credits-meter';
import { DistributionBars } from './components/distribution-bars';
import { StatCard } from './components/stat-card';
import { TodaySchedule } from './components/today-schedule';
import { TrendChart } from './components/trend-chart';

import { Badge } from '@/app/components/common/badge';
import { EmptyState } from '@/app/components/common/empty-state';
import { DataTable } from '@/app/components/data/data-table';
import { SectionCard } from '@/app/components/data/section-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SPECIE_LABELS, STUDY_STATUS_MAP } from '@/constants';
import { useAuth } from '@/infra/auth-context';
import type { DashboardData } from '@/services/analytics.service';
import { analyticsService } from '@/services/analytics.service';
import { billingService } from '@/services/billing.service';
import { scheduleService } from '@/services/schedule.service';
import type { ScheduleEvent } from '@/types/schedule';
import type { StudyStatus } from '@/types/study';

/**
 * Paleta categórica validada para as duas superfícies do app (branco e
 * stone-900): banda de luminosidade, piso de croma, separação para daltonismo
 * e contraste >= 3:1 passam em light e dark com estes mesmos três tons.
 */
const SERIES_COLORS = {
  patients: '#0d9488',
  consultations: '#d97706',
  studies: '#0284c7',
} as const;

function fmtDate(value: string | undefined | null): string {
  if (!value) return '-';
  const date = new Date(value);
  return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR');
}

function todayIso(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function todayLabel(): string {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/** Variação da metade mais recente da série contra a metade anterior. */
function periodDelta(values: number[]): number | null {
  if (values.length < 4) return null;
  const half = Math.floor(values.length / 2);
  const previous = sum(values.slice(0, half));
  const current = sum(values.slice(half));
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

/** Rótulos vindos como dd/mm/yyyy viram "seg, 12" para caber no eixo. */
function shortDayLabel(label: string): string {
  const [day, month, year] = label.split('/');
  if (!day || !month || !year) return label;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (isNaN(date.getTime())) return label;
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'short' });
  return `${weekday.replace('.', '')} ${day}`;
}

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayEvents, setTodayEvents] = useState<ScheduleEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [credits, setCredits] = useState<{
    available: number;
    total: number;
  } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await analyticsService.getDashboard();
      setData(result);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    async function loadTodayEvents() {
      setEventsLoading(true);
      try {
        const events = await scheduleService.listByDate(todayIso());
        setTodayEvents(events);
      } catch (_) {
        setTodayEvents([]);
      } finally {
        setEventsLoading(false);
      }
    }

    void loadTodayEvents();
  }, []);

  useEffect(() => {
    async function loadCredits() {
      try {
        const result = await billingService.getAiCredits();
        setCredits({
          available: result.availableCredits,
          total: result.totalCredits,
        });
      } catch (_) {
        setCredits(null);
      }
    }

    void loadCredits();
  }, []);

  const patients = data?.latest_patients ?? [];
  const studies = data?.latest_studies ?? [];

  const growthLabels = data?.growth_overtime?.labels ?? [];
  const patientSeries = data?.growth_overtime?.datasets?.[0]?.data ?? [];
  const consultationSeries = data?.growth_overtime?.datasets?.[1]?.data ?? [];

  const firstName = user?.name?.split(' ')[0] ?? '';

  const nextEvent = [...todayEvents]
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
    .find((event) => {
      const now = new Date();
      const [hours, minutes] = event.start_time.split(':').map(Number);
      return (hours ?? 0) * 60 + (minutes ?? 0) >= now.getHours() * 60 + now.getMinutes();
    });

  const trendSeries = [
    {
      label: 'Novos pacientes',
      data: patientSeries,
      color: SERIES_COLORS.patients,
    },
    {
      label: 'Consultas',
      data: consultationSeries,
      color: SERIES_COLORS.consultations,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 md:text-4xl">
            {greeting()}
            {firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="mt-1 text-sm capitalize text-stone-500 dark:text-stone-400">
            {todayLabel()}
          </p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          {loading ? 'Atualizando…' : 'Atualizar'}
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Novos pacientes"
          value={sum(patientSeries)}
          series={patientSeries}
          color={SERIES_COLORS.patients}
          delta={periodDelta(patientSeries)}
          footnote={`${data?.total_patients ?? 0} pacientes no total`}
          loading={loading}
        />
        <StatCard
          label="Consultas"
          value={sum(consultationSeries)}
          series={consultationSeries}
          color={SERIES_COLORS.consultations}
          delta={periodDelta(consultationSeries)}
          footnote={`${data?.total_consultations ?? 0} consultas no total`}
          loading={loading}
        />
        <StatCard
          label="Agendamentos hoje"
          value={todayEvents.length}
          footnote={
            nextEvent
              ? `Próximo às ${nextEvent.start_time}`
              : 'Nenhum compromisso restante'
          }
          loading={eventsLoading}
        />
        <CreditsMeter
          available={credits?.available ?? 0}
          total={credits?.total ?? 0}
          loading={credits === null}
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Movimento da clínica"
          subtitle="Novos pacientes e consultas por dia"
          headerAction={
            <div className="flex flex-wrap gap-2">
              {trendSeries.map((item) => (
                <span
                  key={item.label}
                  className="flex items-center gap-2 rounded-full border border-stone-200 px-3 py-1.5 dark:border-stone-800"
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                    {item.label}
                  </span>
                  <span className="font-data text-xs font-bold text-stone-500 dark:text-stone-400">
                    {sum(item.data)}
                  </span>
                </span>
              ))}
            </div>
          }
        >
          <TrendChart
            labels={growthLabels.map(shortDayLabel)}
            series={trendSeries}
            loading={loading}
            height={300}
          />
        </SectionCard>

        <SectionCard
          title="Agendamentos de hoje"
          subtitle={
            eventsLoading
              ? 'Carregando a agenda'
              : `${todayEvents.length} ${todayEvents.length === 1 ? 'compromisso' : 'compromissos'}`
          }
          headerAction={
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-teal-800 dark:text-teal-500"
              onClick={() => router.push('/schedule')}
            >
              Ver agenda
            </Button>
          }
          className="flex flex-col"
        >
          <div className="max-h-[340px] flex-1 overflow-y-auto pr-1">
            <TodaySchedule events={todayEvents} loading={eventsLoading} />
          </div>
        </SectionCard>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          title="Pacientes por espécie"
          subtitle="Quais animais a clínica mais atende"
        >
          <DistributionBars
            labels={data?.patients_by_specie?.labels ?? []}
            values={data?.patients_by_specie?.datasets?.[0]?.data ?? []}
            color={SERIES_COLORS.patients}
            loading={loading}
            emptyTitle="Nenhum paciente cadastrado"
          />
        </SectionCard>

        <SectionCard
          title="Consultas por status"
          subtitle="Onde os atendimentos estão parados"
        >
          <DistributionBars
            labels={data?.consultations_status?.labels ?? []}
            values={data?.consultations_status?.datasets?.[0]?.data ?? []}
            color={SERIES_COLORS.consultations}
            loading={loading}
            emptyTitle="Nenhuma consulta registrada"
          />
        </SectionCard>

        <SectionCard
          title="Exames por status"
          subtitle="Análises pendentes e concluídas"
        >
          <DistributionBars
            labels={data?.studies_status?.labels ?? []}
            values={data?.studies_status?.datasets?.[0]?.data ?? []}
            color={SERIES_COLORS.studies}
            loading={loading}
            emptyTitle="Nenhum exame enviado"
          />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard
          title="Exames recentes"
          subtitle="Últimos resultados enviados"
          className="flex h-[420px] flex-col"
        >
          <DataTable
            headers={['Data', 'Paciente', 'Título', 'Status', 'Ações']}
            fillHeight
            {...(!loading && studies.length === 0
              ? { tableClassName: 'h-full' }
              : {})}
          >
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="p-4"><Skeleton className="h-4 w-28" /></td>
                  <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="p-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  <td className="p-4"><Skeleton className="ml-auto h-4 w-10" /></td>
                </tr>
              ))
            ) : studies.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4">
                  <EmptyState title="Nenhum exame ainda" />
                </td>
              </tr>
            ) : (
              studies.map((study) => {
                const statusInfo = STUDY_STATUS_MAP[
                  study.status as StudyStatus
                ] ?? { label: study.status, color: 'yellow' as const };
                return (
                  <tr
                    key={study.id}
                    className="transition-colors hover:bg-stone-100/40 dark:hover:bg-stone-800/40"
                  >
                    <td className="p-4 text-sm text-stone-500 dark:text-stone-400">
                      {fmtDate(study.examDate ?? study.created_at)}
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
                        {study.patient?.name ?? '-'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-stone-500 dark:text-stone-400">
                      {study.title ?? 'Sem título'}
                    </td>
                    <td className="p-4">
                      <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => router.push(`/exams/${study.id}`)}
                        className="h-auto p-0 text-teal-800 dark:text-teal-500"
                      >
                        Abrir
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </DataTable>
        </SectionCard>

        <SectionCard
          title="Pacientes recentes"
          subtitle="Cadastrados nos últimos dias"
          className="flex h-[420px] flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex flex-col">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex justify-between py-3.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : patients.length === 0 ? (
              <EmptyState title="Nenhum paciente ainda" className="h-full" />
            ) : (
              <ul className="flex flex-col">
                {patients.map((patient, index) => (
                  <li
                    key={patient.id}
                    className={
                      index > 0
                        ? 'border-t border-stone-200 dark:border-stone-800'
                        : ''
                    }
                  >
                    <button
                      type="button"
                      onClick={() => router.push(`/patients/${patient.id}`)}
                      className="flex w-full items-center justify-between gap-3 py-3.5 text-left transition-colors hover:bg-stone-100/40 dark:hover:bg-stone-800/40"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-stone-900 dark:text-stone-100">
                          {patient.name}
                        </span>
                        <span className="block text-xs text-stone-500 dark:text-stone-400">
                          {SPECIE_LABELS[
                            patient.specie as keyof typeof SPECIE_LABELS
                          ] ?? patient.specie}
                        </span>
                      </span>
                      <span className="font-data shrink-0 text-xs text-stone-500 dark:text-stone-400">
                        {fmtDate(patient.created_at)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
