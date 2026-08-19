'use client';

import { Eye, Microscope, UploadIcon } from 'lucide-react';
import Link from 'next/link';

import { UploadExamModal } from '@/app/components/business/upload-exam-modal';
import { Badge } from '@/app/components/common/badge';
import { EmptyState } from '@/app/components/common/empty-state';
import {
  DataTable,
  type DataTableColumn,
} from '@/app/components/data/data-table';
import { SectionCard } from '@/app/components/data/section-card';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { STUDY_STATUS_MAP } from '@/constants';
import { useModal } from '@/contexts/modal-context';
import { usePaginatedResource } from '@/hooks/use-paginated-resource';
import { studiesService } from '@/services/studies.service';
import type { Study } from '@/types/study';

const STATUS_MAP = STUDY_STATUS_MAP;

interface StudyFilters {
  search?: string | undefined;
}

export default function ExamsPage() {
  const { open } = useModal();

  const {
    items: studies,
    meta,
    loading,
    search,
    setSearch,
    prependItem,
  } = usePaginatedResource<Study, StudyFilters>({
    fetcher: studiesService.list,
    initialFilters: { search: '' },
    pageSize: 10,
    debounceMs: 300,
  });

  const handleUploadSuccess = (study: Study) => {
    prependItem(study);
  };

  const openUploadModal = () => {
    open({
      content: ({ close }) => (
        <UploadExamModal
          onClose={close}
          onSuccess={(study) => {
            handleUploadSuccess(study);
            close();
          }}
        />
      ),
    });
  };

  const columns: DataTableColumn<Study>[] = [
    {
      key: 'title',
      header: 'Título',
      render: (study) => (
        <span className="text-stone-900 dark:text-stone-100 font-medium">
          {study.title ?? 'Sem título'}
        </span>
      ),
    },
    {
      key: 'patient',
      header: 'Paciente',
      render: (study) => (
        <span className="text-stone-500 dark:text-stone-400">
          {study.patient?.name ?? '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (study) => {
        const statusInfo = STATUS_MAP[study.status] ?? {
          label: study.status,
          color: 'yellow' as const,
        };
        return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
      },
    },
    {
      key: 'date',
      header: 'Data',
      render: (study) => (
        <span className="text-stone-500 dark:text-stone-400">
          {study.examDate
            ? new Date(study.examDate).toLocaleDateString('pt-BR')
            : new Date(study.created_at).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      width: '80px',
      render: (study) => (
        <Link href={`/exams/detail?id=${study.id}`}>
          <Button variant="ghost" size="icon-sm" title="Ver detalhes">
            <Eye size={16} className="text-stone-500 dark:text-stone-400" />
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[oklch(0.985_0.01_95)] dark:bg-stone-950 w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header title="Exames" showStorage={false} />

        <SectionCard
          title="Lista de exames"
          subtitle={
            loading ? (
              <Skeleton className="h-4 w-36 mt-1" />
            ) : meta ? (
              `${meta.total_elements} exames no total`
            ) : undefined
          }
          headerAction={
            <Button
              onClick={openUploadModal}
              className="bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90 h-10"
            >
              <UploadIcon size={18} /> Enviar Exame
            </Button>
          }
        >
          <DataTable
            columns={columns}
            data={studies}
            getRowKey={(study) => study.id}
            loading={loading}
            showSearch={true}
            onSearch={setSearch}
            searchPlaceholder="Buscar exames..."
            emptyState={
              <EmptyState
                icon={Microscope}
                title={search ? 'Nenhum exame encontrado' : 'Nenhum exame cadastrado'}
                description={search ? 'Revise a busca ou tente outro termo.' : 'Envie o primeiro exame para começar.'}
              />
            }
          />
        </SectionCard>
      </div>
    </div>
  );
}
