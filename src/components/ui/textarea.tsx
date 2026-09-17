import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
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

export { Textarea }
