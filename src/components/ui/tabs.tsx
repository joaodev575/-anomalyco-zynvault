import { useState, createContext, useContext, ReactNode } from 'react'
import { cn } from 'cn'

interface TabsContextValue { value: string; onValueChange: (v: string) => void }
const TabsContext = createContext<TabsContextValue>({ value: '', onValueChange: () => {} })

function Tabs({ value, onValueChange, children, ...props }: { value?: string; onValueChange?: (v: string) => void; children: ReactNode; className?: string }) {
  const [internal, setInternal] = useState('')
  const current = value ?? internal
  const onChange = onValueChange ?? setInternal
  return <TabsContext.Provider value={{ value: current, onValueChange: onChange }}><div {...props}>{children}</div></TabsContext.Provider>
}

function TabsList({ className, ...props }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex border-b border-[var(--zx-border-2)]", className)} {...props} />
}

function TabsTrigger({ className, value, children, ...props }: { className?: string; value: string; children: ReactNode }) {
  const ctx = useContext(TabsContext)
  const active = ctx.value === value
  return (
    <button
      className={cn("flex-1 flex items-center justify-center gap-1.5 text-[var(--zx-text-xs)] font-medium px-2 py-2 transition-all border-b-2", active ? "text-[var(--zx-brand-hover)] border-[var(--zx-brand)]" : "text-[var(--zx-text-3)] border-transparent hover:text-[var(--zx-text-1)]", className)}
      onClick={() => ctx.onValueChange(value)}
      {...props}
    >{children}</button>
  )
}

function TabsContent({ className, value, children, ...props }: { className?: string; value: string; children: ReactNode }) {
  const ctx = useContext(TabsContext)
  if (ctx.value !== value) return null
  return <div className={cn("pt-3", className)} {...props}>{children}</div>
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
