'use client';

import {
  AlertTriangle,
  Archive,
  BookOpen,
  Calculator,
  Clock,
  FlaskConical,
  Info,
  Layers,
  MessageSquare,
  Pill,
  Route,
  ShieldAlert,
  Stethoscope,
  Thermometer,
  User,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

import { InfoCard } from '@/app/components/common/info-card';
import { ListSection } from '@/app/components/common/list-section';
import { Modal } from '@/app/components/common/modal';
import { TextBlock } from '@/app/components/common/text-block';
import type { DoseEntry, Medicine, ReferenceDose } from '@/types/medicine';

type Tab = 'sobre' | 'indicacoes' | 'administracao' | 'apresentacoes';
type SpeciesKey = keyof ReferenceDose;

function parseDoseRange(entry?: DoseEntry): { min: number; max: number } | null {
  if (!entry?.dose) return null;
  const matches = entry.dose.match(/([\d.,]+)\s*(?:a|-)\s*([\d.,]+)/);
  if (matches?.[1] && matches[2]) {
    return {
      min: parseFloat(matches[1].replace(',', '.')),
      max: parseFloat(matches[2].replace(',', '.')),
    };
  }
  const single = parseFloat(entry.dose.replace(',', '.'));
  if (!isNaN(single)) return { min: single, max: single };
  return null;
}

function formatDose(val: number): string {
  return val.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'sobre', label: 'Visão Geral' },
  { key: 'indicacoes', label: 'Indicações' },
  { key: 'administracao', label: 'Administração' },
  { key: 'apresentacoes', label: 'Apresentações' },
];

const SPECIES_OPTIONS: { key: SpeciesKey; label: string }[] = [
  { key: 'dogs', label: 'Cães' },
  { key: 'cats', label: 'Gatos' },
  { key: 'cattle', label: 'Bovinos' },
  { key: 'horses', label: 'Equinos' },
  { key: 'general', label: 'Geral' },
];

interface MedicineDetailModalProps {
  medicine: Medicine;
  onClose: () => void;
}

