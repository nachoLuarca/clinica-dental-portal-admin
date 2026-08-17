import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type PageAccent = 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan'

const ACCENT_CLASSES: Record<PageAccent, string> = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
}

interface PageHeaderProps {
  icon: LucideIcon
  title: string
  description: string
  accent?: PageAccent
  action?: ReactNode
}

/** Encabezado de página reutilizable: ícono con color de módulo, título, descripción y acción. */
export function PageHeader({ icon: Icon, title, description, accent = 'blue', action }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 duration-300 animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
      <div className="flex items-center gap-3">
        <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', ACCENT_CLASSES[accent])}>
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {action}
    </div>
  )
}
