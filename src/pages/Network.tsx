import { useState, useCallback } from 'react'
import { Wifi, Globe, Activity, RefreshCw, Loader2, Check, XCircle, Send, Trash2 } from 'lucide-react'
import { useMetrics } from '../contexts/MetricsContext'
import { trackActivity, trackFeatureUse, ActivityActions } from '../lib/telemetry'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--zx-border-1)] last:border-0">
      <span className="text-[10px] text-[var(--zx-text-3)]">{label}</span>
      <span className="text-[10px] font-medium text-[var(--zx-text-2)] truncate ml-4">{value}</span>
    </div>
  )
}

function ToolButton({ icon: Icon, label, description, onClick, loading }: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  description: string
  onClick: () => void
  loading?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-3 rounded-[var(--zx-radius-2)] px-3 py-2.5 border border-[var(--zx-border-1)] bg-[var(--zx-bg-1)] hover:bg-[var(--zx-bg-2)] transition-all duration-[var(--zx-transition-1)] text-left w-full disabled:opacity-60"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--zx-radius-2)] bg-[var(--zx-bg-2)] border border-[var(--zx-border-1)]">
        {loading ? <Loader2 size={13} className="animate-spin text-[var(--zx-brand)]" /> : <Icon size={13} className="text-[var(--zx-text-3)]" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-[var(--zx-text-1)]">{label}</p>
        <p className="text-[9px] text-[var(--zx-text-3)]">{description}</p>
      </div>
    </button>
  )
}

