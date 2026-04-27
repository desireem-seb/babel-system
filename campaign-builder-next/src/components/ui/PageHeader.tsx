import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-3 px-4 md:px-6 pt-6 pb-4',
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">{title}</h1>
        {description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  )
}
