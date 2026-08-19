'use client';

import { ChevronRight, PawPrint, Plus } from 'lucide-react';
import Link from 'next/link';

import { PatientModal } from '@/app/components/business/patient-modal';
import { EmptyState } from '@/app/components/common/empty-state';
import {
  DataTable,
  type DataTableColumn,
} from '@/app/components/data/data-table';
import { SectionCard } from '@/app/components/data/section-card';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SPECIE_LABELS } from '@/constants';
import { useModal } from '@/contexts/modal-context';
import { usePaginatedResource } from '@/hooks/use-paginated-resource';
import { patientsService } from '@/services/patients.service';
import type { Patient } from '@/types/patient';

interface PatientFilters {
  search?: string | undefined;
}

export default function PatientsPage() {
  const { open } = useModal();

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
    prependItem(patient);
  };

  const openCreateModal = () => {
    open({
      content: ({ close }) => (
        <PatientModal
          onClose={close}
          onSuccess={(patient) => {
            handleCreateSuccess(patient);
            close();
          }}
        />
      ),
    });
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
          <div className="w-10 h-10 rounded-full bg-teal-800/10 dark:bg-teal-500/10 flex items-center justify-center shrink-0">
            <PawPrint size={18} className="text-teal-800 dark:text-teal-500" />
          </div>
          <p className="font-medium text-stone-900 dark:text-stone-100">
            {patient.name}
          </p>
        </Link>
      ),
    },
    {
      key: 'specie',
      header: 'Espécie',
      render: (patient) => (
        <span className="text-stone-500 dark:text-stone-400">
          {SPECIE_LABELS[patient.specie] ?? patient.specie}
        </span>
      ),
    },
    {
      key: 'breed',
      header: 'Raça',
      render: (patient) => (
        <span className="text-stone-500 dark:text-stone-400">
          {patient.breed ?? '-'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Cadastrado em',
      render: (patient) => (
        <span className="text-stone-500 dark:text-stone-400">
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
            className="inline text-stone-500/50 dark:text-stone-400/50 hover:text-teal-800 dark:hover:text-teal-500 transition-colors"
            size={20}
          />
        </Link>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[oklch(0.985_0.01_95)] dark:bg-stone-950 w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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
              onClick={openCreateModal}
              className="bg-teal-800 dark:bg-teal-500 h-10 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90"
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
              <EmptyState
                icon={PawPrint}
                title={search ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
                description={search ? 'Revise a busca ou tente outro nome.' : 'Cadastre o primeiro paciente para começar.'}
              />
            }
          />
        </SectionCard>
      </div>
    </div>
  );
}
