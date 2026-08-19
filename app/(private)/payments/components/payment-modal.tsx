'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Check, ChevronDown, Loader2, Plus, Search, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Modal } from '@/app/components/common/modal';
import { DateInput } from '@/app/components/forms/date-input';
import { FormTextarea } from '@/app/components/forms/form-textarea';
import { SelectInput } from '@/app/components/forms/select-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAutoComplete } from '@/hooks/use-auto-complete';
import { paymentSchema, type PaymentFormData } from '@/schemas/payment';
import { catalogService } from '@/services/catalog.service';
import { paymentsService } from '@/services/payments.service';
import { tutorsService } from '@/services/tutors.service';
import type { CatalogItem } from '@/types/catalog';
import { CATALOG_CATEGORY_LABELS } from '@/types/catalog';
import {
  PAYMENT_STATUS_LABELS,
  type Payment,
  type PaymentStatus,
} from '@/types/payment';
import type { Tutor } from '@/types/tutor';

interface PaymentModalProps {
  payment?: Payment;
  defaultTutor?: { id: string; name: string };
  onClose: () => void;
  onSuccess: (payment: Payment) => void;
}

const inputCls =
  'w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-500/70 dark:placeholder:text-stone-400/70 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-teal-500';

const STATUS_OPTIONS = (
  Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]
).map((s) => ({
  value: s,
  label: PAYMENT_STATUS_LABELS[s],
}));

interface TutorItem {
  id: string;
  name: string;
  phone?: string;
}

