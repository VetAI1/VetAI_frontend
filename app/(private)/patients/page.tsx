'use client';

import { ChevronRight, PawPrint, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { PatientModal } from '@/app/components/business/patient-modal';
import {
  DataTable,
  type DataTableColumn,
} from '@/app/components/data/data-table';
import { SectionCard } from '@/app/components/data/section-card';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SPECIE_LABELS } from '@/constants';
import { usePaginatedResource } from '@/hooks/use-paginated-resource';
import { patientsService } from '@/services/patients.service';
import type { Patient } from '@/types/patient';

interface PatientFilters {
  search?: string | undefined;
}

export default function PatientsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    items: patients,
    meta,
    loading,
    search,
    setSearch,
    prependItem,
  } = usePaginatedResource<Patient, PatientFilters>({
    fetcher: patientsService.list,
    initialFilters: { search: '' },
    pageSize: 10,
    debounceMs: 300,
  });

  const handleCreateSuccess = (patient: Patient) => {
    setShowCreateModal(false);
    prependItem(patient);
  };

  const columns: DataTableColumn<Patient>[] = [
    {
      key: 'name',
      header: 'Animal',
      render: (patient) => (
        <Link
          href={`/patients/detail?id=${patient.id}`}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
            <PawPrint size={18} className="text-teal-600 dark:text-teal-400" />
          </div>
          <p className="font-medium text-slate-900 dark:text-white">
            {patient.name}
          </p>
        </Link>
      ),
    },
    {
      key: 'specie',
      header: 'Espécie',
      render: (patient) => (
        <span className="text-slate-600 dark:text-slate-300">
          {SPECIE_LABELS[patient.specie] ?? patient.specie}
        </span>
      ),
    },
    {
      key: 'breed',
      header: 'Raça',
      render: (patient) => (
        <span className="text-slate-600 dark:text-slate-300">
          {patient.breed ?? '-'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Cadastrado em',
      render: (patient) => (
        <span className="text-slate-600 dark:text-slate-300">
          {new Date(patient.created_at).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '60px',
      render: (patient) => (
        <Link href={`/patients/detail?id=${patient.id}`}>
          <ChevronRight
            className="inline text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            size={20}
          />
        </Link>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <Header title="Pacientes" showStorage={false} />

        <SectionCard
          title="Pacientes cadastrados"
          subtitle={
            loading ? (
              <Skeleton className="h-4 w-36 mt-1" />
            ) : meta ? (
              `${meta.total_elements} pacientes no total`
            ) : undefined
          }
          headerAction={
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-teal-600 dark:bg-teal-700 h-10 text-white hover:bg-teal-700 dark:hover:bg-teal-800"
            >
              <Plus size={18} /> Novo Paciente
            </Button>
          }
        >
          <DataTable
            columns={columns}
            data={patients}
            getRowKey={(patient) => patient.id}
            loading={loading}
            showSearch={true}
            onSearch={setSearch}
            searchPlaceholder="Buscar por nome..."
            emptyState={
              <div className="p-8 text-center">
                <PawPrint
                  size={32}
                  className="text-slate-300 dark:text-slate-600 mx-auto mb-2"
                />
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {search
                    ? 'Nenhum paciente encontrado.'
                    : 'Nenhum paciente cadastrado ainda.'}
                </p>
              </div>
            }
          />
        </SectionCard>
      </div>

      {showCreateModal && (
        <PatientModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}
