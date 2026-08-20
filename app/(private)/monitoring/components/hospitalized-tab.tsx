'use client';

import {
  AlertTriangle,
  BedDouble,
  CalendarClock,
  Loader2,
  PawPrint,
  Plus,
  Search,
  Stethoscope,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { RISK_MAP, STATUS_MAP, daysSince, dayRangeISO, fmtDate, todayLocalISODate } from '../utils';
import { HospitalizeModal } from './hospitalize-modal';
import { SummaryCards } from './summary-cards';

import { SelectInput } from '@/app/components/forms/select-input';
import { Button } from '@/components/ui/button';
import {
  CLINICAL_STATUS_CLASSES,
  CLINICAL_STATUS_LABELS,
  evaluateCadence,
} from '@/constants';
import { usePaginatedResource } from '@/hooks/use-paginated-resource';
import { authService } from '@/services/auth.service';
import { collaboratorsService } from '@/services/collaborators.service';
import {
  monitoringService,
  type HospitalizationListParams,
} from '@/services/monitoring.service';
import type { PaginatedQueryParams } from '@/types/common';
import type {
  Box,
  Hospitalization,
  HospitalizationStatus,
  MonitoringSummary,
} from '@/types/monitoring';
import type { Collaborator } from '@/types/settings';

const GROUP_ORDER: HospitalizationStatus[] = [
  'HOSPITALIZED',
  'TRIAGE',
  'DISCHARGED',
  'DECEASED',
  'CANCELLED',
];

const GROUP_LABELS: Record<HospitalizationStatus, string> = {
  HOSPITALIZED: 'Internados',
  TRIAGE: 'Em triagem',
  DISCHARGED: 'Alta',
  DECEASED: 'Óbito',
  CANCELLED: 'Canceladas',
};

function cadenceFor(hospitalization: Hospitalization) {
  return evaluateCadence(
    hospitalization.monitoring_interval_minutes,
    hospitalization.latest_vitals?.measured_at,
  );
}

interface Filters {
  search?: string;
  status?: string;
  risk?: string;
  veterinarian_id?: string;
  box_id?: string;
  [key: string]: unknown;
}

export function HospitalizedTab() {
  const router = useRouter();
  const [summary, setSummary] = useState<MonitoringSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [showHospitalize, setShowHospitalize] = useState(false);
  const [vets, setVets] = useState<Collaborator[]>([]);
  const [boxes, setBoxes] = useState<Box[]>([]);

  const fetchHospitalizations = useCallback(
    (params: PaginatedQueryParams<Filters>) =>
      monitoringService.listHospitalizations({
        ...params,
        status: (params.status || undefined) as HospitalizationListParams['status'],
        risk: (params.risk || undefined) as HospitalizationListParams['risk'],
        veterinarian_id: params.veterinarian_id || undefined,
        box_id: params.box_id || undefined,
        active: params.status ? undefined : true,
      }),
    [],
  );

  const {
    items: hospitalizations,
    loading,
    loadingMore,
    hasMorePage,
    isEmpty,
    filters,
    setFilters,
    setSearch,
    refresh,
    loadNextPage,
  } = usePaginatedResource<Hospitalization, Filters>({
    fetcher: fetchHospitalizations,
    pageSize: 30,
    mode: 'append',
    debounceMs: 300,
  });

  const groups = useMemo(
    () =>
      GROUP_ORDER.map((groupStatus) => ({
        status: groupStatus,
        items: hospitalizations.filter(
          (hospitalization) => hospitalization.status === groupStatus,
        ),
      })).filter((group) => group.items.length > 0),
    [hospitalizations],
  );

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const { from, to } = dayRangeISO(todayLocalISODate());
      const data = await monitoringService.summary(from, to);
      setSummary(data);
    } catch {
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSummary();
    void Promise.all([
      authService.me().catch(() => null),
      collaboratorsService.findAll().catch(() => [] as Collaborator[]),
    ]).then(([me, collaborators]) => {
      const list = collaborators.filter(
        (c) => c.status === 'active' && c.name,
      );
      if (me && !list.some((c) => c.id === me.id)) {
        list.unshift({
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role_name ?? '',
          status: 'active',
          addedAt: new Date().toISOString(),
        });
      }
      setVets(list);
    });
    void monitoringService
      .listBoxes()
      .then(setBoxes)
      .catch(() => undefined);
  }, [fetchSummary]);

  const handleSuccess = () => {
    setShowHospitalize(false);
    void refresh();
    void fetchSummary();
  };

  return (
    <div>
      <SummaryCards summary={summary} loading={summaryLoading} />

      <div className="bg-white dark:bg-stone-900 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-stone-800 dark:text-stone-100 mb-1.5">
              Buscar paciente
            </label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500/70 dark:text-stone-400/70"
              />
              <input
                type="text"
                placeholder="Nome do paciente..."
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder:text-stone-500/70 dark:placeholder:text-stone-400/70 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:w-[52%]">
            <SelectInput
              label="Situação"
              value={filters.status ?? ''}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
              options={[
                { value: '', label: 'Ativas' },
                { value: 'TRIAGE', label: 'Triagem' },
                { value: 'HOSPITALIZED', label: 'Internado' },
              ]}
            />
            <SelectInput
              label="Risco"
              value={filters.risk ?? ''}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, risk: value }))
              }
              options={[
                { value: '', label: 'Todos' },
                { value: 'LOW', label: 'Baixo' },
                { value: 'MEDIUM', label: 'Moderado' },
                { value: 'HIGH', label: 'Alto' },
              ]}
            />
            <SelectInput
              label="Veterinário"
              value={filters.veterinarian_id ?? ''}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, veterinarian_id: value }))
              }
              options={[
                { value: '', label: 'Todos' },
                ...vets.map((vet) => ({ value: vet.id, label: vet.name ?? '' })),
              ]}
            />
            <SelectInput
              label="Box"
              value={filters.box_id ?? ''}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, box_id: value }))
              }
              options={[
                { value: '', label: 'Todos' },
                ...boxes.map((box) => ({ value: box.id, label: box.name })),
              ]}
            />
          </div>
          <Button
            onClick={() => setShowHospitalize(true)}
            className="bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90 shrink-0"
          >
            <Plus size={16} />
            Internar paciente
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-teal-800 dark:text-teal-500" />
        </div>
      ) : isEmpty ? (
        <div className="bg-white dark:bg-stone-900 rounded-lg shadow p-12 text-center">
          <PawPrint size={48} className="mx-auto text-stone-500/50 dark:text-stone-400/50 mb-4" />
          <p className="text-stone-500 dark:text-stone-400 font-medium">
            Nenhum animal internado no momento
          </p>
          <p className="text-sm text-stone-500/70 dark:text-stone-400/70 mt-1">
            Clique em “Internar paciente” para registrar uma nova internação.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.status}>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${STATUS_MAP[group.status].dot}`}
                  />
                  <h2 className="text-sm font-bold uppercase tracking-wide text-stone-800 dark:text-stone-100">
                    {GROUP_LABELS[group.status]}
                  </h2>
                  <span className="text-xs font-semibold text-stone-500/70 dark:text-stone-400/70">
                    ({group.items.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {group.items.map((hospitalization) => {
                    const risk = RISK_MAP[hospitalization.risk];
                    return (
                      <button
                        key={hospitalization.id}
                        type="button"
                        onClick={() =>
                          router.push(`/monitoring/${hospitalization.id}`)
                        }
                        title={risk.label}
                        className="relative overflow-hidden text-left bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all p-4 pl-6"
                      >
                        <span
                          aria-hidden="true"
                          className={`absolute inset-y-0 left-0 w-2 ${risk.dot}`}
                        />
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-teal-800/10 dark:bg-teal-500/10 text-teal-800 dark:text-teal-500 shrink-0">
                              <Stethoscope size={22} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                                {hospitalization.patient?.name}
                              </p>
                              <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                                {hospitalization.patient?.breed || '—'}
                              </p>
                            </div>
                          </div>
                          {(hospitalization.patient?.restrictions?.length ?? 0) > 0 && (
                            <span
                              title={`Restrições: ${hospitalization.patient.restrictions?.join(', ')}`}
                              className="text-amber-600 dark:text-amber-400 shrink-0"
                            >
                              <AlertTriangle size={18} />
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {hospitalization.clinical_status && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${CLINICAL_STATUS_CLASSES[hospitalization.clinical_status]}`}
                            >
                              {CLINICAL_STATUS_LABELS[hospitalization.clinical_status]}
                            </span>
                          )}
                          {cadenceFor(hospitalization)?.overdue && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-500">
                        Aferição atrasada
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5 text-xs text-stone-500 dark:text-stone-400">
                          <p
                            className="flex items-center gap-1.5"
                            title="Veterinário de plantão"
                          >
                            <Stethoscope size={13} className="text-stone-500/70 dark:text-stone-400/70 shrink-0" />
                            <span className="truncate">
                              {hospitalization.on_duty_veterinarian?.name ??
                                hospitalization.veterinarian?.name ??
                                '—'}
                            </span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <BedDouble size={13} className="text-stone-500/70 dark:text-stone-400/70 shrink-0" />
                            {hospitalization.box?.name ?? 'Sem box'}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <CalendarClock size={13} className="text-stone-500/70 dark:text-stone-400/70 shrink-0" />
                            {daysSince(hospitalization.admitted_at)}{' '}
                            {daysSince(hospitalization.admitted_at) === 1 ? 'dia' : 'dias'} internado
                            {hospitalization.expected_discharge_at
                              ? ` · alta prevista ${fmtDate(hospitalization.expected_discharge_at)}`
                              : ''}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {hasMorePage && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={() => void loadNextPage()}
                loading={loadingMore}
              >
                Carregar mais
              </Button>
            </div>
          )}
        </>
      )}

      {showHospitalize && (
        <HospitalizeModal
          onClose={() => setShowHospitalize(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
