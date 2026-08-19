'use client';

import {
  Eye,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { TutorModal } from './components/tutor-modal';

import { EmptyState } from '@/app/components/common/empty-state';
import { DataTable } from '@/app/components/data/data-table';
import { SectionCard } from '@/app/components/data/section-card';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useConfirmation } from '@/contexts/confirmation-context';
import { useModal } from '@/contexts/modal-context';
import { usePaginatedResource } from '@/hooks/use-paginated-resource';
import { tutorsService } from '@/services/tutors.service';
import type { Tutor } from '@/types/tutor';
import { formatPhone } from '@/utils/masks';

export default function TutorsPage() {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { open } = useModal();
  const { confirm } = useConfirmation();

  const {
    items: tutors,
    meta,
    loading,
    search,
    setSearch,
    prependItem,
    replaceItem,
    removeItem,
  } = usePaginatedResource<Tutor, { search?: string }>({
    fetcher: tutorsService.list,
    initialFilters: { search: '' },
    pageSize: 10,
    debounceMs: 300,
  });

  const handleCreateSuccess = (tutor: Tutor) => {
    prependItem(tutor);
  };

  const handleEditSuccess = (updated: Tutor) => {
    replaceItem((t) => t.id === updated.id, updated);
  };

  const handleDelete = async (tutor: Tutor) => {
    setDeletingId(tutor.id);
    try {
      await tutorsService.delete(tutor.id);
      removeItem((t) => t.id === tutor.id);
    } catch {
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDeleteTutor = (tutor: Tutor) => {
    confirm({
      title: 'Excluir tutor?',
      description: `${tutor.name} será removido permanentemente.`,
      variant: 'danger',
      confirmLabel: 'Excluir',
      onConfirm: () => handleDelete(tutor),
    });
  };

  const openTutorModal = (tutor?: Tutor) => {
    open({
      content: ({ close }) => (
        <TutorModal
          {...(tutor ? { tutor } : {})}
          onClose={close}
          onSuccess={(savedTutor) => {
            if (tutor) {
              handleEditSuccess(savedTutor);
            } else {
              handleCreateSuccess(savedTutor);
            }
            close();
          }}
        />
      ),
    });
  };

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header title="Tutores" showStorage={false} />

        <SectionCard
          title="Tutores cadastrados"
          subtitle={
            loading ? (
              <Skeleton className="h-4 w-36 mt-1" />
            ) : meta ? (
              `${meta.total_elements} tutores no total`
            ) : undefined
          }
          headerAction={
            <Button
              onClick={() => {
                openTutorModal();
              }}
              className="bg-primary h-10 text-primary-foreground hover:bg-primary/90"
            >
              <Plus size={18} /> Novo Tutor
            </Button>
          }
        >
          <DataTable
            headers={[
              'Tutor',
              'CPF',
              'Telefone',
              'E-mail',
              'Cadastrado em',
              'Ações',
            ]}
            columnWidths={['', '', '', '', '', '140px']}
            showSearch={true}
            onSearch={setSearch}
            searchPlaceholder="Buscar por nome..."
            loading={loading}
          >
            {tutors.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4">
                  <EmptyState
                    title={
                      search
                        ? 'Nenhum tutor encontrado'
                        : 'Nenhum tutor cadastrado ainda'
                    }
                    icon={User}
                  />
                </td>
              </tr>
            ) : (
              tutors.map((tutor) => (
                <tr
                  key={tutor.id}
                  className="hover:bg-secondary/60 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User
                          size={16}
                          className="text-primary"
                        />
                      </div>
                      <p className="font-medium text-foreground">
                        {tutor.name}
                      </p>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {tutor.cpf ?? (
                      <span className="text-muted-foreground/70">
                        —
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {tutor.phone ? (
                      <span className="flex items-center gap-1.5">
                        <Phone size={13} className="text-muted-foreground/70" />
                        {formatPhone(tutor.phone)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/70">
                        —
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {tutor.email ? (
                      <span className="flex items-center gap-1.5">
                        <Mail size={13} className="text-muted-foreground/70" />
                        {tutor.email}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/70">
                        —
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(tutor.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/tutors/detail?id=${tutor.id}`}>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Ver detalhes"
                        >
                          <Eye size={15} className="text-primary" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openTutorModal(tutor)}
                        title="Editar"
                      >
                        <Pencil
                          size={15}
                          className="text-muted-foreground"
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => confirmDeleteTutor(tutor)}
                        title="Excluir"
                        disabled={deletingId === tutor.id}
                      >
                        {deletingId === tutor.id ? (
                          <Loader2
                            size={15}
                            className="animate-spin text-danger"
                          />
                        ) : (
                          <Trash2 size={15} className="text-danger" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </DataTable>
        </SectionCard>
      </div>
    </div>
  );
}
