import type { Patient } from './patient';

export type StudyStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type PreventionStatus = 'GENERATING' | 'COMPLETED' | 'FAILED';
export type ExamValueStatus = 'REGULAR' | 'HIGHER' | 'LOWER';
export type StudyType = 'LABORATORY' | 'IMAGING';
export type ImagingFindingStatus = 'NORMAL' | 'ATTENTION' | 'CRITICAL';

export interface ExamReference {
  type: 'TEXT' | 'RANGE';
  min?: number;
  max?: number;
  text?: string;
  unit?: string;
}

export interface ExamValue {
  title: string;
  status: ExamValueStatus;
  unit?: string;
  value: string;
  subgroup?: string;
  reference?: ExamReference;
}

export interface ExamResult {
  title: string;
  values: ExamValue[];
}

export interface ImagingFinding {
  region: string;
  description: string;
  status: ImagingFindingStatus;
  measurement?: string;
}

export interface ImagingReport {
  modality: string;
  bodyRegion?: string;
  technique?: string;
  findings: ImagingFinding[];
  impression?: string;
  differentials: string[];
  limitations?: string;
}

export interface AlteredValueInfo {
  name: string;
  value: string;
  unit?: string;
  status: string;
  problems: string[];
  recommendations: string[];
}

export interface StudyPrevention {
  generalDiagnosis?: string;
  alteredValues: AlteredValueInfo[];
  generalRecommendations: string[];
}

export interface Study {
  id: string;
  patient: Patient;
  status: StudyStatus;
  type: StudyType;
  preventionStatus?: PreventionStatus;
  examDate?: string;
  title?: string;
  results: ExamResult[];
  imaging?: ImagingReport;
  prevention?: StudyPrevention;
  created_at: string;
  updated_at: string;
}
