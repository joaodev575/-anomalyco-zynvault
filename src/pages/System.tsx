import { Cpu, Gauge, MemoryStick, HardDrive, Monitor, Wifi, RefreshCw } from 'lucide-react'
import { useMetrics } from '../contexts/MetricsContext'
import { formatBytes, formatUptime } from '../services/mockData'

function SectionHeader({ icon: Icon, title }: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--zx-radius-2)] bg-[var(--zx-bg-1)] border border-[var(--zx-border-1)]">
        <Icon size={12} className="text-[var(--zx-text-3)]" />
      </div>
      <h3 className="text-[11px] font-semibold text-[var(--zx-text-1)]">{title}</h3>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[var(--zx-border-1)] last:border-0">
      <span className="text-[10px] text-[var(--zx-text-3)]">{label}</span>
      <span className="text-[10px] font-medium text-[var(--zx-text-2)] truncate ml-4 text-right max-w-[260px]">{value}</span>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
          <div className="h-5 w-32 rounded bg-[var(--zx-bg-1)] animate-pulse mb-3" />
          <div className="space-y-2">
            {[1, 2, 3].map(j => (
              <div key={j} className="h-4 w-full rounded bg-[var(--zx-bg-1)] animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function System() {
  const { data, loading, refresh } = useMetrics()

  if (loading && !data) {
    return <LoadingSkeleton />
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-semibold text-[var(--zx-text-1)]">Informacoes do Sistema</h1>
          <p className="text-[10px] text-[var(--zx-text-3)] mt-0.5">Detalhes de hardware e software</p>
        </div>
        <button
          onClick={() => refresh()}
          className="flex items-center gap-1.5 rounded-[var(--zx-radius-2)] border border-[var(--zx-border-1)] bg-[var(--zx-bg-2)] px-3 py-1.5 text-[9px] font-medium text-[var(--zx-text-2)] hover:bg-[var(--zx-bg-3)] transition-all duration-[var(--zx-transition-1)]"
        >
          <RefreshCw size={10} />
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
          <SectionHeader icon={Cpu} title="Processador" />
          <InfoRow label="Modelo" value={data?.cpu.name || 'N/A'} />
          <InfoRow label="Nucleos" value={data?.cpu.cores ? `${data.cpu.cores} threads` : 'N/A'} />
          <InfoRow label="Frequencia" value={data?.cpu.speed ? `${data.cpu.speed} GHz` : 'N/A'} />
          <InfoRow label="Uso" value={data ? `${data.cpu.usage}%` : 'N/A'} />
        </div>

        <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
          <SectionHeader icon={Gauge} title="Placa de Video" />
          <InfoRow label="Modelo" value={data?.gpu.name || 'N/A'} />
          <InfoRow label="Fabricante" value={data?.gpu.vendor || 'N/A'} />
          <InfoRow label="VRAM Total" value={data?.gpu.vramTotal ? formatBytes(data.gpu.vramTotal) : 'N/A'} />
          <InfoRow label="VRAM Usado" value={data?.gpu.vramUsed ? formatBytes(data.gpu.vramUsed) : 'N/A'} />
          <InfoRow label="Uso" value={data ? `${data.gpu.usage}%` : 'N/A'} />
        </div>

        <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
          <SectionHeader icon={MemoryStick} title="Memoria" />
          <InfoRow label="Total" value={data?.ram.total ? formatBytes(data.ram.total) : 'N/A'} />
          <InfoRow label="Usado" value={data?.ram.used ? formatBytes(data.ram.used) : 'N/A'} />
          <InfoRow label="Livre" value={data?.ram.free ? formatBytes(data.ram.free) : 'N/A'} />
          <InfoRow label="Uso" value={data ? `${data.ram.percentage}%` : 'N/A'} />
        </div>

        <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
          <SectionHeader icon={HardDrive} title="Armazenamento" />
          {data?.disk ? (
            <>
              <InfoRow label="Total" value={formatBytes(data.disk.total)} />
              <InfoRow label="Usado" value={formatBytes(data.disk.used)} />
              <InfoRow label="Livre" value={formatBytes(data.disk.free)} />
              <InfoRow label="Uso" value={`${data.disk.percentage}%`} />
            </>
          ) : (
            <InfoRow label="Status" value="Sem dados disponiveis" />
          )}
        </div>

        <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
          <SectionHeader icon={Monitor} title="Sistema Operacional" />
          <InfoRow label="Hostname" value={data?.system.hostname || 'N/A'} />
          <InfoRow label="Plataforma" value={data?.system.platform || 'N/A'} />
          <InfoRow label="Versao" value={data?.system.release || 'N/A'} />
          <InfoRow label="Arquitetura" value={data?.system.arch || 'N/A'} />
          <InfoRow label="Versao Windows" value={data?.system.windowsVersion || 'N/A'} />
          <InfoRow label="Uptime" value={data ? formatUptime(data.uptime) : 'N/A'} />
        </div>

        <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
          <SectionHeader icon={Wifi} title="Rede" />
          <InfoRow label="Interface" value={data?.network.iface || 'N/A'} />
          <InfoRow label="Endereco IP" value={data?.network.ip || 'N/A'} />
          <InfoRow label="Velocidade" value={data?.network.speed ? `${data.network.speed} Mbps` : 'N/A'} />
        </div>
      </div>
    </div>
  )
}