function TutorComboBox({
  value,
  onSelect,
  onClear,
  disabled,
}: {
  value: TutorItem | null;
  onSelect: (t: TutorItem) => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const {
    items: results,
    search: query,
    loading,
    setSearch: setQuery,
  } = useAutoComplete<Tutor>({
    fetcher: tutorsService.list,
    pageSize: 8,
    enabled: open,
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (value) {
    return (
      <div className="flex items-center gap-2 w-full rounded-lg border border-teal-800/40 dark:border-teal-500/40 bg-teal-800/10 dark:bg-teal-500/10 px-3 py-2">
        <User size={14} className="text-teal-800 dark:text-teal-500 shrink-0" />
        <span className="flex-1 text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
          {value.name}
        </span>
        {value.phone && (
          <span className="text-xs text-stone-500 dark:text-stone-400 shrink-0 truncate">
            {value.phone}
          </span>
        )}
        {!disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClear}
            className="shrink-0 text-stone-500/70 dark:text-stone-400/70 hover:text-red-600 dark:hover:text-red-500"
          >
            <X size={14} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <User
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500/70 dark:text-stone-400/70 pointer-events-none"
        />
        <input
          className={`${inputCls} pl-8 pr-8`}
          placeholder="Buscar tutor pelo nome..."
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500/70 dark:text-stone-400/70 pointer-events-none"
        />
      </div>
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {loading ? (
            <p className="text-xs text-stone-500/70 dark:text-stone-400/70 px-3 py-2">Buscando...</p>
          ) : results.length === 0 ? (
            <p className="text-xs text-stone-500/70 dark:text-stone-400/70 px-3 py-2">
              {query.length < 2
                ? 'Digite ao menos 2 caracteres...'
                : 'Nenhum tutor encontrado'}
            </p>
          ) : (
            results.map((t) => (
              <button
                key={t.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect({
                    id: t.id,
                    name: t.name,
                    ...(t.phone ? { phone: t.phone } : {}),
                  });
                  setOpen(false);
                  setQuery('');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-stone-100/60 dark:hover:bg-stone-800/60 transition-colors"
              >
                <Check size={12} className="text-teal-800 dark:text-teal-500 opacity-0" />
                <div className="min-w-0">
                  <p className="text-stone-900 dark:text-stone-100 truncate">
                    {t.name}
                  </p>
                  {t.phone && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                      {t.phone}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function fmtCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function PaymentModal({
  payment,
  defaultTutor,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const isEditing = !!payment;

  const [tutor, setTutor] = useState<TutorItem | null>(
    defaultTutor ? { id: defaultTutor.id, name: defaultTutor.name } : null,
  );
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: yupResolver(paymentSchema) as any,
    defaultValues: {
      tutor_id: payment?.tutor_id ?? defaultTutor?.id ?? '',
      patient_id: payment?.patient_id ?? '',
      due_date: payment?.due_date ?? '',
      status: payment?.status ?? 'PENDING',
      paid_at: payment?.paid_at ?? '',
      notes: payment?.notes ?? '',
      items: payment?.items ?? [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items') ?? [];
  const watchedStatus = watch('status');

  useEffect(() => {
    const load = async () => {
      setCatalogLoading(true);
      try {
        const res = await catalogService.list({ size: 200, active: true });
        setCatalogItems(res.data);
      } catch {
        /* silently fail */
      } finally {
        setCatalogLoading(false);
      }
    };
    void load();
  }, []);

  const filteredCatalog = catalogItems.filter((c) =>
    c.name.toLowerCase().includes(catalogSearch.toLowerCase()),
  );

  const addFromCatalog = (item: CatalogItem) => {
    const existingIndex = watchedItems.findIndex(
      (i) => i.catalog_item_id === item.id,
    );
    if (existingIndex >= 0) {
      const existing = watchedItems[existingIndex];
      if (existing) {
        update(existingIndex, {
          ...existing,
          quantity: (existing.quantity || 1) + 1,
        });
      }
    } else {
      append({
        name: item.name,
        quantity: 1,
        unit_price: item.price,
        catalog_item_id: item.id,
      });
    }
    setShowCatalog(false);
    setCatalogSearch('');
  };

  const addCustomItem = () => {
    append({ name: '', quantity: 1, unit_price: 0 });
  };

  const total = watchedItems.reduce(
    (sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0),
    0,
  );

  const onSubmit = async (data: PaymentFormData) => {
    const targetTutorId = isEditing ? payment.tutor_id : tutor?.id;
    if (!targetTutorId) {
      toast.error('Selecione um tutor');
      return;
    }

    try {
      let result: Payment;
      const mappedItems = data.items.map((i) => ({
        name: i.name.trim(),
        quantity: Number(i.quantity),
        unit_price: Number(i.unit_price),
        ...(i.catalog_item_id ? { catalog_item_id: i.catalog_item_id } : {}),
      }));

      if (isEditing) {
        result = await paymentsService.update(payment.id, {
          ...(data.notes?.trim() ? { notes: data.notes.trim() } : {}),
          items: mappedItems,
          status: data.status as PaymentStatus,
          due_date: data.due_date,
          ...(data.status === 'PAID'
            ? {
              paid_at:
                  data.paid_at || new Date().toISOString().split('T')[0]!,
            }
            : {}),
        });
        toast.success('Cobrança atualizada com sucesso!');
      } else {
        result = await paymentsService.create({
          ...(data.notes?.trim() ? { notes: data.notes.trim() } : {}),
          items: mappedItems,
          status: data.status as PaymentStatus,
          due_date: data.due_date,
          ...(data.status === 'PAID'
            ? {
              paid_at:
                  data.paid_at || new Date().toISOString().split('T')[0]!,
            }
            : {}),
          tutor_id: targetTutorId,
        });
        toast.success('Cobrança registrada com sucesso!');
      }
      onSuccess(result);
    } catch {
      toast.error('Erro ao salvar cobrança. Tente novamente.');
    }
  };

  return (
    <Modal
      title={isEditing ? 'Editar Cobrança' : 'Nova Cobrança'}
      description={
        isEditing
          ? 'Atualize os itens e dados da cobrança'
          : 'Adicione produtos e serviços para gerar a cobrança'
      }
      onClose={onClose}
      maxWidth="lg"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        {!isEditing && (
          <div>
            <Label required className="mb-1.5">
              Tutor
            </Label>
            <TutorComboBox
              value={tutor}
              onSelect={(t) => {
                setTutor(t);
                setValue('tutor_id', t.id, { shouldValidate: true });
              }}
              onClear={() => {
                setTutor(null);
                setValue('tutor_id', '', { shouldValidate: true });
              }}
            />
            {errors.tutor_id?.message && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-500">
                {errors.tutor_id.message}
              </p>
            )}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label required>Itens da cobrança</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowCatalog((v) => !v);
                  setCatalogSearch('');
                }}
                className="gap-1.5 text-xs h-7"
              >
                <Search size={12} />
                Do catálogo
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addCustomItem}
                className="gap-1.5 text-xs h-7"
              >
                <Plus size={12} />
                Avulso
              </Button>
            </div>
          </div>

          {showCatalog && (
            <div className="mb-3 border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden">
              <div className="p-2 border-b border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800">
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Buscar produto ou serviço..."
                  className="w-full px-3 py-1.5 text-sm rounded border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-teal-500"
                  autoFocus
                />
              </div>
              <div className="max-h-44 overflow-y-auto">
                {catalogLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2
                      size={16}
                      className="animate-spin text-stone-500/70 dark:text-stone-400/70"
                    />
                  </div>
                ) : filteredCatalog.length === 0 ? (
                  <p className="text-sm text-stone-500/70 dark:text-stone-400/70 text-center py-4">
                    {catalogItems.length === 0
                      ? 'Nenhum item no catálogo.'
                      : 'Nenhum resultado.'}
                  </p>
                ) : (
                  filteredCatalog.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addFromCatalog(item)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-teal-800/10 dark:hover:bg-teal-500/10 transition-colors text-left border-b border-stone-200/70 dark:border-stone-800/70 last:border-0"
                    >
                      <div>
                        <span className="font-medium text-stone-900 dark:text-stone-100">
                          {item.name}
                        </span>
                        <span className="ml-2 text-xs text-stone-500/70 dark:text-stone-400/70">
                          {CATALOG_CATEGORY_LABELS[item.category]}
                        </span>
                      </div>
                      <span className="text-teal-800 dark:text-teal-500 font-medium shrink-0 ml-3">
                        {fmtCurrency(item.price)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {fields.length === 0 ? (
            <div className="border border-dashed border-stone-200 dark:border-stone-800 rounded-lg py-6 text-center text-sm text-stone-500/70 dark:text-stone-400/70">
              Adicione itens do catálogo ou crie avulsos
            </div>
          ) : (
            <div className="space-y-2">
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="grid grid-cols-[1fr_80px_100px_32px] gap-2 items-center"
                >
                  <input
                    type="text"
                    {...register(`items.${idx}.name`)}
                    placeholder="Nome do item"
                    className={inputCls}
                  />
                  <input
                    type="number"
                    min={1}
                    {...register(`items.${idx}.quantity`)}
                    placeholder="Qtd"
                    className={inputCls}
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    {...register(`items.${idx}.unit_price`)}
                    placeholder="R$ 0,00"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="text-stone-500/70 dark:text-stone-400/70 hover:text-red-600 dark:hover:text-red-500 transition-colors flex items-center justify-center"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <div className="flex justify-end pt-1">
                <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Total:{' '}
                  <span className="text-teal-800 dark:text-teal-500">
                    {fmtCurrency(total)}
                  </span>
                </span>
              </div>
            </div>
          )}
          {errors.items?.message && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-500">{errors.items.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <DateInput
            label="Vencimento"
            value={watch('due_date') ?? ''}
            onChange={(v) => setValue('due_date', v, { shouldValidate: true })}
            required
            error={errors.due_date?.message}
          />
          <SelectInput
            label="Status"
            required
            control={control}
            name="status"
            options={STATUS_OPTIONS}
            error={errors.status?.message}
          />
        </div>

        {watchedStatus === 'PAID' && (
          <DateInput
            label="Data do pagamento"
            value={watch('paid_at') ?? ''}
            onChange={(v) => setValue('paid_at', v)}
            error={errors.paid_at?.message}
          />
        )}

        <FormTextarea
          label="Observações"
          placeholder="Ex: Atendimento referente a 10/05"
          rows={2}
          control={control}
          name="notes"
          error={errors.notes?.message}
        />

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
            className="bg-teal-800 dark:bg-teal-500 hover:bg-teal-800/90 dark:hover:bg-teal-500/90 text-white dark:text-stone-950 border-teal-800 dark:border-teal-500"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isEditing ? (
              'Salvar alterações'
            ) : (
              `Registrar ${total > 0 ? fmtCurrency(total) : ''}`
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
