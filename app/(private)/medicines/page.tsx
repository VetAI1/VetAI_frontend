'use client';

import { Pill, Search, X } from 'lucide-react';
import { useState } from 'react';

import { MedicineDetailModal } from './components/medicine-detail-modal';

import { Card } from '@/app/components/common/card';
import { EmptyState } from '@/app/components/common/empty-state';
import { SelectInput } from '@/app/components/forms/select-input';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { usePaginatedResource } from '@/hooks/use-paginated-resource';
import { medicinesService } from '@/services/medicines.service';
import type { Medicine } from '@/types/medicine';

const MEDICINE_TYPES = [
  'Aditivos Promotores de Crescimento',
  'Adrenolíticos',
  'Adulticidas',
  'Agentes Alquilantes',
  'Alcalinizantes Sistêmicos',
  'Aminoglicosídeos',
  'Analgésicos',
  'Anestésicos dissociativos',
  'Anestésicos gerais',
  'Anestésicos Gerais Intravenosos',
  'Anestésicos inalatórios',
  'Anestésicos locais',
  'Anfenicóis',
  'Ansiolíticos',
  'Antagonistas Alfa-2',
  'Antagonistas Benzodiazepínicos',
  'Antagonistas H2',
  'Antagonistas Opioides',
  'Antiagregantes',
  'Antiagregantes plaquetários',
  'Antiarrítmicos',
  'Antiarrítmicos classe I',
  'Antiarrítmicos classe III',
  'Antibióticos',
  'Anticoccidianos',
  'Anticoccidianos Bovinos',
  'Anticolinesterásicos',
  'Anticolinesterásicos de Curta Duração',
  'Anticonvulsivantes',
  'Antidepressivos',
  'Antidiabéticos',
  'Antidiarreicos',
  'Antidiuréticos',
  'Antídotos',
  'Antídotos Especiais',
  'Antieméticos',
  'Antiespasmódicos',
  'Antifibrinolíticos',
  'Antifúngicos',
  'Antiglaucomatosos',
  'Anti-hipertensivos',
  'Anti-histamínicos',
  'Anti-inflamatórios',
  'Anti-inflamatórios intestinais',
  'Anti-inflamatórios Naturais',
  'Antimicrobianos',
  'Antineoplásicos',
  'Antineoplásicos adjuvantes',
  'Antioxidantes',
  'Antiparasitários',
  'Antiprogestágenos',
  'Antiprotozoários',
  'Antiprotozoários sanguíneos',
  'Antipruriginosos',
  'Antissépticos Urinários',
  'Antitérmicos',
  'Antitireoidianos',
  'Antitussígenos',
  'Antivirais',
  'Antiácidos',
  'Babesicidas',
  'Barbitúricos',
  'Betabloqueadores',
  'Bloqueadores de Canal de Cálcio',
  'Bloqueadores dos Receptores de Angiotensina',
  'Bloqueadores Neuromusculares',
  'Broncodilatadores',
  'Broncodilatadores inalatórios',
  'Cardiotônicos',
  'Cardiotônicos de Emergência',
  'Catecolaminas',
  'Cefalosporinas',
  'Cefalosporinas de 4ª Geração',
  'Coagulantes',
  'Coccidiostáticos',
  'Coleréticos',
  'Condroprotetores',
  'Corticosteroides',
  'Coxibes',
  'Diagnóstico',
  'Diuréticos',
  'Diuréticos Tiazídicos',
  'Ectoparasiticidas',
  'Emergência',
  'Endectocidas',
  'Endócrinos',
  'Enzimas Digestivas',
  'Estimuladores hematopoiéticos',
  'Estimulantes de apetite',
  'Fenotiazínicos',
  'Fluoroquinolonas',
  'Galactagogos',
  'Hemostáticos',
  'Heparinas Baixo Peso',
  'Hepatoprotetores',
  'Hormônios',
  'Hormônios Reprodutivos',
  'Imunomoduladores',
  'Imunossupressores',
  'Inibidores Adrenais',
  'Inibidores da ECA',
  'Inibidores da MAO',
  'Inibidores de prolactina',
  'Inibidores de quitina',
  'Inibidores de Tirosina Quinase',
  'Inodilatadores',
  'Inotrópicos Positivos',
  'Isoxazolinas',
  'Laxantes',
  'Laxantes Osmóticos',
  'Lincosamidas',
  'Macrolídeos',
  'Midriáticos',
  'Milbemicinas',
  'Mineralocorticoides',
  'Modificadores de Comportamento',
  'Mucolíticos',
  'Neonicotinoides',
  'Neurológicos',
  'Neuromoduladores',
  'Nutracêuticos',
  'Oftálmicos',
  'Opioides',
  'Polipeptídeos',
  'Prostaglandinas',
  'Protetores biliares',
  'Protetores Gástricos',
  'Pró-cinéticos',
  'Pró-cinéticos GI fortes',
  'Quelantes',
  'Quimioterapia',
  'Reativadores de Colinesterase',
  'Redutores de amônia',
  'Relaxantes Anestésicos',
  'Relaxantes musculares',
  'Relaxantes Musculares Centrais',
  'Repelentes',
  'Reversores Neuromusculares',
  'Rifamicinas',
  'Sedativos',
  'Simpatomiméticos',
  'Sulfonamidas',
  'Suplementos',
  'Suplementos Minerais Injetáveis',
  'Tenicidas',
  'Tetraciclinas',
  'Tireoidianos',
  'Tranquilizantes',
  'Vasodilatadores',
  'Vasopressores',
  'Vermífugos',
  'Vermífugos Pró-drogas',
  'Vitaminas',
];

