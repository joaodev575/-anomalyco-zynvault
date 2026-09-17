import { cva } from 'class-variance-authority'
import { cn } from 'cn'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-[var(--zx-radius-2)] border transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zx-brand)] focus-visible:ring-offset-0 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default: "bg-[var(--zx-brand)] text-white border-[var(--zx-brand)] hover:bg-[var(--zx-brand-hover)] hover:border-[var(--zx-brand-hover)]",
        secondary: "bg-[var(--zx-bg-2)] text-[var(--zx-text-1)] border-[var(--zx-border-3)] hover:bg-[var(--zx-bg-3)] hover:border-[var(--zx-border-4)]",
        subtle: "bg-transparent text-[var(--zx-text-2)] border-transparent hover:bg-[var(--zx-bg-2)] hover:text-[var(--zx-text-1)]",
        ghost: "bg-transparent text-[var(--zx-text-2)] border-transparent hover:bg-[var(--zx-bg-2)] hover:text-[var(--zx-text-1)]",
        danger: "bg-[var(--zx-error-muted)] text-[var(--zx-error)] border-[var(--zx-error-border)] hover:bg-[var(--zx-error)] hover:text-white hover:border-[var(--zx-error)]",
        outline: "bg-transparent text-[var(--zx-brand)] border-[var(--zx-brand-border)] hover:bg-[var(--zx-brand-muted)]",
      },
      size: {
        default: "h-[34px] px-4 text-[var(--zx-text-sm)] font-medium",
        sm: "h-[28px] px-3 text-[var(--zx-text-xs)] font-medium",
        lg: "h-[38px] px-5 text-[var(--zx-text-base)] font-semibold",
        icon: "h-[32px] w-[32px]",
        smIcon: "h-[28px] w-[28px]",
        lgIcon: "h-[34px] w-[34px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function Button({ className, variant = "default", size = "default", ...props }: any) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
