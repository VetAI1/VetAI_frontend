'use client';

import { Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmModal } from '@/app/components/common/confirm-modal';
import {
  DataTable,
  type DataTableColumn,
} from '@/app/components/data/data-table';
import { SectionCard } from '@/app/components/data/section-card';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/infra/auth-context';
import { rolesService } from '@/services/roles.service';
import type { Role } from '@/types/settings';

export default function AdminRoles() {
  const { can } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleToRemove, setRoleToRemove] = useState<Role | null>(null);
  const [removing, setRemoving] = useState(false);
  const canEdit = can('roles:edit');

  async function load() {
    setLoading(true);
    try {
      setRoles(await rolesService.findAll());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function removeRole(role: Role) {
    setRemoving(true);
    try {
      await rolesService.delete(role.id);
      toast.success('Papel administrativo excluído.');
      setRoleToRemove(null);
      await load();
    } finally {
      setRemoving(false);
    }
  }

  const columns: DataTableColumn<Role>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (role) => (
        <span className="font-medium text-foreground">
          {role.name}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Descrição',
      render: (role) => (
        <span className="text-sm text-muted-foreground">
          {role.description || '-'}
        </span>
      ),
    },
    {
      key: 'permissions',
      header: 'Permissões',
      render: (role) => (
        <span className="text-sm">{role.permissions.length}</span>
      ),
    },
    {
      key: 'collaborators_count',
      header: 'Colaboradores',
      render: (role) => (
        <span className="text-sm">{role.collaborators_count}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: (role) => (
        <div className="flex justify-end gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/roles/${role.id}`}>Abrir</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRoleToRemove(role)}
            disabled={
              !canEdit || role.is_default || role.permissions?.includes('*')
            }
            className="text-danger"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Header title="Papel administrativo" showStorage={false} />

      <SectionCard
        title="Listagem de papéis administrativos"
        subtitle="Crie, visualize e edite permissões e colaboradores"
        headerAction={
          <Button
            asChild
            disabled={!canEdit}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/admin/roles/new">
              <Plus className="h-4 w-4" /> Novo papel
            </Link>
          </Button>
        }
      >
        <DataTable
          columns={columns}
          data={roles}
          getRowKey={(role) => role.id}
          emptyState="Nenhum papel administrativo criado."
          loading={loading}
        />
      </SectionCard>

      {roleToRemove && (
        <ConfirmModal
          title="Excluir papel administrativo"
          description={`O papel ${roleToRemove.name} será removido permanentemente.`}
          confirmLabel="Excluir papel"
          loading={removing}
          onConfirm={() => void removeRole(roleToRemove)}
          onClose={() => setRoleToRemove(null)}
        />
      )}
    </div>
  );
}
