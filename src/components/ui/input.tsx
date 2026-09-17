import { cn } from 'cn'

function Input({ className, type, ...props }: any) {
  return (
    <input
      type={type}
      className={cn(
        "h-[34px] w-full min-w-0 rounded-[var(--zx-radius-2)] border border-[var(--zx-border-3)] bg-[var(--zx-bg-1)] px-3 text-[var(--zx-text-sm)] text-[var(--zx-text-1)] placeholder:text-[var(--zx-text-4)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--zx-brand)] focus-visible:ring-offset-0 focus-visible:border-[var(--zx-brand)] hover:border-[var(--zx-border-4)] disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[var(--zx-bg-2)]",
        className
      )}
      {...props}
    />
  )
}

function Textarea({ className, ...props }: any) {
  return (
    <textarea
      className={cn(
        "h-24 w-full min-w-0 rounded-[var(--zx-radius-2)] border border-[var(--zx-border-3)] bg-[var(--zx-bg-1)] px-3 py-2 text-[var(--zx-text-sm)] text-[var(--zx-text-1)] placeholder:text-[var(--zx-text-4)] resize-none transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--zx-brand)] focus-visible:border-[var(--zx-brand)] hover:border-[var(--zx-border-4)] disabled:opacity-40 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
}

export { Input, Textarea }
