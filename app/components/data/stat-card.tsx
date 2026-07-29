import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: number | string;
  loading?: boolean;
}

export function StatCard({ title, value, loading = false }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
      <h3 className="text-gray-500 dark:text-slate-400 text-sm font-medium">
        {title}
      </h3>
      {loading ? (
        <Skeleton className="h-9 w-20 mt-2" />
      ) : (
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          {value}
        </p>
      )}
    </div>
  );
}
