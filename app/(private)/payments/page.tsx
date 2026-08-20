'use client';

import { CreditCard, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { PaymentModal } from './components/payment-modal';

import { EmptyState } from '@/app/components/common/empty-state';
import {
  DataTable,
  type DataTableColumn,
} from '@/app/components/data/data-table';
import { SectionCard } from '@/app/components/data/section-card';
import { Autocomplete } from '@/app/components/forms/autocomplete';
import { SelectInput } from '@/app/components/forms/select-input';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { useConfirmation } from '@/contexts/confirmation-context';
import { useModal } from '@/contexts/modal-context';
import { useAutoComplete } from '@/hooks/use-auto-complete';
import { usePaginatedResource } from '@/hooks/use-paginated-resource';
import { paymentsService } from '@/services/payments.service';
import { tutorsService } from '@/services/tutors.service';
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  type Payment,
  type PaymentStatus,
} from '@/types/payment';
import type { Tutor } from '@/types/tutor';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Todos os status' },
  ...(Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((s) => ({
    value: s,
    label: PAYMENT_STATUS_LABELS[s],
  })),
];

function fmtDate(iso?: string) {
  if (!iso) return '—';
  try {
    const [datePart] = iso.split('T');
    if (!datePart) return '—';
    const [y, m, d] = datePart.split('-').map(Number);
    if (!y || !m || !d) return '—';
    return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
  } catch {
    return '—';
  }
}

function fmtAmount(amount?: number) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return 'R$ 0,00';
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface PaymentFilters {
  status?: string | undefined;
  tutor_id?: string | undefined;
}

