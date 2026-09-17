import { Cpu, Gauge, MemoryStick, HardDrive } from 'lucide-react'
import { SystemMonitor } from '../components/dashboard/SystemMonitor'
import { useMetrics } from '../contexts/MetricsContext'
import { formatBytes, formatUptime } from '../services/mockData'

function GaugeRing({ value, size = 72, label, color }: { value: number; size?: number; label: string; color: string }) {
  const r = (size - 8) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className="absolute text-[13px] font-semibold text-[var(--zx-text-1)]">{Math.round(value)}%</span>
      </div>
      <span className="text-[9px] font-medium text-[var(--zx-text-3)]">{label}</span>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, color, sub }: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: string
  color: string
  sub?: string
}) {
  return (
    <div className="rounded-[var(--zx-radius-2)] bg-[var(--zx-bg-1)] border border-[var(--zx-border-1)] p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={10} className="text-[var(--zx-text-3)]" />
        <span className="text-[9px] text-[var(--zx-text-3)]">{label}</span>
      </div>
      <p className="text-[14px] font-semibold" style={{ color }}>{value}</p>
      {sub && <p className="text-[9px] text-[var(--zx-text-3)] mt-0.5">{sub}</p>}
    </div>
  )
}

function StatusBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-[var(--zx-text-3)]">{label}</span>
        <span className="text-[9px] text-[var(--zx-text-2)] tabular-nums">{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded bg-[var(--zx-bg-1)]">
        <div className="h-full rounded transition-all duration-700 ease-out" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 rounded-[var(--zx-radius-2)] bg-[var(--zx-bg-1)] animate-pulse" />
          ))}
        </div>
      </div>
      <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
        <div className="h-48 rounded bg-[var(--zx-bg-1)] animate-pulse" />
      </div>
    </div>
  )
}

export default function Monitoring() {
  const { data, loading, refresh } = useMetrics()

  if (loading && !data) {
    return <LoadingSkeleton />
  }

  const cpuUsage = data?.cpu.usage ?? 0
  const gpuUsage = data?.gpu.usage ?? 0
  const ramUsage = data?.ram.percentage ?? 0
  const diskUsage = data?.disk?.percentage ?? 0

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-[16px] font-semibold text-[var(--zx-text-1)]">Monitoramento em Tempo Real</h1>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--zx-success)] animate-pulse" />
            <span className="text-[8px] text-[var(--zx-success)] font-medium">AO VIVO</span>
          </div>
        </div>
        <button
          onClick={() => refresh()}
          className="flex items-center gap-1.5 rounded-[var(--zx-radius-2)] border border-[var(--zx-border-1)] bg-[var(--zx-bg-2)] px-3 py-1.5 text-[9px] font-medium text-[var(--zx-text-2)] hover:bg-[var(--zx-bg-3)] transition-all duration-[var(--zx-transition-1)]"
        >
          Atualizar
        </button>
      </div>

      <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <GaugeRing value={cpuUsage} label="CPU" color="#2563EB" />
          <GaugeRing value={gpuUsage} label="GPU" color="#22C55E" />
          <GaugeRing value={ramUsage} label="RAM" color="#3B82F6" />
          <GaugeRing value={diskUsage} label="Disco" color="#F59E0B" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard icon={Cpu} label="CPU" value={`${cpuUsage}%`} color="#2563EB" sub={data?.cpu.name} />
        <MetricCard icon={Gauge} label="GPU" value={`${gpuUsage}%`} color="#22C55E" sub={data?.gpu.name} />
        <MetricCard icon={MemoryStick} label="RAM" value={data ? formatBytes(data.ram.used) : '0'} color="#3B82F6" sub={data ? `${formatBytes(data.ram.free)} livres` : ''} />
        <MetricCard icon={HardDrive} label="Disco" value={data?.disk ? formatBytes(data.disk.used) : '0'} color="#F59E0B" sub={data?.disk ? `${formatBytes(data.disk.free)} livres` : ''} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
          <h3 className="text-[11px] font-semibold text-[var(--zx-text-1)] mb-3">Uso de Recursos</h3>
          <div className="space-y-3">
            <StatusBar label="CPU" value={cpuUsage} max={100} color="#2563EB" />
            <StatusBar label="GPU" value={gpuUsage} max={100} color="#22C55E" />
            <StatusBar label="RAM" value={data?.ram.used ?? 0} max={data?.ram.total ?? 1} color="#3B82F6" />
            {data?.disk && <StatusBar label="Disco" value={data.disk.used} max={data.disk.total} color="#F59E0B" />}
          </div>
        </div>

        <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
          <h3 className="text-[11px] font-semibold text-[var(--zx-text-1)] mb-3">Detalhes do Sistema</h3>
          <div className="space-y-1">
            <div className="flex items-center justify-between py-1 border-b border-[var(--zx-border-1)]">
              <span className="text-[9px] text-[var(--zx-text-3)]">Hostname</span>
              <span className="text-[10px] font-medium text-[var(--zx-text-2)]">{data?.system.hostname || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[var(--zx-border-1)]">
              <span className="text-[9px] text-[var(--zx-text-3)]">Plataforma</span>
              <span className="text-[10px] font-medium text-[var(--zx-text-2)]">{data?.system.platform || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[var(--zx-border-1)]">
              <span className="text-[9px] text-[var(--zx-text-3)]">Endereco IP</span>
              <span className="text-[10px] font-medium text-[var(--zx-text-2)]">{data?.network.ip || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[var(--zx-border-1)]">
              <span className="text-[9px] text-[var(--zx-text-3)]">Uptime</span>
              <span className="text-[10px] font-medium text-[var(--zx-text-2)]">{data ? formatUptime(data.uptime) : 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-[9px] text-[var(--zx-text-3)]">Nucleos CPU</span>
              <span className="text-[10px] font-medium text-[var(--zx-text-2)]">{data?.cpu.cores || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      <SystemMonitor />
    </div>
  )
}
