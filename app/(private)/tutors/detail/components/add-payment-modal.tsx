'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Loader2, Plus, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Modal } from '@/app/components/common/modal';
import { DateInput } from '@/app/components/forms/date-input';
import { FormTextarea } from '@/app/components/forms/form-textarea';
import { SelectInput } from '@/app/components/forms/select-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { paymentSchema, type PaymentFormData } from '@/schemas/payment';
import { catalogService } from '@/services/catalog.service';
import { paymentsService } from '@/services/payments.service';
import type { CatalogItem } from '@/types/catalog';
import { CATALOG_CATEGORY_LABELS } from '@/types/catalog';
import type { Patient } from '@/types/patient';
import { type Payment, type PaymentStatus } from '@/types/payment';

interface AddPaymentModalProps {
  tutorId: string;
  pets: Patient[];
  onClose: () => void;
  onSuccess: (payment: Payment) => void;
}

const inputCls =
  'w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500';

const STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'PAID', label: 'Pago' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

function fmtCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function AddPaymentModal({
  tutorId,
  pets,
  onClose,
  onSuccess,
}: AddPaymentModalProps) {
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
      tutor_id: tutorId,
      patient_id: '',
      due_date: '',
      status: 'PENDING',
      paid_at: '',
      notes: '',
      items: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'items',
  });

  const petOptions = pets.map((p) => ({ value: p.id, label: p.name }));
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
    try {
      const result = await paymentsService.create({
        ...(data.notes?.trim() ? { notes: data.notes.trim() } : {}),
        items: data.items.map((i) => ({
          name: i.name.trim(),
          quantity: Number(i.quantity),
          unit_price: Number(i.unit_price),
          ...(i.catalog_item_id ? { catalog_item_id: i.catalog_item_id } : {}),
        })),
        status: data.status as PaymentStatus,
        due_date: data.due_date,
        ...(data.status === 'PAID'
          ? {
            paid_at:
                data.paid_at || new Date().toISOString().split('T')[0]!,
          }
          : {}),
        tutor_id: tutorId,
        ...(data.patient_id ? { patient_id: data.patient_id } : {}),
      });
      toast.success('Cobrança registrada com sucesso!');
      onSuccess(result);
    } catch {
      toast.error('Erro ao salvar cobrança. Tente novamente.');
    }
  };

  return (
    <Modal
      title="Nova Cobrança"
      description="Adicione produtos e serviços para gerar a cobrança"
      onClose={onClose}
      maxWidth="lg"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
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
            <div className="mb-3 border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden">
              <div className="p-2 border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Buscar produto ou serviço..."
                  className="w-full px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                />
              </div>
              <div className="max-h-44 overflow-y-auto">
                {catalogLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2
                      size={16}
                      className="animate-spin text-slate-400"
                    />
                  </div>
                ) : filteredCatalog.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">
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
                      className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors text-left border-b border-slate-100 dark:border-slate-700 last:border-0"
                    >
                      <div>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {item.name}
                        </span>
                        <span className="ml-2 text-xs text-slate-400">
                          {CATALOG_CATEGORY_LABELS[item.category]}
                        </span>
                      </div>
                      <span className="text-teal-600 dark:text-teal-400 font-medium shrink-0 ml-3">
                        {fmtCurrency(item.price)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {fields.length === 0 ? (
            <div className="border border-dashed border-slate-300 dark:border-slate-600 rounded-lg py-6 text-center text-sm text-slate-400 dark:text-slate-500">
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
                    className="text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <div className="flex justify-end pt-1">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Total:{' '}
                  <span className="text-teal-600 dark:text-teal-400">
                    {fmtCurrency(total)}
                  </span>
                </span>
              </div>
            </div>
          )}
          {errors.items?.message && (
            <p className="mt-1 text-xs text-red-500">{errors.items.message}</p>
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

        {petOptions.length > 0 && (
          <SelectInput
            label="Pet (opcional)"
            control={control}
            name="patient_id"
            options={petOptions}
            placeholder="Selecione um pet..."
            error={errors.patient_id?.message}
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
            className="bg-teal-600 hover:bg-teal-700 text-white border-teal-600"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              `Registrar ${total > 0 ? fmtCurrency(total) : ''}`
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
