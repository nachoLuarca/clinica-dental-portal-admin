import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  message: string
}

/** Estado vacío reutilizable para listados sin datos. */
export function EmptyState({ icon: Icon, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center text-muted-foreground duration-300 animate-in fade-in fill-mode-both">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Icon className="size-6" strokeWidth={1.5} />
      </span>
      <p>{message}</p>
    </div>
  )
}
