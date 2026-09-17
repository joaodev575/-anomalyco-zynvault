import { memo } from 'react'
import { Clock, Monitor, Cpu, MemoryStick, Database, Gauge, Wifi } from 'lucide-react'
import { useMetrics } from '../../contexts/MetricsContext'
import { formatUptime, formatBytes } from '../../services/mockData'
import { Skeleton } from '#components/ui/skeleton'

function InfoRow({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: string
}) {
  return (
    <tr className="border-b border-[var(--zx-border-1)] last:border-0">
      <td className="py-2.5">
        <div className="flex items-center gap-2">
          <Icon size={11} className="text-[var(--zx-text-4)]" />
          <span className="text-[10px] text-[var(--zx-text-3)]">{label}</span>
        </div>
      </td>
      <td className="py-2.5 text-right">
        <span className="text-[10px] font-medium text-[var(--zx-text-2)] truncate max-w-[140px]">{value}</span>
      </td>
    </tr>
  )
}

function LoadingSkeleton() {
  return (
    <div className="zx-panel p-4">
      <Skeleton className="mb-3 h-3 w-28" />
      <table className="w-full">
        <tbody>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <tr key={i} className="border-b border-[var(--zx-border-1)]">
              <td className="py-2.5"><Skeleton className="h-3 w-24" /></td>
              <td className="py-2.5"><Skeleton className="h-3 w-20" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const SystemInfo = memo(function SystemInfo() {
  const { data, loading } = useMetrics()

  if (loading && !data) return <LoadingSkeleton />

  const getCpuInfo = () => {
    if (!data?.cpu) return 'N/A'
    const name = data.cpu.name.replace(/\s+/g, ' ').trim()
    return name.length > 28 ? name.substring(0, 28) + '...' : name
  }

  const getGpuName = () => {
    if (!data?.gpu || data.gpu.name === 'N/A') return 'N/A'
    const name = data.gpu.name.replace(/\s+/g, ' ').trim()
    return name.length > 28 ? name.substring(0, 28) + '...' : name
  }

  const getRamInfo = () => {
    if (!data?.ram) return 'N/A'
    return `${formatBytes(data.ram.used)} / ${formatBytes(data.ram.total)}`
  }

  const getStorageInfo = () => {
    if (!data?.disk) return 'N/A'
    return `${formatBytes(data.disk.used)} / ${formatBytes(data.disk.total)} (${data.disk.percentage}%)`
  }

  const getNetworkInfo = () => {
    if (!data?.network || data.network.ip === 'N/A') return 'N/A'
    return data.network.ip
  }

  return (
    <div className="zx-panel p-4">
      <h3 className="mb-3 text-[11px] font-semibold text-[var(--zx-text-1)]">Informacoes do Sistema</h3>

      <table className="zx-table">
        <tbody>
          <InfoRow icon={Cpu} label="Processador" value={getCpuInfo()} />
          <InfoRow icon={Gauge} label="Placa de Video" value={getGpuName()} />
          <InfoRow icon={Wifi} label="Rede (IP)" value={getNetworkInfo()} />
          <InfoRow icon={MemoryStick} label="Memoria RAM" value={getRamInfo()} />
          <InfoRow icon={Database} label="Armazenamento" value={getStorageInfo()} />
          <InfoRow icon={Clock} label="Uptime" value={data ? formatUptime(data.uptime) : 'N/A'} />
          <InfoRow icon={Monitor} label="Hostname" value={data?.system?.hostname || 'N/A'} />
        </tbody>
      </table>
    </div>
  )
})
