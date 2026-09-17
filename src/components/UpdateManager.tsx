import { useState, useEffect, useCallback } from 'react'
import { Download, Check, Loader2, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react'

interface UpdateInfo {
  hasUpdate: boolean
  currentVersion: string
  latestVersion: string
  releaseNotes: string
  releaseDate: string
  assets: Array<{ name: string; url: string; size: number }>
}

type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error'

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function UpdateManager({ currentVersion }: { currentVersion: string }) {
  const [status, setStatus] = useState<UpdateStatus>('idle')
  const [info, setInfo] = useState<UpdateInfo | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    const handler = (...args: unknown[]) => {
      const data = args[0] as { percent: number }
      setProgress(data.percent)
    }
    if (window.zynvaultAPI) {
      (window.zynvaultAPI as unknown as { on: (ch: string, fn: (...args: unknown[]) => void) => void }).on?.('update-download-progress', handler)
    }
    return () => {}
  }, [])

  const checkForUpdates = useCallback(async () => {
    if (!window.zynvaultAPI) return
    setStatus('checking')
    setError('')
    try {
      const result = await window.zynvaultAPI.checkForUpdates()
      if (result.success) {
        setInfo(result)
        setStatus(result.hasUpdate ? 'available' : 'idle')
        if (!result.hasUpdate) {
          setError('Voce esta na versao mais recente!')
        }
      } else {
        setStatus('error')
        setError('Nao foi possivel verificar atualizacoes')
      }
    } catch {
      setStatus('error')
      setError('Falha ao conectar com o servidor')
    }
  }, [])

  const downloadUpdate = useCallback(async () => {
    if (!window.zynvaultAPI || !info?.assets?.[0]) return
    setStatus('downloading')
    setProgress(0)
    try {
      const result = await window.zynvaultAPI.downloadUpdate(info.assets[0].url)
      if (result.success && result.filePath) {
        setStatus('downloaded')
        setProgress(100)
      } else {
        setStatus('error')
        setError(result.message || 'Falha no download')
      }
    } catch {
      setStatus('error')
      setError('Falha ao baixar atualizacao')
    }
  }, [info])

  const installUpdate = useCallback(async (filePath: string) => {
    if (!window.zynvaultAPI) return
    try {
      const result = await window.zynvaultAPI.installUpdate(filePath)
      if (result.success) {
        setError(result.message)
      } else {
        setStatus('error')
        setError(result.message)
      }
    } catch {
      setStatus('error')
      setError('Falha ao instalar')
    }
  }, [])

  const exeAsset = info?.assets.find(a => a.name.endsWith('.exe'))
  const installerAsset = exeAsset || info?.assets[0]

  return (
    <div className="rounded-[var(--zx-radius-2)] border border-[var(--zx-border-1)] bg-[var(--zx-bg-1)] p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw size={11} className="text-[var(--zx-text-3)]" />
          <span className="text-[10px] font-medium text-[var(--zx-text-1)]">Verificar Atualizacoes</span>
        </div>
        <span className="text-[9px] text-[var(--zx-text-4)]">v{currentVersion}</span>
      </div>

      {status === 'idle' && !error && (
        <button
          onClick={checkForUpdates}
          className="flex w-full items-center justify-center gap-1.5 rounded-[var(--zx-radius-2)] border border-[var(--zx-border-1)] bg-[var(--zx-bg-2)] px-3 py-2 text-[10px] font-medium text-[var(--zx-text-2)] hover:bg-[var(--zx-bg-3)] hover:text-[var(--zx-text-1)] transition-all"
        >
          <RefreshCw size={10} />
          Verificar agora
        </button>
      )}

      {status === 'checking' && (
        <div className="flex items-center justify-center gap-2 py-2">
          <Loader2 size={12} className="animate-spin text-[var(--zx-brand)]" />
          <span className="text-[10px] text-[var(--zx-text-3)]">Verificando...</span>
        </div>
      )}

      {status === 'available' && info && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-[var(--zx-radius-2)] border border-[var(--zx-success-border)] bg-[var(--zx-success-muted)] px-2.5 py-2">
            <Download size={11} className="text-[var(--zx-success)]" />
            <div className="flex-1">
              <p className="text-[10px] font-medium text-[var(--zx-success)]">Versao {info.latestVersion} disponivel</p>
              <p className="text-[8px] text-[var(--zx-text-4)] mt-0.5">Lancada em {formatDate(info.releaseDate)}</p>
            </div>
          </div>

          {info.releaseNotes && (
            <div className="rounded-[var(--zx-radius-2)] border border-[var(--zx-border-1)] bg-[var(--zx-bg-2)] p-2.5 max-h-[120px] overflow-y-auto">
              <p className="text-[9px] text-[var(--zx-text-3)] whitespace-pre-wrap">{info.releaseNotes}</p>
            </div>
          )}

          <div className="flex gap-2">
            {installerAsset && (
              <button
                onClick={downloadUpdate}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-[var(--zx-radius-2)] bg-[var(--zx-brand)] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[var(--zx-brand-hover)] transition-all"
              >
                <Download size={10} />
                Baixar ({formatSize(installerAsset.size)})
              </button>
            )}
            <button
              onClick={checkForUpdates}
              className="flex items-center justify-center gap-1 rounded-[var(--zx-radius-2)] border border-[var(--zx-border-1)] bg-[var(--zx-bg-1)] px-3 py-2 text-[10px] text-[var(--zx-text-3)] hover:bg-[var(--zx-bg-2)] transition-all"
            >
              <RefreshCw size={10} />
            </button>
          </div>
        </div>
      )}

      {status === 'downloading' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--zx-text-3)]">Baixando...</span>
            <span className="text-[10px] font-medium text-[var(--zx-brand)] tabular-nums">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--zx-bg-2)]">
            <div className="h-full rounded-full bg-[var(--zx-brand)] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {status === 'downloaded' && installerAsset && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-[var(--zx-radius-2)] border border-[var(--zx-success-border)] bg-[var(--zx-success-muted)] px-2.5 py-2">
            <Check size={11} className="text-[var(--zx-success)]" />
            <span className="text-[10px] font-medium text-[var(--zx-success)]">Download concluido</span>
          </div>
          <button
            onClick={() => installUpdate(installerAsset.url)}
            className="flex w-full items-center justify-center gap-1.5 rounded-[var(--zx-radius-2)] bg-[var(--zx-success)] px-3 py-2 text-[10px] font-semibold text-white hover:opacity-90 transition-all"
          >
            <ExternalLink size={10} />
            Instalar e reiniciar
          </button>
        </div>
      )}

      {status === 'error' && error && (
        <div className="flex items-start gap-2 rounded-[var(--zx-radius-2)] border border-[var(--zx-border-1)] bg-[var(--zx-bg-2)] px-2.5 py-2">
          {error.includes('mais recente') ? (
            <Check size={11} className="text-[var(--zx-success)] mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={11} className="text-[var(--zx-text-3)] mt-0.5 shrink-0" />
          )}
          <div className="flex-1">
            <p className="text-[10px] text-[var(--zx-text-2)]">{error}</p>
            {!error.includes('mais recente') && (
              <button onClick={checkForUpdates} className="text-[9px] text-[var(--zx-brand)] hover:underline mt-1">Tentar novamente</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
