'use client';

import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { CatalogItemModal } from './components/catalog-item-modal';

import {
  DataTable,
  type DataTableColumn,
} from '@/app/components/data/data-table';
import { SectionCard } from '@/app/components/data/section-card';
import { SelectInput } from '@/app/components/forms/select-input';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { useConfirmation } from '@/contexts/confirmation-context';
import { usePaginatedResource } from '@/hooks/use-paginated-resource';
import { catalogService } from '@/services/catalog.service';
import {
  CATALOG_CATEGORY_COLORS,
  CATALOG_CATEGORY_LABELS,
  type CatalogCategory,
  type CatalogItem,
} from '@/types/catalog';

const CATEGORY_FILTER_OPTIONS = [
  { value: '', label: 'Todas as categorias' },
  ...(Object.keys(CATALOG_CATEGORY_LABELS) as CatalogCategory[]).map((c) => ({
    value: c,
    label: CATALOG_CATEGORY_LABELS[c],
  })),
];

const ACTIVE_FILTER_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Ativos' },
  { value: 'false', label: 'Inativos' },
];

function fmtCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface CatalogFilters {
  category?: CatalogCategory | undefined;
  active?: boolean | undefined;
}

export default function CatalogPage() {
  const { confirm } = useConfirmation();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | undefined>(
    undefined,
  );

  const {
    items,
    meta,
    loading,
    page,
    filters,
    setPage,
    setFilters,
    prependItem,
    replaceItem,
    removeItem,
  } = usePaginatedResource<CatalogItem, CatalogFilters>({
    fetcher: catalogService.list,
    initialFilters: { category: undefined, active: true },
    pageSize: 20,
  });

  const handleCategoryChange = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      category: category ? (category as CatalogCategory) : undefined,
    }));
  };

  const handleActiveChange = (activeStr: string) => {
    setFilters((prev) => ({
      ...prev,
      active: activeStr !== '' ? activeStr === 'true' : undefined,
    }));
  };

  const handleCreateSuccess = (item: CatalogItem) => {
    setShowModal(false);
    prependItem(item);
  };

  const handleEditSuccess = (updated: CatalogItem) => {
    setShowModal(false);
    setEditingItem(undefined);
    replaceItem((i) => i.id === updated.id, updated);
  };

  const handleDelete = (item: CatalogItem) => {
    confirm({
      title: 'Excluir item do catálogo?',
      description: `"${item.name}" será removido permanentemente do catálogo.`,
      variant: 'danger',
      confirmLabel: 'Excluir',
      onConfirm: async () => {
        await catalogService.delete(item.id);
        removeItem((i) => i.id === item.id);
        toast.success('Item removido com sucesso!');
      },
    });
  };

  const openEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(undefined);
  };

  const totalPages = meta?.total_pages ?? 1;

  const columns: DataTableColumn<CatalogItem>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (item) => (
        <div>
          <p className="font-medium text-foreground">
            {item.name}
          </p>
          {item.description && (
            <p className="text-xs text-muted-foreground/70 mt-0.5 truncate max-w-xs">
              {item.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Categoria',
      width: '160px',
      render: (item) => {
        const catColors = CATALOG_CATEGORY_COLORS[item.category];
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${catColors.bg} ${catColors.text}`}
          >
            {CATALOG_CATEGORY_LABELS[item.category]}
          </span>
        );
      },
    },
    {
      key: 'price',
      header: 'Preço',
      width: '130px',
      render: (item) => (
        <span className="text-secondary-foreground font-medium">
          {fmtCurrency(item.price)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      render: (item) =>
        item.active ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-soft text-success">
            Ativo
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground">
            Inativo
          </span>
        ),
    },
    {
      key: 'actions',
      header: 'Ações',
      width: '90px',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => openEdit(item)}
            title="Editar"
          >
            <Pencil size={15} className="text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleDelete(item)}
            title="Excluir"
          >
            <Trash2 size={15} className="text-danger" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header title="Catálogo" showStorage={false} />

        <SectionCard
          title="Produtos e Serviços"
          subtitle={
            meta
              ? `${meta.total_elements} item${meta.total_elements !== 1 ? 's' : ''} no catálogo`
              : 'Carregando...'
          }
          headerAction={
            <Button
              onClick={() => {
                setEditingItem(undefined);
                setShowModal(true);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-10"
            >
              <Plus size={18} /> Novo item
            </Button>
          }
        >
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="w-52">
              <SelectInput
                value={filters.category ?? ''}
                onChange={handleCategoryChange}
                options={CATEGORY_FILTER_OPTIONS}
                placeholder="Todas as categorias"
              />
            </div>
            <div className="w-36">
              <SelectInput
                value={
                  filters.active === undefined
                    ? ''
                    : filters.active
                      ? 'true'
                      : 'false'
                }
                onChange={handleActiveChange}
                options={ACTIVE_FILTER_OPTIONS}
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={items}
            getRowKey={(item) => item.id}
            loading={loading}
            emptyState={
              <div className="p-8 text-center">
                <BookOpen
                  size={32}
                  className="text-muted-foreground/50 mx-auto mb-2"
                />
                <p className="text-muted-foreground text-sm">
                  {filters.category || filters.active !== undefined
                    ? 'Nenhum item encontrado para os filtros selecionados.'
                    : 'Nenhum item no catálogo ainda.'}
                </p>
              </div>
            }
          />

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
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary'
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

      {showModal && (
        <CatalogItemModal
          {...(editingItem ? { item: editingItem } : {})}
          onClose={closeModal}
          onSuccess={editingItem ? handleEditSuccess : handleCreateSuccess}
        />
      )}
    </div>
  );
}
