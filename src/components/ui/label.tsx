import * as React from "react"
import { cn } from "cn"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("flex items-center gap-2 text-[var(--zx-text-sm)] leading-none font-medium text-[var(--zx-text-2)] select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className)}
      {...props}
    />
  )
}

export { Label }
