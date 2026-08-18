'use client';

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

import { SectionCard } from '@/app/components/data/section-card';
import { Skeleton } from '@/components/ui/skeleton';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTitle,
  ChartTooltip,
  Legend,
  ArcElement,
);

interface AnalyticsChartProps {
  type: 'line' | 'bar' | 'doughnut';
  title: string;
  subtitle?: string;
  data: ChartData<any>;
  height?: number | string;
  loading?: boolean;
  className?: string;
}

export function AnalyticsChart({
  type,
  title,
  subtitle,
  data,
  height = 300,
  loading = false,
  className,
}: AnalyticsChartProps) {
  function cssVar(name: string, fallback: string): string {
    if (typeof window === 'undefined') return fallback;
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim() || fallback
    );
  }

  const tickColor = cssVar('--muted-foreground', '#64748b');
  const gridColor = cssVar('--border', 'rgba(0,0,0,0.06)');
  const tooltipBg = cssVar('--popover', '#0f172a');
  const tooltipFg = cssVar('--popover-foreground', '#f8fafc');

  const commonOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: tickColor,
          font: { size: 12 },
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipFg,
        bodyColor: tooltipFg,
        borderColor: gridColor,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
      },
    },
    scales:
      type === 'doughnut'
        ? undefined
        : {
          x: {
            grid: { display: false },
            ticks: { color: tickColor },
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: tickColor },
            beginAtZero: true,
          },
        },
  };

  if (loading) {
    return (
      <SectionCard
        title={<Skeleton className="h-5 w-40" />}
        subtitle={<Skeleton className="h-3.5 w-56 mt-1" />}
        {...(className ? { className } : {})}
      >
        <div className="w-full mt-4" style={{ height }}>
          {type === 'doughnut' ? (
            <div className="flex items-center justify-center h-full gap-8">
              <Skeleton className="w-44 h-44 rounded-full" />
              <div className="flex flex-col gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="w-3 h-3 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-end gap-2 h-full w-full pb-6">
              {Array.from({ length: type === 'bar' ? 6 : 8 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="flex-1 rounded-t-md"
                  style={{ height: `${30 + Math.sin(i * 1.2) * 20 + (i % 3) * 15}%` }}
                />
              ))}
            </div>
          )}
        </div>
      </SectionCard>
    );
  }

  const renderChart = () => {
    switch (type) {
    case 'line':
      return <Line data={data} options={commonOptions} height={height} />;
    case 'bar':
      return <Bar data={data} options={commonOptions} height={height} />;
    case 'doughnut':
      return <Doughnut data={data} options={commonOptions} height={height} />;
    default:
      return null;
    }
  };

  return (
    <SectionCard
      title={title}
      {...(subtitle ? { subtitle } : {})}
      {...(className ? { className } : {})}
    >
      <div className="w-full mt-4" style={{ height }}>
        {renderChart()}
      </div>
    </SectionCard>
  );
}
