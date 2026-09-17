import { useState, memo } from 'react'
import { Cpu, Gauge, MemoryStick, Clock, HardDrive, CircuitBoard, Zap, Disc } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '#components/ui/tabs'
import { Skeleton } from '#components/ui/skeleton'
import { cn } from '../../lib/utils'
import { SystemChart } from './SystemChart'
import { useMetrics } from '../../contexts/MetricsContext'
import { formatUptime, formatBytes } from '../../services/mockData'

const TAB_META: Record<SystemTab, { label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  cpu: { label: 'CPU', icon: Cpu },
  gpu: { label: 'GPU', icon: Gauge },
  ram: { label: 'RAM', icon: MemoryStick },
}

type SystemTab = 'cpu' | 'gpu' | 'ram'

function UsageRing({ value, color, size = 80 }: { value: number; color: string; size?: number }) {
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--zx-border-1)" strokeWidth="5" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-[16px] font-bold text-[var(--zx-text-1)] tabular-nums">
        {Math.round(value)}%
      </span>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="zx-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-14" />
      </div>
      <Skeleton className="mb-3 h-5 w-36" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <Skeleton className="h-[80px] w-[80px] rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
      <Skeleton className="mt-4 h-[160px] w-full" />
    </div>
  )
}

export const SystemMonitor = memo(function SystemMonitor() {
  const [activeTab, setActiveTab] = useState<SystemTab>('cpu')
  const { data, loading, error } = useMetrics()

  if (loading && !data) return <LoadingSkeleton />

  if (error && !data) {
    return (
      <div className="zx-panel p-4">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--zx-error-muted)]">
            <Cpu size={18} className="text-[var(--zx-error)]" />
          </div>
          <p className="mb-1 text-[12px] font-medium text-[var(--zx-text-1)]">Dados indisponiveis</p>
          <p className="text-[10px] text-[var(--zx-text-3)]">Nao foi possivel obter dados do sistema</p>
        </div>
      </div>
    )
  }

  const getUsage = (tab: SystemTab) => {
    switch (tab) {
      case 'cpu': return data?.cpu.usage ?? 0
      case 'gpu': return data?.gpu.usage ?? 0
      case 'ram': return data?.ram.percentage ?? 0
    }
  }

  const getTabName = (tab: SystemTab) => {
    switch (tab) {
      case 'cpu': return data?.cpu.name ?? 'N/A'
      case 'gpu': return data?.gpu.name ?? 'N/A'
      case 'ram': return data ? `${(data.ram.total / (1024 ** 3)).toFixed(0)} GB` : 'N/A'
    }
  }

  const getUptime = () => data ? formatUptime(data.uptime) : 'N/A'

  const tabColor = (tab: SystemTab) => tab === 'cpu' ? '#2563EB' : tab === 'gpu' ? '#22C55E' : '#3B82F6'

  return (
    <div className="zx-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold text-[var(--zx-text-1)]">Monitor do Sistema</h3>
        <div className="flex items-center gap-1.5 text-[9px] text-[var(--zx-text-3)]">
          <Clock size={10} />
          <span className="tabular-nums">{getUptime()}</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as SystemTab)}>
        <TabsList className="mb-3">
          {Object.entries(TAB_META).map(([key, meta]) => (
            <TabsTrigger key={key} value={key} className="gap-1.5 text-[10px] px-2 py-1.5">
              <meta.icon size={11} />
              {meta.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(TAB_META).map((key) => {
          const tab = key as SystemTab
          const meta = TAB_META[tab]
          const tabUsage = getUsage(tab)
          const color = tabColor(tab)

          return (
            <TabsContent key={tab} value={tab} className="zx-stack-md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                <div className="flex shrink-0 flex-col items-center gap-2">
                  <UsageRing value={tabUsage} color={color} />
                  <span className="text-[9px] font-medium text-[var(--zx-text-3)]">
                    Uso da {meta.label}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-[11px] font-medium text-[var(--zx-text-1)] truncate max-w-[180px]">
                      {getTabName(tab)}
                    </span>
                    <span className={cn(
                      'rounded-[var(--zx-radius-1)] px-1.5 py-0.5 text-[8px] font-medium',
                      tabUsage < 50
                        ? 'bg-[var(--zx-success-muted)] text-[var(--zx-success)] border border-[var(--zx-success-border)]'
                        : tabUsage < 80
                          ? 'bg-[var(--zx-warning-muted)] text-[var(--zx-warning)] border border-[var(--zx-warning-border)]'
                          : 'bg-[var(--zx-error-muted)] text-[var(--zx-error)] border border-[var(--zx-error-border)]'
                    )}>
                      {tabUsage < 50 ? 'Estavel' : tabUsage < 80 ? 'Moderado' : 'Alto'}
                    </span>
                  </div>

                  {tab === 'ram' && data && (
                    <div className="mb-3 zx-stack-sm">
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="text-[var(--zx-text-3)]">
                          {formatBytes(data.ram.used)} / {formatBytes(data.ram.total)}
                        </span>
                        <span className="text-[var(--zx-text-2)] tabular-nums">{data.ram.percentage}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded bg-[var(--zx-bg-1)]">
                        <div className="h-full rounded transition-all duration-700 ease-out" style={{ width: `${data.ram.percentage}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  )}

                  {tab === 'gpu' && data && data.gpu.vramTotal > 0 && (
                    <div className="mb-3 zx-stack-sm">
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="text-[var(--zx-text-3)]">VRAM</span>
                        <span className="text-[var(--zx-text-2)] tabular-nums">{formatBytes(data.gpu.vramTotal)}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded bg-[var(--zx-bg-1)]">
                        <div className="h-full rounded transition-all duration-700 ease-out" style={{ width: `${Math.min(tabUsage + 20, 100)}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {tab === 'cpu' && (
                      <>
                        <div className="rounded-[var(--zx-radius-2)] border border-[var(--zx-border-1)] bg-[var(--zx-bg-1)] p-2.5">
                          <div className="mb-1 flex items-center gap-1.5 text-[8px] text-[var(--zx-text-3)]">
                            <Zap size={9} /> Frequencia
                          </div>
                          <span className="text-[12px] font-medium text-[var(--zx-text-1)] tabular-nums">
                            {data?.cpu.speed ? `${data.cpu.speed} GHz` : 'N/A'}
                          </span>
                        </div>
                        <div className="rounded-[var(--zx-radius-2)] border border-[var(--zx-border-1)] bg-[var(--zx-bg-1)] p-2.5">
                          <div className="mb-1 flex items-center gap-1.5 text-[8px] text-[var(--zx-text-3)]">
                            <CircuitBoard size={9} /> Nucleos
                          </div>
                          <span className="text-[12px] font-medium text-[var(--zx-text-1)] tabular-nums">
                            {data?.cpu.cores ?? 'N/A'}
                          </span>
                        </div>
                      </>
                    )}

                    {tab === 'gpu' && (
                      <>
                        <div className="rounded-[var(--zx-radius-2)] border border-[var(--zx-border-1)] bg-[var(--zx-bg-1)] p-2.5">
                          <div className="mb-1 flex items-center gap-1.5 text-[8px] text-[var(--zx-text-3)]">
                            <Disc size={9} /> VRAM Total
                          </div>
                          <span className="text-[12px] font-medium text-[var(--zx-text-1)] tabular-nums">
                            {data?.gpu.vramTotal ? formatBytes(data.gpu.vramTotal) : 'N/A'}
                          </span>
                        </div>
                        <div className="rounded-[var(--zx-radius-2)] border border-[var(--zx-border-1)] bg-[var(--zx-bg-1)] p-2.5">
                          <div className="mb-1 flex items-center gap-1.5 text-[8px] text-[var(--zx-text-3)]">
                            <Gauge size={9} /> Fabricante
                          </div>
                          <span className="text-[12px] font-medium text-[var(--zx-text-1)] truncate">
                            {data?.gpu.vendor || 'N/A'}
                          </span>
                        </div>
                      </>
                    )}

                    {tab === 'ram' && (
                      <>
                        <div className="rounded-[var(--zx-radius-2)] border border-[var(--zx-border-1)] bg-[var(--zx-bg-1)] p-2.5">
                          <div className="mb-1 flex items-center gap-1.5 text-[8px] text-[var(--zx-text-3)]">
                            <HardDrive size={9} /> Livre
                          </div>
                          <span className="text-[12px] font-medium text-[var(--zx-text-1)] tabular-nums">
                            {data ? formatBytes(data.ram.free) : 'N/A'}
                          </span>
                        </div>
                        <div className="rounded-[var(--zx-radius-2)] border border-[var(--zx-border-1)] bg-[var(--zx-bg-1)] p-2.5">
                          <div className="mb-1 flex items-center gap-1.5 text-[8px] text-[var(--zx-text-3)]">
                            <Clock size={9} /> Uptime
                          </div>
                          <span className="text-[12px] font-medium text-[var(--zx-text-1)] tabular-nums">
                            {getUptime()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-[var(--zx-border-1)] pt-3 mt-1">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[9px] text-[var(--zx-text-3)]">Uso ao longo do tempo</span>
                </div>
                <SystemChart tab={activeTab} realUsage={tabUsage} />
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
})
