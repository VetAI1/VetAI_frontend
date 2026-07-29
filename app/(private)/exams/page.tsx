'use client';

import { Eye, Microscope, UploadIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { UploadExamModal } from '@/app/components/business/upload-exam-modal';
import { Badge } from '@/app/components/common/badge';
import {
  DataTable,
  type DataTableColumn,
} from '@/app/components/data/data-table';
import { SectionCard } from '@/app/components/data/section-card';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { STUDY_STATUS_MAP } from '@/constants';
import { usePaginatedResource } from '@/hooks/use-paginated-resource';
import { studiesService } from '@/services/studies.service';
import type { Study } from '@/types/study';

const STATUS_MAP = STUDY_STATUS_MAP;

interface StudyFilters {
  search?: string | undefined;
}

export default function ExamsPage() {
  const [showUploadModal, setShowUploadModal] = useState(false);

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
    setShowUploadModal(false);
    prependItem(study);
  };

  const columns: DataTableColumn<Study>[] = [
    {
      key: 'title',
      header: 'Título',
      render: (study) => (
        <span className="text-slate-900 dark:text-white font-medium">
          {study.title ?? 'Sem título'}
        </span>
      ),
    },
    {
      key: 'patient',
      header: 'Paciente',
      render: (study) => (
        <span className="text-slate-600 dark:text-slate-300">
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
        <span className="text-slate-600 dark:text-slate-300">
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
            <Eye size={16} className="text-slate-600 dark:text-slate-300" />
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
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
              onClick={() => setShowUploadModal(true)}
              className="bg-teal-600 dark:bg-teal-700 h-10 text-white hover:bg-teal-700 dark:hover:bg-teal-800"
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
              <div className="p-8 text-center">
                <Microscope
                  size={32}
                  className="text-slate-300 dark:text-slate-600 mx-auto mb-2"
                />
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {search
                    ? 'Nenhum exame encontrado.'
                    : 'Nenhum exame cadastrado ainda.'}
                </p>
              </div>
            }
          />
        </SectionCard>
      </div>

      {showUploadModal && (
        <UploadExamModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
