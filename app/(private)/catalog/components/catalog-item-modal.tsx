'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Modal } from '@/app/components/common/modal';
import { FormTextarea } from '@/app/components/forms/form-textarea';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { SelectInput } from '@/app/components/forms/select-input';
import { Button } from '@/components/ui/button';
import {
  catalogItemSchema,
  type CatalogItemFormData,
} from '@/schemas/catalog';
import { catalogService } from '@/services/catalog.service';
import {
  CATALOG_CATEGORY_LABELS,
  type CatalogCategory,
  type CatalogItem,
  type CreateCatalogItemPayload,
} from '@/types/catalog';

interface CatalogItemModalProps {
  item?: CatalogItem;
  onClose: () => void;
  onSuccess: (item: CatalogItem) => void;
}

const CATEGORY_OPTIONS = (
  Object.keys(CATALOG_CATEGORY_LABELS) as CatalogCategory[]
).map((c) => ({
  value: c,
  label: CATALOG_CATEGORY_LABELS[c],
}));

export function CatalogItemModal({
  item,
  onClose,
  onSuccess,
}: CatalogItemModalProps) {
  const isEditing = !!item;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CatalogItemFormData>({
    resolver: yupResolver(catalogItemSchema) as any,
    defaultValues: {
      name: item?.name ?? '',
      description: item?.description ?? '',
      price: item?.price ?? 0,
      category: item?.category ?? 'SERVICE',
      active: item?.active ?? true,
    },
  });

  const active = watch('active');

  const onSubmit = async (data: CatalogItemFormData) => {
    try {
      const payload: CreateCatalogItemPayload = {
        name: data.name.trim(),
        ...(data.description?.trim()
          ? { description: data.description.trim() }
          : {}),
        price: data.price,
        category: data.category as CatalogCategory,
        active: data.active,
      };
      let result: CatalogItem;
      if (isEditing) {
        result = await catalogService.update(item.id, payload);
        toast.success('Item do catálogo atualizado!');
      } else {
        result = await catalogService.create(payload);
        toast.success('Item adicionado ao catálogo!');
      }
      onSuccess(result);
    } catch {
      toast.error('Erro ao salvar item. Tente novamente.');
    }
  };

  return (
    <Modal
      title={isEditing ? 'Editar item' : 'Novo item do catálogo'}
      description={
        isEditing
          ? 'Atualize as informações do produto ou serviço'
          : 'Adicione um produto ou serviço com seu preço padrão'
      }
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <InputWithLabel
          label="Nome"
          required
          placeholder="Ex: Consulta clínica geral"
          error={errors.name?.message}
          autoFocus
          {...register('name')}
        />

        <div className="grid grid-cols-2 gap-3">
          <InputWithLabel
            label="Preço (R$)"
            required
            type="number"
            step="0.01"
            placeholder="0,00"
            error={errors.price?.message}
            {...register('price', { valueAsNumber: true })}
          />
          <SelectInput
            label="Categoria"
            required
            control={control}
            name="category"
            options={CATEGORY_OPTIONS}
            error={errors.category?.message}
          />
        </div>

        <FormTextarea
          label="Descrição (opcional)"
          placeholder="Detalhes adicionais sobre este item..."
          rows={2}
          control={control}
          name="description"
          error={errors.description?.message}
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={active}
            onClick={() => setValue('active', !active)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
              active ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                active ? 'translate-x-[18px]' : 'translate-x-[3px]'
              }`}
            />
          </button>
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {active
              ? 'Ativo — aparece na seleção de cobranças'
              : 'Inativo — não aparece na seleção'}
          </span>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-teal-600 hover:bg-teal-700 text-white border-teal-600"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isEditing ? (
              'Salvar alterações'
            ) : (
              'Adicionar ao catálogo'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
