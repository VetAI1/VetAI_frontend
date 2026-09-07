export interface DoseEntry {
  dose?: string;
  unit?: string;
}

export interface ReferenceDose {
  dogs?: DoseEntry;
  cats?: DoseEntry;
  cattle?: DoseEntry;
  horses?: DoseEntry;
  general?: DoseEntry;
}

export interface MedicineReference {
  title: string;
  source: string;
  url: string;
  type?: string;
  accessedAt?: string;
}

export interface Medicine {
  id: string;
  name: string;
  activeIngredients?: string;
  classification?: string;
  recommendedSpecies?: string[];
  fullIndications?: string;
  contraindicationsPrecautions?: string[];
  overdose?: string;
  adverseEffects?: string[];
  reproductionPregnancyLactation?: string;
  administrationRoutes?: string[];
  usageFrequency?: string;
  referenceDose?: ReferenceDose;
  treatmentDuration?: string;
  dosageNotes?: string;
  presentationsConcentrations?: string[];
  clientInformation?: string;
  storage?: string;
  monitoring?: string;
  references?: MedicineReference[];
  createdAt: string;
  updatedAt: string;
}

export interface MedicineQueryParams {
  page?: number | undefined;
  size?: number | undefined;
  search?: string | undefined;
  type?: string | undefined;
}
