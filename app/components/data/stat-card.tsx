import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: number | string;
  loading?: boolean;
}

export function StatCard({ title, value, loading = false }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-muted-foreground text-sm font-medium">
        {title}
      </h3>
      {loading ? (
        <Skeleton className="h-9 w-20 mt-2" />
      ) : (
        <p className="font-data text-3xl font-semibold tracking-tight text-foreground mt-2">
          {value}
        </p>
      )}
    </div>
  );
}
