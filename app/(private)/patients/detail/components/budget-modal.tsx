'use client';

import { Download, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  budgetTotal,
  buildBudgetPdf,
  type BudgetItem,
} from '../utils/budget-pdf';

import { Modal } from '@/app/components/common/modal';
import { FormTextarea } from '@/app/components/forms/form-textarea';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/infra/auth-context';
import { catalogService } from '@/services/catalog.service';
import { hospitalsService } from '@/services/hospitals.service';
import type { CatalogItem } from '@/types/catalog';
import { CATALOG_CATEGORY_LABELS } from '@/types/catalog';
import type { Patient } from '@/types/patient';
import type { Hospital } from '@/types/settings';
import type { Tutor } from '@/types/tutor';
import { currencyToMasked, unmaskCurrency } from '@/utils/masks';

interface BudgetModalProps {
  patient: Patient;
  tutor: Tutor | null;
  onClose: () => void;
}

function money(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function BudgetModal({ patient, tutor, onClose }: BudgetModalProps) {
  const { user } = useAuth();
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [validityDays, setValidityDays] = useState('15');
  const [notes, setNotes] = useState('');
  const [preview, setPreview] = useState<{ url: string; save: () => void } | null>(
    null,
  );
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    void catalogService
      .list({ size: 200, active: true })
      .then((response) => setCatalog(response.data))
      .catch(() => undefined);
    void hospitalsService
      .get()
      .then(setHospital)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  const filteredCatalog = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return catalog.slice(0, 8);
    return catalog
      .filter((item) => item.name.toLowerCase().includes(term))
      .slice(0, 8);
  }, [catalog, search]);

  const total = budgetTotal(items);

  const addFromCatalog = (item: CatalogItem) => {
    setItems((prev) => {
      const index = prev.findIndex((current) => current.name === item.name);
      if (index >= 0) {
        return prev.map((current, i) =>
          i === index ? { ...current, quantity: current.quantity + 1 } : current,
        );
      }
      return [...prev, { name: item.name, quantity: 1, unitPrice: item.price }];
    });
    setSearch('');
  };

  const updateItem = (index: number, patch: Partial<BudgetItem>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

  const generate = async () => {
    const valid = items.filter((item) => item.name.trim());
    if (!valid.length) {
      toast.error('Adicione ao menos um item ao orçamento.');
      return;
    }
    if (!user) {
      toast.error('Sessão expirada. Entre novamente para gerar o orçamento.');
      return;
    }

    setGenerating(true);
    try {
      const fileName = `Orcamento - ${patient.name}.pdf`;
      const pdf = await buildBudgetPdf({
        patient,
        tutor,
        hospital,
        user,
        items: valid,
        validityDays: Number(validityDays) || 15,
        logoUrl: `${window.location.origin}/logo-white.png`,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      // A pré-visualização é o próprio arquivo: o que aparece na tela é
      // exatamente o que o botão de baixar salva.
      const url = URL.createObjectURL(pdf.output('blob'));
      setPreview({ url, save: () => pdf.save(fileName) });
    } catch {
      toast.error('Não foi possível gerar o orçamento.');
    } finally {
      setGenerating(false);
    }
  };

  if (preview) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/70 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 bg-teal-800 dark:bg-teal-500 px-4 py-3 text-white dark:text-stone-950">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">Orçamento</p>
            <p className="text-xs text-white/90 dark:text-stone-950/90 truncate">{patient.name}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPreview(null)}
              className="text-white/90 dark:text-stone-950/90 hover:text-white dark:hover:text-stone-950 hover:bg-teal-800 dark:hover:bg-teal-500"
            >
              Editar itens
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={preview.save}
              className="text-white/90 dark:text-stone-950/90 hover:text-white dark:hover:text-stone-950 hover:bg-teal-800 dark:hover:bg-teal-500"
            >
              <Download size={16} />
              Baixar PDF
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/90 dark:text-stone-950/90 hover:text-white dark:hover:text-stone-950 hover:bg-teal-800 dark:hover:bg-teal-500"
              title="Fechar"
            >
              <X size={18} />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden bg-slate-600">
          <iframe
            src={preview.url}
            title="Orçamento"
            className="h-full w-full border-none"
          />
        </div>
      </div>
    );
  }

  return (
    <Modal
      title="Gerar orçamento"
      description={`Paciente: ${patient.name}${tutor ? ` · Tutor: ${tutor.name}` : ''}`}
      onClose={onClose}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        <div>
          <InputWithLabel
            label="Buscar no catálogo"
            placeholder="Digite para encontrar um serviço ou produto"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            endAdornment={<Search size={16} className="text-stone-500/70 dark:text-stone-400/70" />}
          />
          {filteredCatalog.length > 0 && (
            <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-stone-200 dark:border-stone-800 divide-y divide-border">
              {filteredCatalog.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addFromCatalog(item)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-teal-800/10 dark:hover:bg-teal-500/10"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-stone-900 dark:text-stone-100">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-stone-500/70 dark:text-stone-400/70">
                      {CATALOG_CATEGORY_LABELS[item.category]}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-teal-800 dark:text-teal-500">
                    {money(item.price)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
              Itens do orçamento ({items.length})
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setItems((prev) => [
                  ...prev,
                  { name: '', quantity: 1, unitPrice: 0 },
                ])
              }
            >
              <Plus size={14} />
              Item avulso
            </Button>
          </div>

          {items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-stone-200 dark:border-stone-800 px-3 py-6 text-center text-sm text-stone-500/70 dark:text-stone-400/70">
              Nenhum item adicionado ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-end gap-2 rounded-lg border border-stone-200 dark:border-stone-800 p-2"
                >
                  <div className="flex-1 min-w-0">
                    <InputWithLabel
                      label="Descrição"
                      value={item.name}
                      onChange={(event) =>
                        updateItem(index, { name: event.target.value })
                      }
                    />
                  </div>
                  <div className="w-20">
                    <InputWithLabel
                      label="Qtd."
                      type="number"
                      min="1"
                      value={String(item.quantity)}
                      onChange={(event) =>
                        updateItem(index, {
                          quantity: Math.max(
                            1,
                            Number(event.target.value) || 1,
                          ),
                        })
                      }
                    />
                  </div>
                  <div className="w-32">
                    <InputWithLabel
                      label="Valor unit."
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      value={currencyToMasked(item.unitPrice)}
                      onChange={(event) =>
                        updateItem(index, {
                          unitPrice: unmaskCurrency(event.target.value),
                        })
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setItems((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="text-red-600 dark:text-red-500 hover:text-red-600 dark:hover:text-red-500 shrink-0"
                    title="Remover"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg bg-teal-800/10 dark:bg-teal-500/10 px-3 py-2.5">
          <span className="text-sm font-semibold text-teal-800 dark:text-teal-500">
            Total
          </span>
          <span className="text-lg font-bold text-teal-800 dark:text-teal-500">
            {money(total)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InputWithLabel
            label="Validade (dias)"
            type="number"
            min="1"
            value={validityDays}
            onChange={(event) => setValidityDays(event.target.value)}
          />
          <div className="sm:col-span-2">
            <FormTextarea
              label="Observações"
              rows={2}
              placeholder="Condições de pagamento, prazos, etc."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void generate()}
            loading={generating}
            className="bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90"
          >
            Gerar orçamento
          </Button>
        </div>
      </div>
    </Modal>
  );
}
