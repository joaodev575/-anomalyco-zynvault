import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { cn } from "cn"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "#components/ui/dialog"
import { InputGroup, InputGroupAddon } from "#components/ui/input-group"
import { SearchIcon, CheckIcon } from "lucide-react"

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return <CommandPrimitive className={cn("flex size-full flex-col overflow-hidden rounded-[var(--zx-radius-4)] bg-[var(--zx-bg-2)] p-1 text-[var(--zx-text-1)]", className)} {...props} />
}

function CommandDialog({ title = "Command Palette", description = "Search for a command...", children, className, showCloseButton = false, ...props }: Omit<React.ComponentProps<typeof Dialog>, "children"> & { title?: string; description?: string; className?: string; showCloseButton?: boolean; children: React.ReactNode }) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only"><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
      <DialogContent className={cn("top-1/3 translate-y-0 overflow-hidden rounded-[var(--zx-radius-4)]! p-0", className)} showCloseButton={showCloseButton}>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[var(--zx-text-xs)] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[var(--zx-text-3)]">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div className="p-1 pb-0">
      <InputGroup className="h-8! rounded-[var(--zx-radius-2)]! border-[var(--zx-border-3)] bg-[var(--zx-bg-1)]/50 shadow-none! *:data-[slot=input-group-addon]:pl-2!">
        <CommandPrimitive.Input className={cn("w-full text-[var(--zx-text-sm)] outline-hidden text-[var(--zx-text-1)] placeholder:text-[var(--zx-text-4)] disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />
        <InputGroupAddon><SearchIcon className="size-4 shrink-0 text-[var(--zx-text-4)]" /></InputGroupAddon>
      </InputGroup>
    </div>
  )
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return <CommandPrimitive.List className={cn("no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none", className)} {...props} />
}

function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty className={cn("py-6 text-center text-[var(--zx-text-sm)] text-[var(--zx-text-3)]", className)} {...props} />
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return <CommandPrimitive.Group className={cn("overflow-hidden p-1 text-[var(--zx-text-1)] **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-[var(--zx-text-xs)] **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-[var(--zx-text-3)]", className)} {...props} />
}

function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return <CommandPrimitive.Separator className={cn("-mx-1 h-px bg-[var(--zx-border-2)]", className)} {...props} />
}

function CommandItem({ className, children, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item className={cn("group relative flex cursor-default items-center gap-2 rounded-[var(--zx-radius-1)] px-2 py-1.5 text-[var(--zx-text-sm)] outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-selected:bg-[var(--zx-bg-3)] data-selected:text-[var(--zx-text-1)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)} {...props}>
      {children}
      <CheckIcon className="ml-auto opacity-0 group-data-[checked=true]/command-item:opacity-100 text-[var(--zx-brand)]" />
    </CommandPrimitive.Item>
  )
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("ml-auto text-[var(--zx-text-xs)] tracking-widest text-[var(--zx-text-4)]", className)} {...props} />
}

export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator }
