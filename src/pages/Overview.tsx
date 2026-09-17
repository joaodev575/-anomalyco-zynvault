import { useMemo } from 'react'
import { SystemMonitor } from '../components/dashboard/SystemMonitor'
import { QuickActions } from '../components/dashboard/QuickActions'
import { SystemInfo } from '../components/dashboard/SystemInfo'
import { useMetrics } from '../contexts/MetricsContext'
import { formatUptime, formatBytes } from '../services/mockData'
import { cn } from '../lib/utils'
import { Cpu, MemoryStick, HardDrive, Gauge, Clock, Wifi } from 'lucide-react'

function MetricBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-[var(--zx-bg-2)] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
      />
    </div>
  )
}

export default function Overview() {
  const { data } = useMetrics()

  const cpuUsage = data?.cpu.usage ?? 0
  const ramUsage = data?.ram.percentage ?? 0
  const diskUsage = data?.disk?.percentage ?? 0
  const gpuUsage = data?.gpu.usage ?? 0

  const health = useMemo(() => {
    const max = Math.max(cpuUsage, ramUsage, diskUsage)
    if (max >= 90) return { label: 'Critico', color: 'var(--zx-error)', border: 'border-[var(--zx-error-border)]', muted: 'bg-[var(--zx-error-muted)]' }
    if (max >= 75) return { label: 'Atencao', color: 'var(--zx-warning)', border: 'border-[var(--zx-warning-border)]', muted: 'bg-[var(--zx-warning-muted)]' }
    return { label: 'Saudavel', color: 'var(--zx-success)', border: 'border-[var(--zx-success-border)]', muted: 'bg-[var(--zx-success-muted)]' }
  }, [cpuUsage, ramUsage, diskUsage])

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className={cn('flex items-center gap-3 rounded-[var(--zx-radius-3)] border px-3 py-2', health.border, health.muted)}>
        <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: health.color }} />
        <span className="text-[11px] font-semibold" style={{ color: health.color }}>{health.label}</span>
        <div className="h-4 w-px bg-[var(--zx-border-1)]" />
        <div className="flex items-center gap-1.5 text-[9px] text-[var(--zx-text-3)]">
          <Clock size={9} />
          <span className="tabular-nums">{data ? formatUptime(data.uptime) : 'N/A'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-[var(--zx-text-3)]">
          <Wifi size={9} />
          <span className="tabular-nums truncate max-w-[80px]">{data?.network?.ip ?? 'N/A'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Cpu, label: 'CPU', value: `${cpuUsage}%`, sub: data?.cpu.name, color: '#2563EB', bar: cpuUsage },
          { icon: MemoryStick, label: 'RAM', value: `${ramUsage}%`, sub: data ? `${formatBytes(data.ram.used)} / ${formatBytes(data.ram.total)}` : undefined, color: '#3B82F6', bar: ramUsage },
          { icon: HardDrive, label: 'Disco', value: `${diskUsage}%`, sub: data?.disk ? `${formatBytes(data.disk.free)} livres` : undefined, color: '#F59E0B', bar: diskUsage },
          { icon: Gauge, label: 'GPU', value: `${gpuUsage}%`, sub: data?.gpu.name !== 'N/A' ? data?.gpu.name : undefined, color: '#22C55E', bar: gpuUsage },
        ].map(m => (
          <div key={m.label} className="zx-panel-strong p-3 rounded-[var(--zx-radius-2)] border border-[var(--zx-border-1)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <m.icon size={11} className="shrink-0" />
                <span className="text-[9px] font-medium text-[var(--zx-text-3)]">{m.label}</span>
              </div>
              <span className="text-[12px] font-bold text-[var(--zx-text-1)] tabular-nums">{m.value}</span>
            </div>
            <MetricBar value={m.bar} color={m.color} />
            {m.sub && <p className="text-[8px] text-[var(--zx-text-4)] mt-1.5 truncate">{m.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        <div className="space-y-4 min-w-0">
          <SystemMonitor />
        </div>
        <div className="space-y-4">
          <QuickActions />
          <SystemInfo />
        </div>
      </div>
    </div>
  )
}
