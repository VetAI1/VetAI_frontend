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

import { DataTable } from '@/app/components/data/data-table';
import { SectionCard } from '@/app/components/data/section-card';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePaginatedResource } from '@/hooks/use-paginated-resource';
import { tutorsService } from '@/services/tutors.service';
import type { Tutor } from '@/types/tutor';
import { formatPhone } from '@/utils/masks';

export default function TutorsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingTutor, setEditingTutor] = useState<Tutor | undefined>(
    undefined,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteTutor, setConfirmDeleteTutor] = useState<Tutor | null>(
    null,
  );

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
    setShowModal(false);
    prependItem(tutor);
  };

  const handleEditSuccess = (updated: Tutor) => {
    setShowModal(false);
    setEditingTutor(undefined);
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
      setConfirmDeleteTutor(null);
    }
  };

  const openEdit = (tutor: Tutor) => {
    setEditingTutor(tutor);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTutor(undefined);
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
                setEditingTutor(undefined);
                setShowModal(true);
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
                <td colSpan={6} className="p-8 text-center">
                  <User
                    size={32}
                    className="text-muted-foreground/50 mx-auto mb-2"
                  />
                  <p className="text-muted-foreground text-sm">
                    {search
                      ? 'Nenhum tutor encontrado.'
                      : 'Nenhum tutor cadastrado ainda.'}
                  </p>
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
                        onClick={() => openEdit(tutor)}
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
                        onClick={() => setConfirmDeleteTutor(tutor)}
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

      {showModal && (
        <TutorModal
          {...(editingTutor ? { tutor: editingTutor } : {})}
          onClose={closeModal}
          onSuccess={editingTutor ? handleEditSuccess : handleCreateSuccess}
        />
      )}

      {confirmDeleteTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmDeleteTutor(null)}
          />
          <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-foreground mb-2">
              Excluir tutor?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              <strong>{confirmDeleteTutor.name}</strong> será removido
              permanentemente.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteTutor(null)}
                disabled={!!deletingId}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  void handleDelete(confirmDeleteTutor);
                }}
                disabled={!!deletingId}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {deletingId ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'Excluir'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
