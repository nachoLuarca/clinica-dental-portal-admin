import { Skeleton } from '@/components/ui/skeleton'

/** Skeleton de carga reutilizable para listados en tabla. */
export function TableSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2 duration-300 animate-in fade-in">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  )
}
