'use client';

import { FileText, History } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState } from 'react';

import { fmtDate, fmtDateTime, RISK_MAP, STATUS_MAP } from '../utils';
import { ReportModal } from './report-modal';

import { EmptyState } from '@/app/components/common/empty-state';
import { DataTable, type DataTableColumn } from '@/app/components/data/data-table';
import { SelectInput } from '@/app/components/forms/select-input';
import { Button } from '@/components/ui/button';
import { usePaginatedResource } from '@/hooks/use-paginated-resource';
import {
  monitoringService,
  type HospitalizationListParams,
} from '@/services/monitoring.service';
import type { PaginatedQueryParams } from '@/types/common';
import type { Hospitalization } from '@/types/monitoring';

interface Filters {
  search?: string;
  status?: string;
  [key: string]: unknown;
}

const FINISHED_STATUSES: Hospitalization['status'][] = [
  'DISCHARGED',
  'DECEASED',
  'CANCELLED',
];

// Internações canceladas não geram prontuário: não houve atendimento.
const REPORT_STATUSES: Hospitalization['status'][] = ['DISCHARGED', 'DECEASED'];

export function HistoryTab() {
  const [reportOf, setReportOf] = useState<Hospitalization | null>(null);
  const fetchHospitalizations = useCallback(
    (params: PaginatedQueryParams<Filters>) =>
      monitoringService.listHospitalizations({
        ...params,
        status: (params.status ||
          undefined) as HospitalizationListParams['status'],
      }),
    [],
  );

  const {
    items,
    loading,
    loadingMore,
    hasMorePage,
    filters,
    setFilters,
    setSearch,
    loadNextPage,
  } = usePaginatedResource<Hospitalization, Filters>({
    fetcher: fetchHospitalizations,
    pageSize: 20,
    mode: 'append',
    debounceMs: 300,
    sort: 'admittedAt',
    direction: 'desc',
  });

  const columns: DataTableColumn<Hospitalization>[] = [
    {
      key: 'patient',
      header: 'Paciente',
      render: (row) => (
        <Link
          href={`/monitoring/${row.id}`}
          className="font-medium text-stone-900 dark:text-stone-100 hover:text-teal-800 dark:hover:text-teal-500"
        >
          {row.patient?.name ?? '—'}
        </Link>
      ),
    },
    {
      key: 'veterinarian',
      header: 'Veterinário',
      render: (row) => (
        <span className="text-stone-500 dark:text-stone-400">
          {row.veterinarian?.name ?? '—'}
        </span>
      ),
    },
    {
      key: 'box',
      header: 'Box',
      render: (row) => (
        <span className="text-stone-500 dark:text-stone-400">
          {row.box?.name ?? '—'}
        </span>
      ),
    },
    {
      key: 'risk',
      header: 'Risco',
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${RISK_MAP[row.risk].badge}`}
        >
          {RISK_MAP[row.risk].label}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Situação',
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_MAP[row.status].badge}`}
        >
          {STATUS_MAP[row.status].label}
        </span>
      ),
    },
    {
      key: 'admitted_at',
      header: 'Entrada',
      render: (row) => (
        <span className="text-stone-500 dark:text-stone-400">
          {fmtDate(row.admitted_at)}
        </span>
      ),
    },
    {
      key: 'discharged_at',
      header: 'Saída',
      align: 'left',
      render: (row) => (
        <span className="text-stone-500 dark:text-stone-400">
          {FINISHED_STATUSES.includes(row.status) && row.discharged_at
            ? fmtDateTime(row.discharged_at)
            : '—'}
        </span>
      ),
    },
    {
      key: 'report',
      header: 'Prontuário',
      align: 'right',
      render: (row) =>
        REPORT_STATUSES.includes(row.status) ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setReportOf(row)}
            title="Abrir prontuário completo da internação"
          >
            <FileText size={14} />
            Abrir
          </Button>
        ) : (
          <span className="text-stone-500/70 dark:text-stone-400/70">—</span>
        ),
    },
  ];

  return (
    <div>
      <DataTable<Hospitalization>
        columns={columns}
        data={items}
        getRowKey={(row) => row.id}
        loading={loading}
        showSearch
        onSearch={setSearch}
        searchPlaceholder="Buscar por paciente..."
        actions={
          <div className="w-48">
            <SelectInput
              compact
              value={filters.status ?? ''}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
              options={[
                { value: '', label: 'Todas as situações' },
                { value: 'TRIAGE', label: 'Triagem' },
                { value: 'HOSPITALIZED', label: 'Internado' },
                { value: 'DISCHARGED', label: 'Alta' },
                { value: 'DECEASED', label: 'Óbito' },
                { value: 'CANCELLED', label: 'Cancelada' },
              ]}
            />
          </div>
        }
        emptyState={
          <EmptyState
            icon={History}
            title="Nenhuma internação encontrada"
          />
        }
      />

      {hasMorePage && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={() => void loadNextPage()}
            loading={loadingMore}
          >
            Carregar mais
          </Button>
        </div>
      )}

      {reportOf && (
        <ReportModal
          hospitalization={reportOf}
          onClose={() => setReportOf(null)}
        />
      )}
    </div>
  );
}
