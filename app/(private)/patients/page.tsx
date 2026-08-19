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
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <PawPrint size={18} className="text-primary" />
          </div>
          <p className="font-medium text-foreground">
            {patient.name}
          </p>
        </Link>
      ),
    },
    {
      key: 'specie',
      header: 'Espécie',
      render: (patient) => (
        <span className="text-muted-foreground">
          {SPECIE_LABELS[patient.specie] ?? patient.specie}
        </span>
      ),
    },
    {
      key: 'breed',
      header: 'Raça',
      render: (patient) => (
        <span className="text-muted-foreground">
          {patient.breed ?? '-'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Cadastrado em',
      render: (patient) => (
        <span className="text-muted-foreground">
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
            className="inline text-muted-foreground/50 hover:text-primary transition-colors"
            size={20}
          />
        </Link>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background w-full">
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
              className="bg-primary h-10 text-primary-foreground hover:bg-primary/90"
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
