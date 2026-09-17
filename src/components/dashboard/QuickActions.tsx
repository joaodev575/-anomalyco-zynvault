import { useState, useCallback, memo } from 'react'
import {
  Trash2,
  Gauge,
  Wifi,
  HardDrive,
  Eraser,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { trackActivity, ActivityActions } from '../../lib/telemetry'

type ActionStatus = 'pending' | 'running' | 'completed' | 'error'

interface SystemAction {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  action: () => Promise<{ success: boolean; message: string }>
}

const ACTIONS: SystemAction[] = [
  {
    id: 'clean-temp',
    title: 'Limpar Temporarios',
    description: 'Remover arquivos temp do sistema',
    icon: Trash2,
    action: () => window.zynvaultAPI!.cleanTempFiles(),
  },
  {
    id: 'empty-recycle',
    title: 'Esvaziar Lixeira',
    description: 'Excluir permanentemente da lixeira',
    icon: Eraser,
    action: () => window.zynvaultAPI!.emptyRecycleBin(),
  },
  {
    id: 'flush-dns',
    title: 'Limpar DNS',
    description: 'Flush do cache DNS do sistema',
    icon: Wifi,
    action: () => window.zynvaultAPI!.flushDns(),
  },
  {
    id: 'optimize-memory',
    title: 'Otimizar Memoria',
    description: 'Liberar memoria RAM em uso',
    icon: Gauge,
    action: () => window.zynvaultAPI!.optimizeMemory(),
  },
  {
    id: 'clean-thumbnails',
    title: 'Cache de Miniaturas',
    description: 'Limpar cache de thumbnails',
    icon: HardDrive,
    action: () => window.zynvaultAPI!.cleanThumbnailCache(),
  },
]

const STATUS_LABELS: Record<ActionStatus, string> = {
  pending: 'Executar',
  running: 'Executando...',
  completed: 'Pronto',
  error: 'Erro',
}

const STATUS_CLASSES: Record<ActionStatus, string> = {
  pending: 'border-[var(--zx-brand-border)] bg-[var(--zx-brand-muted)] text-[var(--zx-brand)] hover:bg-[var(--zx-brand)]/15',
  running: 'border-[var(--zx-warning-border)] bg-[var(--zx-warning-muted)] text-[var(--zx-warning)] cursor-wait',
  completed: 'border-[var(--zx-success-border)] bg-[var(--zx-success-muted)] text-[var(--zx-success)] cursor-default',
  error: 'border-[var(--zx-error-border)] bg-[var(--zx-error-muted)] text-[var(--zx-error)] hover:bg-[var(--zx-error-muted)]',
}

export const QuickActions = memo(function QuickActions() {
  const [statuses, setStatuses] = useState<Record<string, ActionStatus>>({})

  const completedCount = Object.values(statuses).filter((s) => s === 'completed').length
  const progress = (completedCount / ACTIONS.length) * 100

  const executeAction = useCallback(async (action: SystemAction) => {
    if (!window.zynvaultAPI) return

    setStatuses((prev) => ({ ...prev, [action.id]: 'running' }))

    const actionMap: Record<string, typeof ActivityActions.CLEAN_TEMP> = {
      'clean-temp': ActivityActions.CLEAN_TEMP,
      'empty-recycle': ActivityActions.EMPTY_RECYCLE,
      'flush-dns': ActivityActions.FLUSH_DNS,
      'optimize-memory': ActivityActions.OPTIMIZE_MEMORY,
      'clean-thumbnails': ActivityActions.CLEAN_THUMBNAILS,
    }
    const tracked = actionMap[action.id]
    if (tracked) trackActivity(tracked.action, tracked.category)

    try {
      const result = await action.action()
      setStatuses((prev) => ({ ...prev, [action.id]: result.success ? 'completed' : 'error' }))

      if (result.success) {
        await window.zynvaultAPI.showNotification('ZynVault', `${action.title} concluido!`)
      }
    } catch {
      setStatuses((prev) => ({ ...prev, [action.id]: 'error' }))
    }
  }, [])

  return (
    <div className="zx-panel p-4">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-semibold text-[var(--zx-text-1)]">Acoes Rapidas</h3>
          <span className="text-[9px] text-[var(--zx-text-3)]">
            {completedCount} de {ACTIONS.length} concluidos
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--zx-bg-1)]">
          <div
            className="h-full rounded-full bg-[var(--zx-brand)] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        {ACTIONS.map((action, index) => {
          const status = statuses[action.id] || 'pending'
          const Icon = action.icon
          const isActive = status === 'completed'

          return (
            <div
              key={action.id}
              className={cn(
                'flex items-center gap-2.5 rounded-[var(--zx-radius-2)] border bg-[var(--zx-bg-1)] p-2.5 transition-all duration-[var(--zx-transition-1)]',
                isActive
                  ? 'border-[var(--zx-success-border)]'
                  : 'border-[var(--zx-border-1)] hover:border-[var(--zx-border-2)] hover:bg-[var(--zx-bg-2)]'
              )}
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--zx-radius-1)] bg-[var(--zx-bg-2)] text-[9px] font-medium text-[var(--zx-text-4)]">
                {index + 1}
              </div>

              <div className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--zx-radius-1)] border border-[var(--zx-border-1)] bg-[var(--zx-bg-2)]',
                isActive && 'text-[var(--zx-success)]',
                status === 'running' && 'text-[var(--zx-warning)]',
                status === 'error' && 'text-[var(--zx-error)]'
              )}>
                {status === 'running' ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : status === 'completed' ? (
                  <Check size={11} />
                ) : status === 'error' ? (
                  <AlertCircle size={11} />
                ) : (
                  <Icon size={11} className="text-[var(--zx-text-3)]" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className={cn(
                  'truncate text-[10px] font-medium',
                  isActive ? 'text-[var(--zx-text-3)] line-through' : 'text-[var(--zx-text-2)]'
                )}>
                  {action.title}
                </p>
                <p className="truncate text-[9px] text-[var(--zx-text-4)]">
                  {action.description}
                </p>
              </div>

              <button
                onClick={() => status === 'pending' && executeAction(action)}
                disabled={status !== 'pending'}
                className={cn(
                  'shrink-0 rounded-[var(--zx-radius-1)] border px-2 py-1 text-[9px] font-medium transition-all duration-[var(--zx-transition-1)]',
                  STATUS_CLASSES[status]
                )}
              >
                {STATUS_LABELS[status]}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
})
