import { useState, useCallback } from 'react'
import { Trash2, Eraser, HardDrive, ShieldCheck, Wrench, Settings, Loader2, Check, AlertTriangle, Terminal, Monitor, FileText, FolderOpen, Globe, Activity } from 'lucide-react'
import { trackActivity, trackFeatureUse, ActivityActions } from '../lib/telemetry'

interface ToolAction {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  action: () => Promise<{ success: boolean; message: string }>
  needsConfirm?: boolean
}

type ToolStatus = 'idle' | 'running' | 'done' | 'error'

function ToolButton({ tool, status, onRun }: {
  tool: ToolAction
  status: ToolStatus
  onRun: (tool: ToolAction) => void
}) {
  const Icon = tool.icon
  const isRunning = status === 'running'
  const isDone = status === 'done'
  const isError = status === 'error'

  return (
    <button
      onClick={() => onRun(tool)}
      disabled={isRunning}
      className={`flex items-center gap-3 rounded-[var(--zx-radius-2)] px-3 py-2.5 border transition-all duration-[var(--zx-transition-1)] text-left w-full ${
        isError
          ? 'border-[var(--zx-error-border)] bg-[var(--zx-error-muted)]'
          : isDone
            ? 'border-[var(--zx-success-border)] bg-[var(--zx-success-muted)]'
            : 'border-[var(--zx-border-1)] bg-[var(--zx-bg-1)] hover:bg-[var(--zx-bg-2)]'
      } disabled:opacity-60`}
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--zx-radius-2)] ${
        isError ? 'bg-[var(--zx-error-muted)]' : isDone ? 'bg-[var(--zx-success-muted)]' : 'bg-[var(--zx-bg-2)] border border-[var(--zx-border-1)]'
      }`}>
        {isRunning ? (
          <Loader2 size={13} className="animate-spin text-[var(--zx-brand)]" />
        ) : isDone ? (
          <Check size={13} className="text-[var(--zx-success)]" />
        ) : isError ? (
          <AlertTriangle size={13} className="text-[var(--zx-error)]" />
        ) : (
          <Icon size={13} className="text-[var(--zx-text-3)]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-[var(--zx-text-1)]">{tool.name}</p>
        <p className="text-[9px] text-[var(--zx-text-3)] truncate">{tool.description}</p>
      </div>
      {isDone && <span className="text-[8px] text-[var(--zx-success)] font-medium shrink-0">Pronto</span>}
      {isError && <span className="text-[8px] text-[var(--zx-error)] font-medium shrink-0">Erro</span>}
    </button>
  )
}

function ToolSection({ title, icon: Icon, tools, statuses, onRun }: {
  title: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  tools: ToolAction[]
  statuses: Record<string, ToolStatus>
  onRun: (tool: ToolAction) => void
}) {
  return (
    <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--zx-radius-2)] bg-[var(--zx-bg-1)] border border-[var(--zx-border-1)]">
          <Icon size={12} className="text-[var(--zx-text-3)]" />
        </div>
        <h3 className="text-[11px] font-semibold text-[var(--zx-text-1)]">{title}</h3>
      </div>
      <div className="space-y-2">
        {tools.map(tool => (
          <ToolButton key={tool.id} tool={tool} status={statuses[tool.id] || 'idle'} onRun={onRun} />
        ))}
      </div>
    </div>
  )
}

export default function Maintenance() {
  const [statuses, setStatuses] = useState<Record<string, ToolStatus>>({})

  const runTool = useCallback(async (tool: ToolAction) => {
    if (tool.needsConfirm && !window.confirm(`Tem certeza que deseja executar: ${tool.name}?`)) return

    const toolActivityMap: Record<string, typeof ActivityActions.CLEAN_TEMP> = {
      'clean-temp': ActivityActions.CLEAN_TEMP,
      'empty-recycle': ActivityActions.EMPTY_RECYCLE,
      'clean-thumbnails': ActivityActions.CLEAN_THUMBNAILS,
      'clean-wu-cache': ActivityActions.CLEAN_WU_CACHE,
      'sfc': ActivityActions.RUN_SFC,
      'dism': ActivityActions.RUN_DISM,
      'chkdsk': ActivityActions.RUN_CHKDSK,
    }
    const tracked = toolActivityMap[tool.id]
    if (tracked) trackActivity(tracked.action, tracked.category, tool.name)
    trackFeatureUse('maintenance_tool', tool.id)

    setStatuses(prev => ({ ...prev, [tool.id]: 'running' }))
    try {
      const result = await tool.action()
      setStatuses(prev => ({ ...prev, [tool.id]: result.success ? 'done' : 'error' }))
    } catch {
      setStatuses(prev => ({ ...prev, [tool.id]: 'error' }))
    }
  }, [])

  const openTool = useCallback(async (tool: string): Promise<{ success: boolean; message: string }> => {
    trackActivity(ActivityActions.OPEN_TOOL.action, ActivityActions.OPEN_TOOL.category, tool)
    trackFeatureUse('windows_tool', tool)
    if (window.zynvaultAPI) {
      return window.zynvaultAPI.openWindowsTool(tool)
    }
    return { success: false, message: 'API nao disponivel' }
  }, [])

  const cleanupTools: ToolAction[] = [
    { id: 'clean-temp', name: 'Arquivos Temporarios', description: 'Remover arquivos temp do sistema e usuario', icon: Trash2, action: () => window.zynvaultAPI!.cleanTempFiles() },
    { id: 'empty-recycle', name: 'Lixeira', description: 'Excluir permanentemente os arquivos da Lixeira', icon: Eraser, action: () => window.zynvaultAPI!.emptyRecycleBin(), needsConfirm: true },
    { id: 'clean-thumbnails', name: 'Cache de Miniaturas', description: 'Limpar cache de miniaturas do Explorador', icon: FolderOpen, action: () => window.zynvaultAPI!.cleanThumbnailCache() },
    { id: 'clean-wu-cache', name: 'Cache do Windows Update', description: 'Remover arquivos em cache do Windows Update', icon: HardDrive, action: () => window.zynvaultAPI!.cleanWindowsUpdateCache(), needsConfirm: true },
  ]

  const repairTools: ToolAction[] = [
    { id: 'sfc', name: 'Verificador de Arquivos (SFC)', description: 'Verificar e reparar arquivos do sistema', icon: ShieldCheck, action: () => window.zynvaultAPI!.runSystemCheck(), needsConfirm: true },
    { id: 'dism', name: 'Reparo DISM', description: 'Reparar corrupcao no armazenamento de componentes', icon: Wrench, action: () => window.zynvaultAPI!.runDismRepair(), needsConfirm: true },
    { id: 'chkdsk', name: 'CHKDSK', description: 'Verificar erros no sistema de arquivos do disco', icon: HardDrive, action: () => window.zynvaultAPI!.runChkdsk(), needsConfirm: true },
  ]

  const windowsTools: ToolAction[] = [
    { id: 'task-manager', name: 'Gerenciador de Tarefas', description: 'Processos, desempenho e startup', icon: Monitor, action: () => openTool('taskmgr') },
    { id: 'device-manager', name: 'Gerenciador de Dispositivos', description: 'Hardware e drivers', icon: Settings, action: () => openTool('devmgmt.msc') },
    { id: 'event-viewer', name: 'Visualizador de Eventos', description: 'Logs e erros do sistema', icon: FileText, action: () => openTool('eventvwr.msc') },
    { id: 'services', name: 'Servicos', description: 'Servicos do Windows', icon: Wrench, action: () => openTool('services.msc') },
    { id: 'sysinfo', name: 'Informacoes do Sistema', description: 'Especificacoes completas do PC', icon: Terminal, action: () => openTool('msinfo32') },
    { id: 'windows-update', name: 'Windows Update', description: 'Atualizacoes do Windows', icon: Globe, action: () => openTool('ms-settings:windowsupdate') },
    { id: 'control-panel', name: 'Painel de Controle', description: 'Configuracoes classicas do Windows', icon: Settings, action: () => openTool('control') },
    { id: 'programs', name: 'Programas e Recursos', description: 'Desinstalar programas', icon: FolderOpen, action: () => openTool('appwiz.cpl') },
    { id: 'power', name: 'Opcoes de Energia', description: 'Planos de energia e desempenho', icon: Monitor, action: () => openTool('powercfg.cpl') },
    { id: 'network', name: 'Central de Rede', description: 'Adaptadores e configuracao de rede', icon: Globe, action: () => openTool('ncpa.cpl') },
    { id: 'sound', name: 'Som', description: 'Dispositivos de audio', icon: Terminal, action: () => openTool('mmsys.cpl') },
    { id: 'firewall', name: 'Firewall do Windows', description: 'Regras e protecao de rede', icon: ShieldCheck, action: () => openTool('firewall.cpl') },
    { id: 'dxdiag', name: 'Diagnostico DirectX', description: 'Informacoes de图形 e som', icon: Monitor, action: () => openTool('dxdiag') },
    { id: 'resmon', name: 'Monitor de Recursos', description: 'Uso de CPU, RAM e disco em tempo real', icon: Activity, action: () => openTool('resmon.exe') },
    { id: 'perfmon', name: 'Monitor de Desempenho', description: 'Relatorios e contadores de desempenho', icon: Activity, action: () => openTool('perfmon.msc') },
  ]

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 max-w-[1000px] mx-auto">
      <div>
        <h1 className="text-[16px] font-semibold text-[var(--zx-text-1)]">Ferramentas de Manutencao</h1>
        <p className="text-[10px] text-[var(--zx-text-3)] mt-0.5">Limpeza, reparo e utilitarios do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ToolSection title="Limpeza" icon={Trash2} tools={cleanupTools} statuses={statuses} onRun={runTool} />
        <ToolSection title="Reparo do Sistema" icon={ShieldCheck} tools={repairTools} statuses={statuses} onRun={runTool} />
      </div>

      <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--zx-radius-2)] bg-[var(--zx-bg-1)] border border-[var(--zx-border-1)]">
            <Settings size={12} className="text-[var(--zx-text-3)]" />
          </div>
          <h3 className="text-[11px] font-semibold text-[var(--zx-text-1)]">Ferramentas do Windows</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {windowsTools.map(tool => (
            <ToolButton key={tool.id} tool={tool} status={statuses[tool.id] || 'idle'} onRun={runTool} />
          ))}
        </div>
      </div>
    </div>
  )
}
