import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: number | string;
  loading?: boolean;
}

export function StatCard({ title, value, loading = false }: StatCardProps) {
  return (
    <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5">
      <h3 className="text-stone-500 dark:text-stone-400 text-sm font-medium">
        {title}
      </h3>
      {loading ? (
        <Skeleton className="h-9 w-20 mt-2" />
      ) : (
        <p className="font-data text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 mt-2">
          {value}
        </p>
      )}
    </div>
  );
}