function PingResult({ target, reachable, time }: { target: string; reachable: boolean; time?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-[var(--zx-radius-2)] px-3 py-2 border border-[var(--zx-border-1)] bg-[var(--zx-bg-1)]">
      {reachable ? (
        <Check size={11} className="text-[var(--zx-success)] shrink-0" />
      ) : (
        <XCircle size={11} className="text-[var(--zx-error)] shrink-0" />
      )}
      <span className="text-[10px] font-medium text-[var(--zx-text-1)]">{target}</span>
      <span className="text-[9px] text-[var(--zx-text-3)] ml-auto">{reachable ? `${time || 'OK'}` : 'Inalcanavel'}</span>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {[1, 2].map(i => (
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

export default function Network() {
  const { data, loading, refresh } = useMetrics()
  const [pingTarget, setPingTarget] = useState('8.8.8.8')
  const [pingResults, setPingResults] = useState<Array<{ target: string; reachable: boolean; time?: string }>>([])
  const [pingLoading, setPingLoading] = useState(false)
  const [dnsFlushStatus, setDnsFlushStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle')

  const runPing = useCallback(async () => {
    if (!pingTarget.trim()) return
    trackActivity(ActivityActions.RUN_PING.action, ActivityActions.RUN_PING.category, pingTarget)
    trackFeatureUse('network_ping', pingTarget)
    setPingLoading(true)
    try {
      if (window.zynvaultAPI) {
        const result = await window.zynvaultAPI.runPing(pingTarget)
        setPingResults(prev => [{ target: pingTarget, reachable: result.reachable, time: result.time }, ...prev].slice(0, 5))
      } else {
        await new Promise(resolve => setTimeout(resolve, 800))
        setPingResults(prev => [{ target: pingTarget, reachable: false, time: undefined }, ...prev].slice(0, 5))
      }
    } catch {
      setPingResults(prev => [{ target: pingTarget, reachable: false }, ...prev].slice(0, 5))
    }
    setPingLoading(false)
  }, [pingTarget])

  const flushDns = useCallback(async () => {
    trackActivity(ActivityActions.FLUSH_DNS.action, ActivityActions.FLUSH_DNS.category)
    trackFeatureUse('network_flush_dns')
    setDnsFlushStatus('running')
    try {
      const result = await window.zynvaultAPI?.flushDns()
      setDnsFlushStatus(result?.success ? 'done' : 'error')
    } catch {
      setDnsFlushStatus('error')
    }
    setTimeout(() => setDnsFlushStatus('idle'), 2000)
  }, [])

  const runNetworkDiagnostic = useCallback(async () => {
    setPingLoading(true)
    const targets = ['8.8.8.8', '1.1.1.1', 'google.com']
    setPingResults([])
    for (const t of targets) {
      try {
        if (window.zynvaultAPI) {
          const result = await window.zynvaultAPI.runPing(t)
          setPingResults(prev => [...prev, { target: t, reachable: result.reachable, time: result.time }])
        } else {
          await new Promise(resolve => setTimeout(resolve, 500))
          setPingResults(prev => [...prev, { target: t, reachable: false }])
        }
      } catch {
        setPingResults(prev => [...prev, { target: t, reachable: false }])
      }
    }
    setPingLoading(false)
  }, [])

  if (loading && !data) {
    return <LoadingSkeleton />
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 max-w-[1000px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-semibold text-[var(--zx-text-1)]">Rede</h1>
          <p className="text-[10px] text-[var(--zx-text-3)] mt-0.5">Informacoes de conexao e diagnosticos</p>
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
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--zx-radius-2)] bg-[var(--zx-bg-1)] border border-[var(--zx-border-1)]">
              <Wifi size={12} className="text-[var(--zx-text-3)]" />
            </div>
            <h3 className="text-[11px] font-semibold text-[var(--zx-text-1)]">Detalhes da Conexao</h3>
          </div>
          <InfoRow label="Interface" value={data?.network.iface || 'N/A'} />
          <InfoRow label="Endereco IP" value={data?.network.ip || 'N/A'} />
          <InfoRow label="Velocidade" value={data?.network.speed ? `${data.network.speed} Mbps` : 'N/A'} />
          <InfoRow label="Status" value={data?.network.ip && data.network.ip !== 'N/A' ? 'Conectado' : 'Desconectado'} />
        </div>

        <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--zx-radius-2)] bg-[var(--zx-bg-1)] border border-[var(--zx-border-1)]">
              <Globe size={12} className="text-[var(--zx-text-3)]" />
            </div>
            <h3 className="text-[11px] font-semibold text-[var(--zx-text-1)]">DNS e Gateway</h3>
          </div>
          <InfoRow label="Servidor DNS" value="Padrao do Sistema" />
          <InfoRow label="Gateway" value={data?.network.ip ? '192.168.1.1' : 'N/A'} />
          <InfoRow label="Conectividade" value={data?.network.ip && data.network.ip !== 'N/A' ? 'Online' : 'Offline'} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
          <h3 className="text-[11px] font-semibold text-[var(--zx-text-1)] mb-3">Ferramentas</h3>
          <div className="space-y-2">
            <ToolButton icon={Send} label="Teste de Ping" description="Testar conectividade com um host" onClick={runPing} loading={pingLoading} />
            <ToolButton icon={Globe} label="Consulta DNS" description="Resolver nome de dominio para IP" onClick={runPing} loading={pingLoading} />
            <ToolButton icon={Trash2} label="Limpar DNS" description="Limpar cache do resolvedor DNS" onClick={flushDns} loading={dnsFlushStatus === 'running'} />
            <ToolButton icon={Activity} label="Diagnostico de Rede" description="Executar diagnostico completo de rede" onClick={runNetworkDiagnostic} loading={pingLoading} />
          </div>
        </div>

        <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
          <h3 className="text-[11px] font-semibold text-[var(--zx-text-1)] mb-3">Resultados do Ping</h3>
          <div className="mb-3 flex items-center gap-2">
            <input
              type="text"
              value={pingTarget}
              onChange={e => setPingTarget(e.target.value)}
              placeholder="Destino (IP ou dominio)"
              className="flex-1 rounded-[var(--zx-radius-2)] border border-[var(--zx-border-1)] bg-[var(--zx-bg-1)] px-2.5 py-1.5 text-[10px] text-[var(--zx-text-1)] placeholder:text-[var(--zx-text-4)] focus:outline-none focus:border-[var(--zx-brand-border)]"
            />
            <button
              onClick={runPing}
              disabled={pingLoading}
              className="rounded-[var(--zx-radius-2)] bg-[var(--zx-brand)] px-3 py-1.5 text-[9px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {pingLoading ? <Loader2 size={10} className="animate-spin" /> : 'Ping'}
            </button>
          </div>
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
            {pingResults.length === 0 ? (
              <p className="text-[9px] text-[var(--zx-text-3)] text-center py-4">Nenhum resultado ainda</p>
            ) : (
              pingResults.map((r, i) => <PingResult key={`${r.target}-${i}`} {...r} />)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
