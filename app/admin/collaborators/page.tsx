'use client';

import { Loader2, Send, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/app/components/common/badge';
import { Modal } from '@/app/components/common/modal';
import {
  DataTable,
  type DataTableColumn,
} from '@/app/components/data/data-table';
import { SectionCard } from '@/app/components/data/section-card';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { SelectInput } from '@/app/components/forms/select-input';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/infra/auth-context';
import { ApiError } from '@/infra/http-client';
import { billingService } from '@/services/billing.service';
import { collaboratorsService } from '@/services/collaborators.service';
import { rolesService } from '@/services/roles.service';
import type { Collaborator, Role } from '@/types/settings';

export default function AdminCollaborators() {
  const { can } = useAuth();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [userLimitError, setUserLimitError] = useState<{
    pricePerUser: number;
    planName: string;
  } | null>(null);
  const canEdit = can('collaborators:edit');

  async function load() {
    setLoading(true);
    try {
      const [collaboratorsData, rolesData] = await Promise.all([
        collaboratorsService.findAll(),
        rolesService.findAll(),
      ]);
      setCollaborators(collaboratorsData);
      setRoles(rolesData);
      setRoleId((current) => current || rolesData[0]?.id || '');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function invite() {
    if (!email.trim() || !roleId) return;
    setSaving(true);
    try {
      await collaboratorsService.invite({
        email: email.trim(),
        role_id: roleId,
      });
      toast.success('Convite enviado.');
      setEmail('');
      setRoleId(roles[0]?.id || '');
      setIsInviteOpen(false);
      await load();
    } catch (error) {
      if (error instanceof ApiError) {
        const data = error.data as {
          code?: string;
          pricePerUser?: number;
          planName?: string;
        };
        if (data.code === 'USER_LIMIT_REACHED') {
          setUserLimitError({
            pricePerUser: data.pricePerUser ?? 0,
            planName: data.planName ?? 'seu plano',
          });
        }
      }
    } finally {
      setSaving(false);
    }
  }

  async function purchaseSeat() {
    setSaving(true);
    try {
      await billingService.purchaseAdditionalUserSeats(1);
      setUserLimitError(null);
      toast.success('Usuário adicional contratado na assinatura Stripe.');
      await invite();
    } finally {
      setSaving(false);
    }
  }

  function formatPrice(cents: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  }

  async function updateRole(collaboratorId: string, nextRoleId: string) {
    await collaboratorsService.updateRole(collaboratorId, nextRoleId);
    toast.success('Papel administrativo atualizado.');
    await load();
  }

  const roleOptions = roles.map((role) => ({
    value: role.id,
    label: role.name,
  }));

  const columns: DataTableColumn<Collaborator>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (c) => (
        <span className="font-medium text-slate-900 dark:text-white">
          {c.name ?? 'Convite pendente'}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'E-mail',
      render: (c) => <span className="text-sm text-slate-500">{c.email}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) =>
        c.status === 'pending' ? (
          <Badge color="yellow">Pendente</Badge>
        ) : (
          <Badge color="green">Ativo</Badge>
        ),
    },
    {
      key: 'role',
      header: 'Papel administrativo',
      render: (c) => {
        if (c.status === 'active') {
          return (
            <SelectInput
              value={c.role_id ?? ''}
              onChange={(value) => void updateRole(c.id, value)}
              options={roleOptions}
              placeholder="Selecione"
              disabled={!canEdit}
              containerClassName="max-w-52"
            />
          );
        }
        return (
          <span className="text-sm text-slate-500">{c.role_name ?? '-'}</span>
        );
      },
    },
  ];

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      <Header
        title="Colaboradores"
        showStorage={false}
        headerAction={
          canEdit ? (
            <Button
              onClick={() => setIsInviteOpen(true)}
              className="bg-teal-600 text-white hover:bg-teal-700"
            >
              <UserPlus className="h-4 w-4" /> Convidar colaborador
            </Button>
          ) : undefined
        }
      />

      <SectionCard
        title="Equipe"
        subtitle="Colaboradores ativos e convites pendentes"
      >
        <DataTable
          columns={columns}
          data={collaborators}
          getRowKey={(c) => c.id}
          emptyState="Nenhum colaborador encontrado."
          loading={loading}
        />
      </SectionCard>

      {isInviteOpen && (
        <Modal
          title="Convidar colaborador"
          description="Defina o papel administrativo antes de enviar o convite"
          maxWidth="sm"
          onClose={() => setIsInviteOpen(false)}
        >
          <div className="space-y-4">
            <InputWithLabel
              label="E-mail"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@exemplo.com"
              disabled={saving}
              required
            />
            <SelectInput
              label="Papel administrativo"
              value={roleId}
              onChange={setRoleId}
              options={roleOptions}
              placeholder="Selecione o papel"
              disabled={saving}
              required
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsInviteOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                onClick={invite}
                disabled={saving || !email.trim() || !roleId}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}{' '}
                Enviar convite
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {userLimitError && (
        <Modal
          title="Limite de usuários atingido"
          description={`${userLimitError.planName} não possui vagas disponíveis para este convite.`}
          maxWidth="sm"
          onClose={() => setUserLimitError(null)}
        >
          <div className="space-y-5">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Contrate mais um usuário por{' '}
              {formatPrice(userLimitError.pricePerUser)}/mês. O valor será
              adicionado à sua assinatura Stripe.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setUserLimitError(null)}
                disabled={saving}
              >
                Agora não
              </Button>
              <Button
                onClick={purchaseSeat}
                loading={saving}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                Contratar usuário
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