const TYPE_OPTIONS = [
  { value: '', label: 'Todos os tipos' },
  ...MEDICINE_TYPES.map((t) => ({ value: t, label: t })),
];

interface MedicineFilters {
  type?: string | undefined;
  search?: string | undefined;
}

export default function MedicinesPage() {
  const [selected, setSelected] = useState<Medicine | null>(null);

  const {
    items: medicines,
    meta,
    loading,
    search,
    page,
    filters,
    setSearch,
    setPage,
    setFilters,
  } = usePaginatedResource<Medicine, MedicineFilters>({
    fetcher: medicinesService.list,
    initialFilters: { type: '', search: '' },
    pageSize: 18,
    debounceMs: 300,
  });

  const handleTypeFilter = (type: string) => {
    setFilters((prev) => ({ ...prev, type }));
  };

  const totalPages = meta?.total_pages ?? 1;
  const isEmpty = !loading && medicines.length === 0;

  return (
    <div className="min-h-screen bg-[oklch(0.985_0.01_95)] dark:bg-stone-950 w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header title="Medicações" showStorage={false} />

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500/70 dark:text-stone-400/70 pointer-events-none"
            />
            <Input
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500/70 dark:text-stone-400/70 hover:text-stone-900 dark:hover:text-stone-100"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="w-full sm:w-56">
            <SelectInput
              value={filters.type ?? ''}
              onChange={handleTypeFilter}
              options={TYPE_OPTIONS}
              placeholder="Todos os tipos"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : isEmpty ? (
          <EmptyState
            title={
              search || filters.type
                ? 'Nenhum medicamento encontrado'
                : 'Nenhum medicamento cadastrado ainda'
            }
            icon={Pill}
            className="py-24"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {medicines.map((medicine) => (
              <MedicineCard
                key={medicine.id}
                medicine={medicine}
                onClick={() => setSelected(medicine)}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-1 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPage(p)}
                className={
                  p === page
                    ? 'bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90 border-teal-800 dark:border-teal-500'
                    : ''
                }
              >
                {p}
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
      </div>

      {selected && (
        <MedicineDetailModal
          medicine={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function MedicineCard({
  medicine,
  onClick,
}: {
  medicine: Medicine;
  onClick: () => void;
}) {
  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md hover:border-teal-800/40 dark:hover:border-teal-500/40 transition-all duration-200 group"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-teal-800/10 dark:bg-teal-500/10 flex items-center justify-center shrink-0 group-hover:bg-teal-800/10 dark:group-hover:bg-teal-500/10 transition-colors">
          <Pill size={16} className="text-teal-800 dark:text-teal-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate group-hover:text-teal-800 dark:group-hover:text-teal-500 transition-colors">
            {medicine.name}
          </h3>
          {medicine.activeIngredients && (
            <p className="text-xs text-stone-500/70 dark:text-stone-400/70 mt-0.5 truncate">
              {medicine.activeIngredients}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mt-3">
        {medicine.classification && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-teal-800/10 dark:bg-teal-500/10 text-teal-800 dark:text-teal-500 border border-teal-800/40 dark:border-teal-500/40">
            {medicine.classification}
          </span>
        )}
        {medicine.administrationRoutes?.slice(0, 2).map((r) => (
          <span
            key={r}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400"
          >
            {r}
          </span>
        ))}
      </div>

      {medicine.fullIndications && (
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 line-clamp-2 leading-relaxed">
          {medicine.fullIndications}
        </p>
      )}
    </Card>
  );
}
