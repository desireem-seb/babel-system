import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full h-9 px-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100',
              'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400',
              'disabled:opacity-50 disabled:bg-zinc-50 dark:disabled:bg-zinc-900',
              'transition-colors duration-150',
              icon && 'pl-9',
              error && 'border-red-300 focus:border-red-400 focus:ring-red-500/20',
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    )
  }
)
Input.displayName = 'Input'
