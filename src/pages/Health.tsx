import { useState, useEffect, useCallback } from 'react'
import { Check, AlertTriangle, XCircle, Loader2, Search } from 'lucide-react'
import { trackActivity, trackFeatureUse, ActivityActions } from '../lib/telemetry'

type CheckStatus = 'running' | 'passed' | 'warning' | 'failed' | 'unknown'

interface DiagnosticCheck {
  id: string
  name: string
  status: CheckStatus
  detail: string
}

function StatusBadge({ status }: { status: CheckStatus }) {
  const config: Record<CheckStatus, { bg: string; text: string; border: string; label: string }> = {
    passed: { bg: 'bg-[var(--zx-success-muted)]', text: 'text-[var(--zx-success)]', border: 'border-[var(--zx-success-border)]', label: 'Aprovado' },
    warning: { bg: 'bg-[var(--zx-warning-muted)]', text: 'text-[var(--zx-warning)]', border: 'border-[var(--zx-warning-border)]', label: 'Atencao' },
    failed: { bg: 'bg-[var(--zx-error-muted)]', text: 'text-[var(--zx-error)]', border: 'border-[var(--zx-error-border)]', label: 'Falhou' },
    running: { bg: 'bg-[var(--zx-brand-muted)]', text: 'text-[var(--zx-brand)]', border: 'border-[var(--zx-brand-border)]', label: 'Executando' },
    unknown: { bg: 'bg-[var(--zx-bg-1)]', text: 'text-[var(--zx-text-3)]', border: 'border-[var(--zx-border-1)]', label: 'Pendente' },
  }
  const c = config[status]
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--zx-radius-1)] text-[8px] font-medium ${c.bg} ${c.text} border ${c.border}`}>
      {status === 'running' && <Loader2 size={8} className="animate-spin" />}
      {status === 'passed' && <Check size={8} />}
      {status === 'warning' && <AlertTriangle size={8} />}
      {status === 'failed' && <XCircle size={8} />}
      {c.label}
    </span>
  )
}

function CheckItem({ check }: { check: DiagnosticCheck }) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--zx-radius-2)] px-3 py-2.5 border border-[var(--zx-border-1)] bg-[var(--zx-bg-1)]">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-[var(--zx-text-1)]">{check.name}</span>
          <StatusBadge status={check.status} />
        </div>
        <p className="text-[9px] text-[var(--zx-text-3)] mt-0.5 truncate">{check.detail}</p>
      </div>
    </div>
  )
}

const INITIAL_CHECKS: DiagnosticCheck[] = [
  { id: 'storage', name: 'Saude do Armazenamento', status: 'unknown', detail: 'Ainda nao verificado' },
  { id: 'drivers', name: 'Status dos Drivers', status: 'unknown', detail: 'Ainda nao verificado' },
  { id: 'network', name: 'Configuracao de Rede', status: 'unknown', detail: 'Ainda nao verificado' },
  { id: 'smart', name: 'Status SMART', status: 'unknown', detail: 'Ainda nao verificado' },
  { id: 'system-files', name: 'Integridade dos Arquivos', status: 'unknown', detail: 'Ainda nao verificado' },
]

export default function Health() {
  const [checks, setChecks] = useState<DiagnosticCheck[]>(INITIAL_CHECKS)
  const [isRunning, setIsRunning] = useState(false)
  const [summary, setSummary] = useState<{ passed: number; warning: number; failed: number }>({ passed: 0, warning: 0, failed: 0 })

  const runDiagnostics = useCallback(async () => {
    if (isRunning) return
    trackActivity(ActivityActions.HEALTH_CHECK.action, ActivityActions.HEALTH_CHECK.category)
    trackFeatureUse('health_diagnostics')
    setIsRunning(true)
    setChecks(prev => prev.map(c => ({ ...c, status: 'running' as CheckStatus, detail: 'Verificando...' })))

    try {
      const api = window.zynvaultAPI
      if (!api) {
        setChecks(prev => prev.map(c => ({ ...c, status: 'failed' as CheckStatus, detail: 'API indisponivel' })))
        setIsRunning(false)
        return
      }

      const checkFns: Array<{ id: string; fn: () => Promise<{ success: boolean; status: string; detail: string }> }> = [
        { id: 'storage', fn: () => api.checkStorageHealth() },
        { id: 'drivers', fn: () => api.checkDriverStatus() },
        { id: 'network', fn: () => api.checkNetworkConfig() },
        { id: 'smart', fn: () => api.checkSmartStatus() },
        { id: 'system-files', fn: () => api.checkSystemFiles() },
      ]

      for (let i = 0; i < checkFns.length; i++) {
        const { id, fn } = checkFns[i]
        await new Promise(resolve => setTimeout(resolve, 300))

        try {
          const result = await fn()
          setChecks(prev => prev.map(c => {
            if (c.id !== id) return c
            return {
              ...c,
              status: result.status === 'ok' ? 'passed' : result.status === 'warning' ? 'warning' : result.status === 'critical' ? 'failed' : 'unknown',
              detail: result.detail,
            }
          }))
        } catch {
          setChecks(prev => prev.map(c => c.id === id ? { ...c, status: 'failed' as CheckStatus, detail: 'Falha ao executar verificacao' } : c))
        }
      }
    } catch {
      setChecks(prev => prev.map(c => ({ ...c, status: 'failed' as CheckStatus, detail: 'Falha ao executar diagnostico' })))
    }

    setIsRunning(false)
  }, [isRunning])

  useEffect(() => {
    const passed = checks.filter(c => c.status === 'passed').length
    const warning = checks.filter(c => c.status === 'warning').length
    const failed = checks.filter(c => c.status === 'failed').length
    setSummary({ passed, warning, failed })
  }, [checks])

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 max-w-[1000px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-semibold text-[var(--zx-text-1)]">Diagnostico do Sistema</h1>
          <p className="text-[10px] text-[var(--zx-text-3)] mt-0.5">Verificar saude e integridade do sistema</p>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="flex items-center gap-1.5 rounded-[var(--zx-radius-2)] bg-[var(--zx-brand)] px-3 py-1.5 text-[9px] font-semibold text-white hover:bg-[var(--zx-brand-hover)] transition-all duration-[var(--zx-transition-1)] disabled:opacity-50"
        >
          {isRunning ? <Loader2 size={10} className="animate-spin" /> : <Search size={10} />}
          {isRunning ? 'Executando...' : 'Executar Diagnostico'}
        </button>
      </div>

      {summary.passed + summary.warning + summary.failed > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="zx-panel-strong p-3 rounded-[var(--zx-radius-2)] border border-[var(--zx-success-border)] bg-[var(--zx-success-muted)] text-center">
            <p className="text-[18px] font-bold text-[var(--zx-success)]">{summary.passed}</p>
            <p className="text-[9px] text-[var(--zx-text-3)]">Aprovados</p>
          </div>
          <div className="zx-panel-strong p-3 rounded-[var(--zx-radius-2)] border border-[var(--zx-warning-border)] bg-[var(--zx-warning-muted)] text-center">
            <p className="text-[18px] font-bold text-[var(--zx-warning)]">{summary.warning}</p>
            <p className="text-[9px] text-[var(--zx-text-3)]">Alertas</p>
          </div>
          <div className="zx-panel-strong p-3 rounded-[var(--zx-radius-2)] border border-[var(--zx-error-border)] bg-[var(--zx-error-muted)] text-center">
            <p className="text-[18px] font-bold text-[var(--zx-error)]">{summary.failed}</p>
            <p className="text-[9px] text-[var(--zx-text-3)]">Falharam</p>
          </div>
        </div>
      )}

      <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
        <h3 className="text-[11px] font-semibold text-[var(--zx-text-1)] mb-3">Verificacoes de Diagnostico</h3>
        <div className="space-y-2">
          {checks.map(check => (
            <CheckItem key={check.id} check={check} />
          ))}
        </div>
      </div>
    </div>
  )
}
