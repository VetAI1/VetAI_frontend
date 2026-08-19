'use client';

import { ChevronLeft, ChevronRight, Pencil, Plus, Syringe, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { VaccineFormModal } from './components/vaccine-form-modal';

import { ConfirmModal } from '@/app/components/common/confirm-modal';
import { EmptyState } from '@/app/components/common/empty-state';
import {
  DataTable,
  type DataTableColumn,
} from '@/app/components/data/data-table';
import { SectionCard } from '@/app/components/data/section-card';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { usePaginatedResource } from '@/hooks/use-paginated-resource';
import { vaccinesService } from '@/services/vaccines.service';
import type { Vaccine } from '@/types/vaccine';
import { fmtDate, fmtPeriod } from '@/utils/date-format';

export default function VaccinesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editVaccine, setEditVaccine] = useState<Vaccine | null>(null);
  const [deleteVaccine, setDeleteVaccine] = useState<Vaccine | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    items: vaccines,
    loading,
    search,
    page,
    meta,
    setSearch,
    setPage,
    refresh,
  } = usePaginatedResource<Vaccine, { search?: string }>({
    fetcher: vaccinesService.list,
    initialFilters: { search: '' },
    pageSize: 15,
    debounceMs: 300,
  });

  const handleDelete = async () => {
    if (!deleteVaccine) return;
    setDeleting(true);
    try {
      await vaccinesService.delete(deleteVaccine.id);
      setDeleteVaccine(null);
      await refresh();
    } catch {
    } finally {
      setDeleting(false);
    }
  };

  const columns: DataTableColumn<Vaccine>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (vaccine) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-success-soft">
            <Syringe size={15} className="text-success" />
          </div>
          <span className="text-sm font-medium text-foreground">
            {vaccine.name}
          </span>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Código',
      render: (vaccine) => (
        <span className="font-data inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {vaccine.code}
        </span>
      ),
    },
    {
      key: 'revaccination_period_days',
      header: 'Período de Revacinação',
      render: (vaccine) =>
        vaccine.revaccination_period_days ? (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {fmtPeriod(vaccine.revaccination_period_days)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/70">—</span>
        ),
    },
    {
      key: 'created_at',
      header: 'Criado em',
      render: (vaccine) => (
        <span className="text-sm text-muted-foreground">
          {fmtDate(vaccine.created_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: (vaccine) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setEditVaccine(vaccine)}
          >
            <Pencil size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-danger hover:text-danger hover:bg-danger-soft"
            onClick={() => setDeleteVaccine(vaccine)}
          >
            <Trash2 size={15} />
          </Button>
        </div>
      ),
    },
  ];

  const totalPages = meta?.total_pages ?? 1;

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header title="Catálogo de Vacinas" showStorage={false} />

        <SectionCard
          title="Vacinas"
          subtitle={
            meta ? `${meta.total_elements} vacinas no total` : undefined
          }
          headerAction={
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary h-10 text-primary-foreground hover:bg-primary/90"
            >
              <Plus size={18} /> Nova Vacina
            </Button>
          }
        >
          <DataTable
            columns={columns}
            data={vaccines}
            getRowKey={(vaccine) => vaccine.id}
            loading={loading}
            showSearch
            onSearch={setSearch}
            searchPlaceholder="Buscar vacina..."
            emptyState={
              <EmptyState
                icon={Syringe}
                title={search ? 'Nenhuma vacina encontrada' : 'Nenhuma vacina cadastrada'}
                description={search ? 'Revise a busca ou tente outro termo.' : 'Cadastre a primeira vacina para começar.'}
              />
            }
          />

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={15} />
                Anterior
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Próxima
                <ChevronRight size={15} />
              </Button>
            </div>
          )}
        </SectionCard>
      </div>

      {showCreateModal && (
        <VaccineFormModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            void refresh();
          }}
        />
      )}

      {editVaccine && (
        <VaccineFormModal
          vaccine={editVaccine}
          onClose={() => setEditVaccine(null)}
          onSuccess={() => {
            setEditVaccine(null);
            void refresh();
          }}
        />
      )}

      {deleteVaccine && (
        <ConfirmModal
          title="Excluir vacina?"
          description={`A vacina "${deleteVaccine.name}" (${deleteVaccine.code}) será removida permanentemente do catálogo.`}
          confirmLabel="Excluir"
          loading={deleting}
          onConfirm={() => {
            void handleDelete();
          }}
          onClose={() => setDeleteVaccine(null)}
        />
      )}
    </div>
  );
}