export function MedicineDetailModal({ medicine, onClose }: MedicineDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('sobre');
  const [calcSpecies, setCalcSpecies] = useState<SpeciesKey>('dogs');
  const [weight, setWeight] = useState('');

  const activeEntry =
    medicine.referenceDose?.[calcSpecies] ?? medicine.referenceDose?.general;
  const parsedDose = parseDoseRange(activeEntry);
  const weightKg = parseFloat(weight);
  const calculatedResult =
    parsedDose && weightKg > 0
      ? {
        min: parsedDose.min * weightKg,
        max: parsedDose.max * weightKg,
        isRange: parsedDose.min !== parsedDose.max,
      }
      : null;

  return (
    <Modal title={medicine.name} maxWidth="2xl" onClose={onClose}>
      <div className="flex flex-col gap-0 -mx-5 -mt-5">
        {/* Classification + active ingredients header */}
        <div className="flex flex-wrap items-center gap-2 px-5 pt-4 pb-3 border-b border-stone-200/70 dark:border-stone-800/70">
          {medicine.classification && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-800/10 dark:bg-teal-500/10 text-teal-800 dark:text-teal-500 border border-teal-800/40 dark:border-teal-500/40">
              {medicine.classification}
            </span>
          )}
          {medicine.activeIngredients && (
            <span className="text-xs text-stone-500/70 dark:text-stone-400/70">
              {medicine.activeIngredients}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 px-4 py-2 border-b border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition-all text-center leading-snug ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-stone-900 text-teal-800 dark:text-teal-500 shadow-sm ring-1 ring-stone-200 dark:ring-stone-700'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/60 dark:hover:bg-slate-700/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-5 py-5 space-y-4">

          {/* â”€â”€ INDICAÃ‡Ã•ES E CONTRAINDICAÃ‡Ã•ES â”€â”€ */}
          {activeTab === 'indicacoes' && (
            <>
              <TextBlock
                icon={BookOpen}
                label="Indicações"
                value={medicine.fullIndications}
                iconColor="text-teal-800 dark:text-teal-500"
                borderColor="border-teal-800/40 dark:border-teal-500/40"
                bgColor="bg-teal-800/10 dark:bg-teal-500/10"
              />

              <ListSection
                icon={AlertTriangle}
                label="Contraindicações e Precauções"
                items={medicine.contraindicationsPrecautions ?? []}
                iconColor="text-red-600 dark:text-red-500"
                bgColor="border-red-600/30 dark:border-red-500/30 bg-red-50 dark:bg-red-900"
              />

              <ListSection
                icon={Zap}
                label="Efeitos Adversos"
                items={medicine.adverseEffects ?? []}
                iconColor="text-stone-500/70 dark:text-stone-400/70"
                bgColor="border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800"
              />

              <TextBlock
                icon={ShieldAlert}
                label="Superdosagem"
                value={medicine.overdose}
                iconColor="text-stone-500/70 dark:text-stone-400/70"
                borderColor="border-stone-200 dark:border-stone-800"
                bgColor="bg-stone-100 dark:bg-stone-800"
              />

              <TextBlock
                icon={Info}
                label="Reprodução, Gestação e Lactação"
                value={medicine.reproductionPregnancyLactation}
                iconColor="text-stone-500/70 dark:text-stone-400/70"
                borderColor="border-stone-200 dark:border-stone-800"
                bgColor="bg-stone-100 dark:bg-stone-800"
              />

              {!medicine.fullIndications &&
                !medicine.contraindicationsPrecautions?.length &&
                !medicine.adverseEffects?.length &&
                !medicine.overdose &&
                !medicine.reproductionPregnancyLactation && (
                <div className="rounded-xl border border-dashed border-stone-200 dark:border-stone-800 p-6 text-center">
                  <AlertTriangle size={24} className="mx-auto text-stone-500/50 dark:text-stone-400/50 mb-2" />
                  <p className="text-sm text-stone-500/70 dark:text-stone-400/70">
                      Nenhuma informação disponível.
                  </p>
                </div>
              )}
            </>
          )}

          {/* â”€â”€ ADMINISTRAÃ‡ÃƒO E DOSES â”€â”€ */}
          {activeTab === 'administracao' && (
            <>
              {/* Routes */}
              {(medicine.administrationRoutes?.length ?? 0) > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Route size={14} className="text-emerald-700 dark:text-emerald-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500/70 dark:text-stone-400/70">
                      Vias de Administração
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {medicine.administrationRoutes!.map((r) => (
                      <span
                        key={r}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-500 border border-emerald-700/30 dark:border-emerald-500/30"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Frequency + duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoCard
                  icon={Clock}
                  label="Frequência de Uso"
                  value={medicine.usageFrequency}
                  iconColor="text-sky-700 dark:text-sky-500"
                />
                <InfoCard
                  icon={Clock}
                  label="Duração do Tratamento"
                  value={medicine.treatmentDuration}
                  iconColor="text-indigo-500"
                />
              </div>

              {/* Doses per species */}
              {medicine.referenceDose && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Pill size={14} className="text-violet-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500/70 dark:text-stone-400/70">
                      Doses de Referência
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SPECIES_OPTIONS.map(({ key, label }) => {
                      const entry = medicine.referenceDose?.[key];
                      return (
                        <div
                          key={key}
                          className="flex flex-col gap-1 p-3 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/20"
                        >
                          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500/70 dark:text-stone-400/70">
                            {label}
                          </span>
                          {entry?.dose ? (
                            <>
                              <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                                {entry.dose}
                              </p>
                              {entry.unit && (
                                <p className="text-xs text-stone-500/70 dark:text-stone-400/70">{entry.unit}</p>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-stone-500/70 dark:text-stone-400/70">—</span>
                          )}
                        </div>
                      );
                    })}
                    {medicine.referenceDose.general && (
                      <div className="col-span-2 sm:col-span-4 flex flex-col gap-1 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500/70 dark:text-stone-400/70">
                          Geral (todas as espécies)
                        </span>
                        <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                          {medicine.referenceDose.general.dose}
                          {medicine.referenceDose.general.unit && (
                            <span className="text-xs font-normal text-stone-500/70 dark:text-stone-400/70 ml-1.5">
                              {medicine.referenceDose.general.unit}
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dosage notes */}
              <TextBlock
                icon={Info}
                label="Observações de Dosagem"
                value={medicine.dosageNotes}
                iconColor="text-sky-700 dark:text-sky-500"
                borderColor="border-sky-700/30 dark:border-sky-500/30"
                bgColor="bg-sky-50 dark:bg-sky-900"
              />

              {/* Dose calculator */}
              <div className="rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-800">
                  <Calculator size={14} className="text-teal-800 dark:text-teal-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Calculadora de Dose
                  </span>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2">Espécie</p>
                    <div className="flex rounded-lg border border-stone-200 dark:border-stone-800 overflow-hidden w-fit">
                      {SPECIES_OPTIONS.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => setCalcSpecies(opt.key)}
                          className={`px-4 py-2 text-sm font-medium transition-colors ${
                            calcSpecies === opt.key
                              ? 'bg-teal-800 dark:bg-teal-500 text-white'
                              : 'bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 hover:bg-stone-100/60 dark:hover:bg-stone-800/60'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-end gap-3">
                    <div className="flex-1 max-w-[180px]">
                      <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5 block">
                        Peso do animal
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          placeholder="Ex: 12"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-500/70 dark:placeholder:text-stone-400/70 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-teal-500 pr-10"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500/70 dark:text-stone-400/70 font-medium">
                          kg
                        </span>
                      </div>
                    </div>
                  </div>

                  {weight && weightKg > 0 && (
                    <>
                      {calculatedResult ? (
                        <div className="rounded-lg bg-teal-800/10 dark:bg-teal-500/10 border border-teal-800/40 dark:border-teal-500/40 px-4 py-3 flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-teal-800 dark:bg-teal-500 shrink-0" />
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-500 mb-0.5">
                              Dose calculada para {weightKg} kg
                            </p>
                            <p className="text-base font-bold text-teal-800 dark:text-teal-500">
                              {calculatedResult.isRange
                                ? `${formatDose(calculatedResult.min)} – ${formatDose(calculatedResult.max)}`
                                : formatDose(calculatedResult.min)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg bg-amber-50 dark:bg-amber-900 border border-amber-600/40 dark:border-amber-400/40 px-4 py-3">
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            {activeEntry
                              ? 'Dose disponível mas não calculável automaticamente. Consulte a bula.'
                              : 'Dose não informada para esta espécie. Consulte a bula.'}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* â”€â”€ APRESENTAÃ‡Ã•ES E CONCENTRAÃ‡Ã•ES â”€â”€ */}
          {activeTab === 'apresentacoes' && (
            <>
              {(medicine.presentationsConcentrations?.length ?? 0) > 0 ? (
                <div className="rounded-xl border border-stone-200 dark:border-stone-800 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Layers size={15} className="text-teal-800 dark:text-teal-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                      Apresentações e Concentrações
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {medicine.presentationsConcentrations!.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm text-stone-800 dark:text-stone-100"
                      >
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-teal-800 dark:bg-teal-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-stone-200 dark:border-stone-800 p-6 text-center">
                  <FlaskConical size={24} className="mx-auto text-stone-500/50 dark:text-stone-400/50 mb-2" />
                  <p className="text-sm text-stone-500/70 dark:text-stone-400/70">
                    Nenhuma apresentação disponível.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoCard
                  icon={Thermometer}
                  label="Armazenamento"
                  value={medicine.storage}
                  iconColor="text-sky-700 dark:text-sky-500"
                />
                <InfoCard
                  icon={Stethoscope}
                  label="Monitoramento"
                  value={medicine.monitoring}
                  iconColor="text-violet-500"
                />
              </div>

              <TextBlock
                icon={MessageSquare}
                label="Informações ao Cliente"
                value={medicine.clientInformation}
                iconColor="text-stone-500/70 dark:text-stone-400/70"
                borderColor="border-stone-200 dark:border-stone-800"
                bgColor="bg-stone-100 dark:bg-stone-800"
              />
            </>
          )}

          {/* â”€â”€ SOBRE â”€â”€ */}
          {activeTab === 'sobre' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoCard
                  icon={Pill}
                  label="Princípios Ativos"
                  value={medicine.activeIngredients}
                  iconColor="text-teal-800 dark:text-teal-500"
                />
                <InfoCard
                  icon={Archive}
                  label="Classificação"
                  value={medicine.classification}
                  iconColor="text-indigo-500"
                />
              </div>

              {(medicine.recommendedSpecies?.length ?? 0) > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-stone-500/70 dark:text-stone-400/70" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500/70 dark:text-stone-400/70">
                      Espécies Recomendadas
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {medicine.recommendedSpecies!.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-800"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!medicine.activeIngredients &&
                !medicine.classification &&
                !medicine.recommendedSpecies?.length && (
                <div className="rounded-xl border border-dashed border-stone-200 dark:border-stone-800 p-6 text-center">
                  <FlaskConical size={24} className="mx-auto text-stone-500/50 dark:text-stone-400/50 mb-2" />
                  <p className="text-sm text-stone-500/70 dark:text-stone-400/70">
                      Nenhuma informação disponível.
                  </p>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </Modal>
  );
}
