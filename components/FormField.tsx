import { cn } from '@/lib/utils'

// One labelled form field: label (with a required * or an "optional" tag), the input itself,
// then either the validation error or a hint underneath. Presentational only; the input and
// its register()/aria-invalid wiring are passed in as children.
export default function FormField({
  id,
  label,
  required = false,
  optional = false,
  error,
  hint,
  className,
  children,
}: {
  id: string
  label: string
  required?: boolean
  optional?: boolean
  error?: string
  hint?: string
  className?: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="flex items-baseline gap-1.5 text-sm font-medium">
        {label}
        {required && <span className="text-destructive" aria-hidden="true">*</span>}
        {optional && <span className="text-xs font-normal text-muted-foreground">optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
