'use client';

import { Pill, Search, X } from 'lucide-react';
import { useState } from 'react';

import { MedicineDetailModal } from './components/medicine-detail-modal';

import { Card } from '@/app/components/common/card';
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
    <div className="min-h-screen bg-background w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header title="Medicações" showStorage={false} />

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
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
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground"
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
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Pill size={36} className="text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {search || filters.type
                ? 'Nenhum medicamento encontrado.'
                : 'Nenhum medicamento cadastrado ainda.'}
            </p>
          </div>
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
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary'
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
      className="p-4 cursor-pointer hover:shadow-md hover:border-primary/40 transition-all duration-200 group"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
          <Pill size={16} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {medicine.name}
          </h3>
          {medicine.activeIngredients && (
            <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
              {medicine.activeIngredients}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mt-3">
        {medicine.classification && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/40">
            {medicine.classification}
          </span>
        )}
        {medicine.administrationRoutes?.slice(0, 2).map((r) => (
          <span
            key={r}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary text-muted-foreground"
          >
            {r}
          </span>
        ))}
      </div>

      {medicine.fullIndications && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
          {medicine.fullIndications}
        </p>
      )}
    </Card>
  );
}
