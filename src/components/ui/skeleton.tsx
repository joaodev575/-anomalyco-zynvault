import { cn } from 'cn'
import type React from 'react'

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("animate-zx-pulse rounded-[var(--zx-radius-2)] bg-[var(--zx-bg-3)]", className)} {...props} />
}

export { Skeleton }
