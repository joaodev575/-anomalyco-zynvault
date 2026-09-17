import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Button } from "#components/ui/button"
import { Input } from "#components/ui/input"
import { Textarea } from "#components/ui/textarea"

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="group"
      className={cn("group/input-group relative flex h-[34px] w-full min-w-0 items-center rounded-[var(--zx-radius-2)] border border-[var(--zx-border-3)] bg-[var(--zx-bg-1)] transition-colors outline-none has-disabled:opacity-50 has-[[data-slot=input-group-control]:focus-visible]:border-[var(--zx-brand)] has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-[var(--zx-brand-muted)]", className)}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-[var(--zx-text-sm)] font-medium text-[var(--zx-text-3)] select-none",
  {
    variants: {
      align: {
        "inline-start": "order-first pl-2 has-[>button]:ml-[-0.3rem]",
        "inline-end": "order-last pr-2 has-[>button]:mr-[-0.3rem]",
        "block-start": "order-first w-full justify-start px-2.5 pt-2",
        "block-end": "order-last w-full justify-start px-2.5 pb-2",
      },
    },
    defaultVariants: { align: "inline-start" },
  }
)

function InputGroupAddon({ className, align = "inline-start", ...props }: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => { if (!(e.target as HTMLElement).closest("button")) e.currentTarget.parentElement?.querySelector("input")?.focus() }}
      {...props}
    />
  )
}

function InputGroupButton({ className, type = "button", variant = "ghost", size = "xs", ...props }: Omit<React.ComponentProps<typeof Button>, "size" | "type"> & { type?: "button" | "submit" | "reset" }) {
  return <Button type={type} variant={variant} className={cn("flex items-center gap-2 text-[var(--zx-text-sm)] shadow-none h-6 gap-1 rounded-[var(--zx-radius-1)] px-1.5", className)} {...props} />
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("flex items-center gap-2 text-[var(--zx-text-sm)] text-[var(--zx-text-3)]", className)} {...props} />
}

function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  return <Input data-slot="input-group-control" className={cn("flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent", className)} {...props} />
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <Textarea data-slot="input-group-control" className={cn("flex-1 resize-none rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent", className)} {...props} />
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea }
