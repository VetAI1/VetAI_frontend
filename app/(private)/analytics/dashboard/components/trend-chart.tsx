'use client';

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
  type ScriptableContext,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import { Skeleton } from '@/components/ui/skeleton';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

export interface TrendSeries {
  label: string;
  data: number[];
  color: string;
}

interface TrendChartProps {
  labels: string[];
  series: TrendSeries[];
  loading?: boolean;
  height?: number;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const value = parseInt(clean, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function isDarkMode(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

export function TrendChart({
  labels,
  series,
  loading = false,
  height = 300,
}: TrendChartProps) {
  if (loading) {
    return <Skeleton className="w-full rounded-lg" style={{ height }} />;
  }

  const dark = isDarkMode();
  const surface = dark ? '#1c1917' : '#ffffff';
  const gridColor = dark ? 'rgba(68,64,60,0.55)' : 'rgba(231,229,228,0.9)';
  const tickColor = dark ? '#a8a29e' : '#78716c';

  const data = {
    labels,
    datasets: series.map((item) => ({
      label: item.label,
      data: item.data,
      borderColor: item.color,
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      backgroundColor: (context: ScriptableContext<'line'>) => {
        const { ctx, chartArea } = context.chart;
        if (!chartArea) return hexToRgba(item.color, 0.1);
        const gradient = ctx.createLinearGradient(
          0,
          chartArea.top,
          0,
          chartArea.bottom,
        );
        gradient.addColorStop(0, hexToRgba(item.color, 0.16));
        gradient.addColorStop(1, hexToRgba(item.color, 0));
        return gradient;
      },
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBorderWidth: 2,
      pointHoverBorderColor: surface,
      pointHoverBackgroundColor: item.color,
    })),
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: surface,
        titleColor: dark ? '#f5f5f4' : '#1c1917',
        bodyColor: dark ? '#a8a29e' : '#57534e',
        borderColor: gridColor,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        displayColors: true,
        usePointStyle: true,
        boxPadding: 4,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: tickColor,
          font: { size: 11 },
          maxRotation: 0,
          autoSkipPadding: 24,
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        border: { display: false },
        ticks: {
          color: tickColor,
          font: { size: 11 },
          precision: 0,
          maxTicksLimit: 5,
        },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Line data={data} options={options} />
    </div>
  );
}
