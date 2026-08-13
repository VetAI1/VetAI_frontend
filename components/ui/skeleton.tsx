import { cn } from '@/infra/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-secondary dark:bg-muted',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
