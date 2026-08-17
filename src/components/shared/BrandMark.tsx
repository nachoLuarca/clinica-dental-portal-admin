import { cn } from '@/lib/utils'

/**
 * Ícono de marca propio del portal (una muela estilizada) para reforzar la
 * identidad visual del producto, en vez de reutilizar un ícono genérico de
 * lucide-react como logo.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('size-5', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 2.25c-1.55 0-2.55.62-3.32.9-.5.18-.9.3-1.36.3-.5 0-.98-.2-1.5-.4-1.14-.44-2.55-.1-3.24 1.1-.5.86-.6 2-.42 3.35.22 1.7.85 3.05 1.3 4.55.1.33.2.66.28 1 .42 1.75.5 3.8 1.35 5.5.5 1 1.25 1.95 2.45 1.95 1.7 0 1.85-2.3 2.2-3.85.28-1.2.62-2.35 1.26-2.35s.98 1.15 1.26 2.35c.35 1.55.5 3.85 2.2 3.85 1.2 0 1.95-.95 2.45-1.95.85-1.7.93-3.75 1.35-5.5.08-.34.18-.67.28-1 .45-1.5 1.08-2.85 1.3-4.55.18-1.35.08-2.49-.42-3.35-.69-1.2-2.1-1.54-3.24-1.1-.52.2-1 .4-1.5.4-.46 0-.86-.12-1.36-.3-.77-.28-1.77-.9-3.32-.9Z"
        fill="currentColor"
      />
      <path
        d="M9.5 8.25c.9-.55 1.9-.55 2.5 0"
        stroke="var(--color-primary-foreground, white)"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  )
}
