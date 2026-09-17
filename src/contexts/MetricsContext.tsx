import { createContext, useContext, type ReactNode } from 'react'
import { useSystemMetrics, type SystemMetrics, type SystemMetricsState } from '../hooks/useSystemMetrics'

interface MetricsContextValue extends SystemMetricsState {
  refresh: () => void
  formatBytes: (bytes: number) => string
  formatUptime: (seconds: number) => string
}

const MetricsContext = createContext<MetricsContextValue | null>(null)

export function MetricsProvider({ children }: { children: ReactNode }) {
  const metrics = useSystemMetrics()
  return <MetricsContext.Provider value={metrics}>{children}</MetricsContext.Provider>
}

export function useMetrics() {
  const ctx = useContext(MetricsContext)
  if (!ctx) throw new Error('useMetrics must be used within MetricsProvider')
  return ctx
}

export type { SystemMetrics }
