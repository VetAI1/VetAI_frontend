import { chartColor, chartFill } from '@/constants/charts';
import { httpClient } from '@/infra/http-client';
import type { Patient } from '@/types/patient';
import type { Study } from '@/types/study';

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface DashboardData {
  total_patients: number;
  total_studies: number;
  total_consultations: number;
  total_consultations_today: number;
  patients_by_specie: ChartData;
  studies_status: ChartData;
  consultations_status: ChartData;
  growth_overtime: ChartData;
  latest_patients: Patient[];
  latest_studies: Study[];
}

/**
 * Maps the snake_case properties from the backend API (background_color, border_color)
 * to camelCase (backgroundColor, borderColor) required by Chart.js, applying the
 * system palette on top — a cor é decisão de apresentação, não da API.
 */
type RawDataset = ChartDataset & {
  background_color?: string | string[];
  border_color?: string | string[];
};
type RawChartData = Omit<ChartData, 'datasets'> & { datasets: RawDataset[] };

function mapChartData(
  data: RawChartData,
  formatLabels?: (labels: string[]) => string[],
): ChartData {
  if (!data || !data.datasets) return data;

  return {
    ...data,
    labels: formatLabels ? formatLabels(data.labels ?? []) : data.labels,
    datasets: data.datasets.map((ds, index) => {
      // Uma cor por ponto (rosca, barras) ou uma por série (linha) — o formato
      // que o backend usou indica qual dos dois é o caso.
      const perPoint = Array.isArray(ds.background_color ?? ds.backgroundColor);

      if (perPoint) {
        return {
          label: ds.label,
          data: ds.data,
          backgroundColor: ds.data.map((_, pointIndex) =>
            chartColor(pointIndex),
          ),
        };
      }

      return {
        label: ds.label,
        data: ds.data,
        backgroundColor: chartFill(index),
        borderColor: chartColor(index),
      };
    }),
  };
}

/** Converts YYYY-MM-DD labels to dd/mm/YYYY */
function formatDateLabels(labels: string[]): string[] {
  return labels.map((l) => {
    const parts = l.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return l;
  });
}

export const analyticsService = {
  getDashboard: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<DashboardData> => {
    const query = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : '';

    type RawDashboard = Omit<
      DashboardData,
      | 'patients_by_specie'
      | 'studies_status'
      | 'consultations_status'
      | 'growth_overtime'
    > & {
      patients_by_specie: RawChartData;
      studies_status: RawChartData;
      consultations_status: RawChartData;
      growth_overtime: RawChartData;
    };
    const data = await httpClient<RawDashboard>(
      `analytics/reports/dashboard${query}`,
    );

    return {
      total_patients: data.total_patients,
      total_studies: data.total_studies,
      total_consultations: data.total_consultations,
      total_consultations_today: data.total_consultations_today,
      patients_by_specie: mapChartData(data.patients_by_specie),
      studies_status: mapChartData(data.studies_status),
      consultations_status: mapChartData(data.consultations_status),
      growth_overtime: mapChartData(data.growth_overtime, formatDateLabels),
      latest_patients: (data.latest_patients ?? []) as Patient[],
      latest_studies: (data.latest_studies ?? []) as Study[],
    };
  },
};