export default function PaymentsPage() {
  const { confirm } = useConfirmation();
  const { open } = useModal();
  const [tutorFilter, setTutorFilter] = useState<Tutor | null>(null);

  const {
    items: payments,
    meta,
    loading,
    page,
    filters,
    setPage,
    setFilters,
    prependItem,
    replaceItem,
    removeItem,
  } = usePaginatedResource<Payment, PaymentFilters>({
    fetcher: paymentsService.list,
    initialFilters: { status: '', tutor_id: '' },
    pageSize: 15,
  });

  const {
    items: tutors,
    search: tutorSearch,
    loading: tutorsLoading,
    loadingMore: tutorsLoadingMore,
    hasMorePage: hasMoreTutors,
    open: tutorFilterOpen,
    setOpen: setTutorFilterOpen,
    setSearch: setTutorSearch,
    loadNextPage: loadNextTutorPage,
  } = useAutoComplete<Tutor>({
    fetcher: tutorsService.list,
    pageSize: 8,
  });

  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({ ...prev, status }));
  };

  const handleTutorSelect = (t: Tutor) => {
    setTutorFilter(t);
    setFilters((prev) => ({ ...prev, tutor_id: t.id }));
  };

  const handleTutorClear = () => {
    setTutorFilter(null);
    setFilters((prev) => ({ ...prev, tutor_id: '' }));
  };

  const openPaymentModal = (payment?: Payment) => open({
    content: ({ close }) => (
      <PaymentModal
        {...(payment ? { payment } : {})}
        onClose={close}
        onSuccess={(updated) => {
          if (payment) replaceItem((item) => item.id === updated.id, updated);
          else prependItem(updated);
          close();
        }}
      />
    ),
  });

  const handleDelete = (payment: Payment) => {
    confirm({
      title: 'Excluir cobrança?',
      description: `Esta cobrança de ${fmtAmount(payment.amount)} será removida permanentemente.`,
      variant: 'danger',
      confirmLabel: 'Excluir',
      onConfirm: async () => {
        await paymentsService.delete(payment.id);
        removeItem((p) => p.id === payment.id);
        toast.success('Cobrança removida com sucesso.');
      },
    });
  };

  const openEdit = (p: Payment) => {
    openPaymentModal(p);
  };

  const totalPages = meta?.total_pages ?? 1;

  const columns: DataTableColumn<Payment>[] = [
    {
      key: 'items',
      header: 'Itens',
      render: (p) => {
        const itemsList = p.items ?? [];
        const [firstItem] = itemsList;
        const extraCount = Math.max(0, itemsList.length - 1);
        const itemsSummary = firstItem
          ? `${firstItem.name}${extraCount > 0 ? ` +${extraCount} item${extraCount > 1 ? 's' : ''}` : ''}`
          : '—';
        return (
          <div>
            <p className="font-medium text-stone-900 dark:text-stone-100">
              {itemsSummary}
            </p>
            {p.notes && (
              <p className="text-xs text-stone-500/70 dark:text-stone-400/70 mt-0.5 truncate max-w-xs">
                {p.notes}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: 'amount',
      header: 'Valor',
      width: '120px',
      render: (p) => (
        <span className="text-stone-800 dark:text-stone-100 font-medium">
          {fmtAmount(p.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (p) => {
        const statusKey = (p.status?.toUpperCase() as PaymentStatus) ?? 'PENDING';
        const colors = PAYMENT_STATUS_COLORS[statusKey] ?? {
          bg: 'bg-stone-100 dark:bg-stone-800',
          text: 'text-stone-800 dark:text-stone-100',
        };
        const label = PAYMENT_STATUS_LABELS[statusKey] ?? p.status ?? 'Pendente';
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
          >
            {label}
          </span>
        );
      },
    },
    {
      key: 'due_date',
      header: 'Vencimento',
      width: '120px',
      render: (p) => (
        <span className="text-stone-500 dark:text-stone-400 text-sm">
          {fmtDate(p.due_date)}
        </span>
      ),
    },
    {
      key: 'paid_at',
      header: 'Pago em',
      width: '120px',
      render: (p) => (
        <span className="text-stone-500 dark:text-stone-400 text-sm">
          {p.paid_at ? (
            fmtDate(p.paid_at)
          ) : (
            <span className="text-stone-500/70 dark:text-stone-400/70">—</span>
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      width: '100px',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => openEdit(p)}
            title="Editar"
          >
            <Pencil size={15} className="text-stone-500 dark:text-stone-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleDelete(p)}
            title="Excluir"
          >
            <Trash2 size={15} className="text-red-600 dark:text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[oklch(0.985_0.01_95)] dark:bg-stone-950 w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header title="Pagamentos" showStorage={false} />

        <SectionCard
          title="Cobranças"
          subtitle={
            meta
              ? `${meta.total_elements} cobrança${meta.total_elements !== 1 ? 's' : ''} no total`
              : 'Carregando...'
          }
          headerAction={
            <Button
              onClick={() => openPaymentModal()}
              className="bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90 h-10"
            >
              <Plus size={18} /> Nova Cobrança
            </Button>
          }
        >
          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="w-56">
              <SelectInput
                value={filters.status ?? ''}
                onChange={handleStatusChange}
                options={STATUS_FILTER_OPTIONS}
                placeholder="Todos os status"
              />
            </div>
            <div className="w-64">
              <Autocomplete
                placeholder="Filtrar por tutor..."
                search={tutorSearch}
                onSearchChange={setTutorSearch}
                items={tutors}
                getOptionLabel={(tutor) => tutor.name}
                getOptionDescription={(tutor) => tutor.email}
                loading={tutorsLoading}
                loadingMore={tutorsLoadingMore}
                hasMorePage={hasMoreTutors}
                onLoadNextPage={loadNextTutorPage}
                open={tutorFilterOpen}
                onOpenChange={setTutorFilterOpen}
                selectedOption={
                  tutorFilter
                    ? {
                      id: tutorFilter.id,
                      label: tutorFilter.name,
                      description: tutorFilter.email,
                    }
                    : null
                }
                onSelect={handleTutorSelect}
                onClear={handleTutorClear}
                emptyMessage="Nenhum tutor encontrado"
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={payments}
            getRowKey={(p) => p.id}
            loading={loading}
            emptyState={
              <EmptyState
                icon={CreditCard}
                title={filters.status || tutorFilter ? 'Nenhuma cobrança encontrada' : 'Nenhuma cobrança cadastrada'}
                description={filters.status || tutorFilter ? 'Revise os filtros selecionados.' : 'Registre a primeira cobrança para começar.'}
              />
            }
          />

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Button
                  key={n}
                  variant={n === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(n)}
                  className={
                    n === page
                      ? 'bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90 border-teal-800 dark:border-teal-500'
                      : ''
                  }
                >
                  {n}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </SectionCard>
      </div>

    </div>
  );
}
