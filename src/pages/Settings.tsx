import { useState, useEffect, useCallback } from 'react'
import { Settings as SettingsIcon, Palette, Activity, Shield, Bell, Info, Monitor, Save, Check, RotateCcw, AlertTriangle, ExternalLink, GitBranch, Heart, Download, Upload } from 'lucide-react'
import { User } from '../lib/api'
import { AppSettings } from '../lib/settings'
import { UpdateManager } from '../components/UpdateManager'
import { downloadSettingsFile, triggerImportSettings } from '../lib/settings-io'
import { trackActivity, trackSettingChange, ActivityActions } from '../lib/telemetry'

interface SettingsProps {
  user: User
}

type SettingsTab = 'general' | 'appearance' | 'monitoring' | 'privacy' | 'notifications' | 'about'

const TAB_LIST: { id: SettingsTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'general', label: 'Geral', icon: SettingsIcon },
  { id: 'appearance', label: 'Aparencia', icon: Palette },
  { id: 'monitoring', label: 'Monitoramento', icon: Activity },
  { id: 'privacy', label: 'Privacidade', icon: Shield },
  { id: 'notifications', label: 'Notificacoes', icon: Bell },
  { id: 'about', label: 'Sobre', icon: Info },
]

const STORAGE_KEY = 'zynvault-settings'

const DEFAULT_SETTINGS: AppSettings = {
  general: { startMinimized: false, launchOnStartup: false, checkUpdates: true, language: 'pt-BR' },
  appearance: { compactMode: false, animationsEnabled: true, showSystemTray: true },
  monitoring: { enableLiveMetrics: true, refreshInterval: '5', showCpuChart: true, showGpuChart: true },
  privacy: { telemetryEnabled: false, crashReporting: false, analyticsEnabled: false },
  notifications: { systemAlerts: true, optimizationComplete: true, healthCheckResults: true, maintenanceReminders: false },
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(DEFAULT_SETTINGS)
    const parsed = JSON.parse(raw)
    return {
      general: { ...DEFAULT_SETTINGS.general, ...parsed.general },
      appearance: { ...DEFAULT_SETTINGS.appearance, ...parsed.appearance },
      monitoring: { ...DEFAULT_SETTINGS.monitoring, ...parsed.monitoring },
      privacy: { ...DEFAULT_SETTINGS.privacy, ...parsed.privacy },
      notifications: { ...DEFAULT_SETTINGS.notifications, ...parsed.notifications },
    }
  } catch {
    return structuredClone(DEFAULT_SETTINGS)
  }
}

function saveToDisk(settings: AppSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

function applyAppearance(settings: AppSettings) {
  const root = document.documentElement
  if (settings.appearance.compactMode) {
    root.classList.add('zx-compact')
  } else {
    root.classList.remove('zx-compact')
  }
  if (!settings.appearance.animationsEnabled) {
    root.classList.add('zx-no-animations')
  } else {
    root.classList.remove('zx-no-animations')
  }
}

function ToggleSwitch({ enabled, onChange, disabled }: { enabled: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative h-5 w-9 rounded-full transition-all duration-[var(--zx-transition-1)] disabled:opacity-40 disabled:cursor-not-allowed ${
        enabled ? 'bg-[var(--zx-brand)]' : 'bg-[var(--zx-bg-1)] border border-[var(--zx-border-1)]'
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all duration-[var(--zx-transition-1)] ${
          enabled ? 'left-[18px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

function SettingRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--zx-border-1)] last:border-0">
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-[11px] font-medium text-[var(--zx-text-1)]">{label}</p>
        <p className="text-[9px] text-[var(--zx-text-3)] mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  )
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="rounded-[var(--zx-radius-2)] border border-[var(--zx-border-1)] bg-[var(--zx-bg-1)] px-2.5 py-1.5 text-[10px] text-[var(--zx-text-2)] focus:outline-none focus:border-[var(--zx-brand-border)]"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

function StatusMessage({ type, text }: { type: 'success' | 'error' | 'loading'; text: string }) {
  const config = {
    success: { bg: 'bg-[var(--zx-success-muted)]', border: 'border-[var(--zx-success-border)]', text: 'text-[var(--zx-success)]', icon: Check },
    error: { bg: 'bg-[var(--zx-error-muted)]', border: 'border-[var(--zx-error-border)]', text: 'text-[var(--zx-error)]', icon: AlertTriangle },
    loading: { bg: 'bg-[var(--zx-brand-muted)]', border: 'border-[var(--zx-brand-border)]', text: 'text-[var(--zx-brand)]', icon: RotateCcw },
  }
  const c = config[type]
  const Icon = c.icon

  return (
    <div className={`flex items-center gap-2 rounded-[var(--zx-radius-2)] border ${c.border} ${c.bg} px-3 py-2 mt-2`}>
      <Icon size={11} className={`${c.text} ${type === 'loading' ? 'animate-spin' : ''}`} />
      <span className={`text-[9px] font-medium ${c.text}`}>{text}</span>
    </div>
  )
}

export default function Settings({ user }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [settings, setSettings] = useState<AppSettings>(loadSettings)
  const [savedSettings, setSavedSettings] = useState<AppSettings>(loadSettings)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'loading'; text: string } | null>(null)
  const [appVersion, setAppVersion] = useState('1.0.0')
  const [startupEnabled, setStartupEnabled] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    applyAppearance(settings)
  }, [])

  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(savedSettings)
    setHasChanges(changed)
  }, [settings, savedSettings])

  useEffect(() => {
    if (window.zynvaultAPI) {
      window.zynvaultAPI.getStartup().then(r => {
        if (r.success) setStartupEnabled(r.enabled)
      }).catch(() => {})
      window.zynvaultAPI.getAppVersion().then(v => {
        setAppVersion(v)
      }).catch(() => {})
    }
  }, [])

  const update = useCallback(<K extends keyof AppSettings>(section: K, patch: Partial<AppSettings[K]>) => {
    setSettings(prev => ({ ...prev, [section]: { ...prev[section], ...patch } }))
  }, [])

  const handleSave = useCallback(async () => {
    setSaveStatus('saving')
    setStatusMessage({ type: 'loading', text: 'Salvando configuracoes...' })

    try {
      trackActivity(ActivityActions.SAVE_SETTINGS.action, ActivityActions.SAVE_SETTINGS.category)
      trackSettingChange('settings', savedSettings, settings)

      saveToDisk(settings)
      applyAppearance(settings)

      if (window.zynvaultAPI) {
        if (settings.general.launchOnStartup !== savedSettings.general.launchOnStartup) {
          const result = await window.zynvaultAPI.setStartup(settings.general.launchOnStartup)
          if (!result.success) {
            setStatusMessage({ type: 'error', text: result.message || 'Falha ao configurar inicio automatico' })
            setSaveStatus('error')
            return
          }
          setStartupEnabled(settings.general.launchOnStartup)
        }

        if (settings.privacy.telemetryEnabled !== savedSettings.privacy.telemetryEnabled) {
          if (settings.privacy.telemetryEnabled) {
            await window.zynvaultAPI.disableTelemetry()
          } else {
            await window.zynvaultAPI.revertDisableTelemetry()
          }
        }
      }

      setSavedSettings(structuredClone(settings))
      setSaveStatus('saved')
      setStatusMessage({ type: 'success', text: 'Configuracoes salvas com sucesso' })
      setTimeout(() => { setSaveStatus('idle'); setStatusMessage(null) }, 2000)
    } catch {
      setSaveStatus('error')
      setStatusMessage({ type: 'error', text: 'Erro ao salvar configuracoes' })
      setTimeout(() => { setSaveStatus('idle'); setStatusMessage(null) }, 3000)
    }
  }, [settings, savedSettings])

  const handleCancel = useCallback(() => {
    setSettings(structuredClone(savedSettings))
    applyAppearance(savedSettings)
    setSaveStatus('idle')
    setStatusMessage(null)
  }, [savedSettings])

  const handleReset = useCallback(async () => {
    if (!window.confirm('Tem certeza que deseja restaurar todas as configuracoes padrao?')) return

    try {
      trackActivity(ActivityActions.RESET_SETTINGS.action, ActivityActions.RESET_SETTINGS.category)

      saveToDisk(DEFAULT_SETTINGS)
      applyAppearance(DEFAULT_SETTINGS)
      setSettings(structuredClone(DEFAULT_SETTINGS))
      setSavedSettings(structuredClone(DEFAULT_SETTINGS))

      if (window.zynvaultAPI && startupEnabled) {
        await window.zynvaultAPI.setStartup(false)
        setStartupEnabled(false)
      }

      setStatusMessage({ type: 'success', text: 'Configuracoes restauradas' })
      setTimeout(() => setStatusMessage(null), 2000)
    } catch {
      setStatusMessage({ type: 'error', text: 'Erro ao restaurar configuracoes' })
      setTimeout(() => setStatusMessage(null), 3000)
    }
  }, [startupEnabled])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-0">
            <SettingRow label="Iniciar Minimizado" description="Lancar a aplicacao minimizada na bandeja do sistema">
              <ToggleSwitch enabled={settings.general.startMinimized} onChange={v => update('general', { startMinimized: v })} />
            </SettingRow>
            <SettingRow label="Iniciar com o Windows" description="Iniciar automaticamente quando o Windows inicializar">
              <ToggleSwitch enabled={settings.general.launchOnStartup} onChange={v => update('general', { launchOnStartup: v })} />
            </SettingRow>
            <SettingRow label="Verificar Atualizacoes" description="Verificar automaticamente novas versoes">
              <ToggleSwitch enabled={settings.general.checkUpdates} onChange={v => update('general', { checkUpdates: v })} />
            </SettingRow>
            <SettingRow label="Idioma" description="Selecionar idioma da aplicacao">
              <SelectInput
                value={settings.general.language}
                onChange={v => update('general', { language: v })}
                options={[{ value: 'pt-BR', label: 'Portugues (BR)' }, { value: 'en', label: 'Ingles' }, { value: 'es', label: 'Espanhol' }]}
              />
            </SettingRow>
            <div className="border-t border-[var(--zx-border-1)] pt-3 mt-3 space-y-2">
              <p className="text-[9px] font-medium text-[var(--zx-text-3)] uppercase tracking-wide">Backup</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { trackActivity(ActivityActions.EXPORT_SETTINGS.action, ActivityActions.EXPORT_SETTINGS.category); downloadSettingsFile() }}
                  className="flex items-center gap-1.5 rounded-[var(--zx-radius-2)] border border-[var(--zx-border-1)] bg-[var(--zx-bg-1)] px-3 py-2 text-[9px] font-medium text-[var(--zx-text-2)] hover:bg-[var(--zx-bg-2)] transition-all"
                >
                  <Download size={10} />
                  Exportar
                </button>
                <label className="flex items-center gap-1.5 rounded-[var(--zx-radius-2)] border border-[var(--zx-border-1)] bg-[var(--zx-bg-1)] px-3 py-2 text-[9px] font-medium text-[var(--zx-text-2)] hover:bg-[var(--zx-bg-2)] transition-all cursor-pointer">
                  <Upload size={10} />
                  Importar
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        trackActivity(ActivityActions.IMPORT_SETTINGS.action, ActivityActions.IMPORT_SETTINGS.category, file.name)
                        const result = await triggerImportSettings(file)
                        setStatusMessage({ type: result.success ? 'success' : 'error', text: result.message })
                        if (result.success) {
                          setSettings(loadSettings())
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        )
      case 'appearance':
        return (
          <div className="space-y-0">
            <SettingRow label="Modo Compacto" description="Reduzir espacamento e preenchimento em toda a interface">
              <ToggleSwitch enabled={settings.appearance.compactMode} onChange={v => {
                update('appearance', { compactMode: v })
                const root = document.documentElement
                v ? root.classList.add('zx-compact') : root.classList.remove('zx-compact')
              }} />
            </SettingRow>
            <SettingRow label="Animacoes" description="Ativar transicoes e animacoes da interface">
              <ToggleSwitch enabled={settings.appearance.animationsEnabled} onChange={v => {
                update('appearance', { animationsEnabled: v })
                const root = document.documentElement
                v ? root.classList.remove('zx-no-animations') : root.classList.add('zx-no-animations')
              }} />
            </SettingRow>
            <SettingRow label="Icone na Bandeja" description="Exibir icone da aplicacao na bandeja do sistema">
              <ToggleSwitch enabled={settings.appearance.showSystemTray} onChange={v => update('appearance', { showSystemTray: v })} />
            </SettingRow>
          </div>
        )
      case 'monitoring':
        return (
          <div className="space-y-0">
            <SettingRow label="Metricas em Tempo Real" description="Ativar coleta de metricas do sistema em tempo real">
              <ToggleSwitch enabled={settings.monitoring.enableLiveMetrics} onChange={v => update('monitoring', { enableLiveMetrics: v })} />
            </SettingRow>
            <SettingRow label="Intervalo de Atualizacao" description="Frequencia de atualizacao das metricas do sistema">
              <SelectInput
                value={settings.monitoring.refreshInterval}
                onChange={v => update('monitoring', { refreshInterval: v })}
                options={[{ value: '3', label: '3 segundos' }, { value: '5', label: '5 segundos' }, { value: '10', label: '10 segundos' }, { value: '30', label: '30 segundos' }]}
              />
            </SettingRow>
            <SettingRow label="Grafico de CPU" description="Exibir grafico de historico de uso da CPU no painel">
              <ToggleSwitch enabled={settings.monitoring.showCpuChart} onChange={v => update('monitoring', { showCpuChart: v })} />
            </SettingRow>
            <SettingRow label="Grafico de GPU" description="Exibir grafico de historico de uso da GPU no painel">
              <ToggleSwitch enabled={settings.monitoring.showGpuChart} onChange={v => update('monitoring', { showGpuChart: v })} />
            </SettingRow>
          </div>
        )
      case 'privacy':
        return (
          <div className="space-y-0">
            <SettingRow label="Telemetria" description="Enviar dados de uso anonimos para a Microsoft">
              <ToggleSwitch enabled={settings.privacy.telemetryEnabled} onChange={v => update('privacy', { telemetryEnabled: v })} />
            </SettingRow>
            <SettingRow label="Relatorios de Erro" description="Enviar relatorios de erro para depuracao">
              <ToggleSwitch enabled={settings.privacy.crashReporting} onChange={v => update('privacy', { crashReporting: v })} />
            </SettingRow>
            <SettingRow label="Analiticos" description="Ajudar a melhorar o ZynVault com analises anonimas">
              <ToggleSwitch enabled={settings.privacy.analyticsEnabled} onChange={v => update('privacy', { analyticsEnabled: v })} />
            </SettingRow>
          </div>
        )
      case 'notifications':
        return (
          <div className="space-y-0">
            <SettingRow label="Alertas do Sistema" description="Mostrar notificacoes sobre problemas de saude do sistema">
              <ToggleSwitch enabled={settings.notifications.systemAlerts} onChange={v => update('notifications', { systemAlerts: v })} />
            </SettingRow>
            <SettingRow label="Otimizacao Concluida" description="Notificar quando otimizacoes finalizarem">
              <ToggleSwitch enabled={settings.notifications.optimizationComplete} onChange={v => update('notifications', { optimizationComplete: v })} />
            </SettingRow>
            <SettingRow label="Resultados de Diagnostico" description="Mostrar resultados apos verificacoes de diagnostico">
              <ToggleSwitch enabled={settings.notifications.healthCheckResults} onChange={v => update('notifications', { healthCheckResults: v })} />
            </SettingRow>
            <SettingRow label="Lembretes de Manutencao" description="Lembretes periodicos de manutencao do sistema">
              <ToggleSwitch enabled={settings.notifications.maintenanceReminders} onChange={v => update('notifications', { maintenanceReminders: v })} />
            </SettingRow>
          </div>
        )
      case 'about':
        return (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-[var(--zx-radius-3)] bg-[var(--zx-brand-muted)] border border-[var(--zx-brand-border)] mb-3">
                <Monitor size={28} className="text-[var(--zx-brand)]" />
              </div>
              <h3 className="text-[15px] font-bold text-[var(--zx-text-1)]">ZynVault</h3>
              <p className="text-[10px] text-[var(--zx-text-3)] mt-0.5">Suite de Otimizacao do Sistema</p>
              <p className="text-[9px] text-[var(--zx-text-4)] mt-1">Versao {appVersion}</p>
            </div>

            <UpdateManager currentVersion={appVersion} />

            <div className="rounded-[var(--zx-radius-2)] bg-[var(--zx-bg-1)] border border-[var(--zx-border-1)] p-3 space-y-1">
              <div className="flex justify-between py-0.5">
                <span className="text-[9px] text-[var(--zx-text-3)]">Usuario</span>
                <span className="text-[9px] font-medium text-[var(--zx-text-2)]">{user.name}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-[9px] text-[var(--zx-text-3)]">Email</span>
                <span className="text-[9px] font-medium text-[var(--zx-text-2)]">{user.email}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-[9px] text-[var(--zx-text-3)]">Funcao</span>
                <span className="text-[9px] font-medium text-[var(--zx-text-2)]">{user.role}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-[9px] text-[var(--zx-text-3)]">Inicio com Windows</span>
                <span className="text-[9px] font-medium text-[var(--zx-text-2)]">{startupEnabled ? 'Ativado' : 'Desativado'}</span>
              </div>
            </div>

            <div className="rounded-[var(--zx-radius-2)] bg-[var(--zx-bg-1)] border border-[var(--zx-border-1)] p-3">
              <div className="flex items-center gap-2 mb-2">
                <Heart size={11} className="text-[var(--zx-brand)]" />
                <span className="text-[10px] font-semibold text-[var(--zx-text-1)]">Criador</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between py-0.5">
                  <span className="text-[9px] text-[var(--zx-text-3)]">Desenvolvedor</span>
                  <span className="text-[9px] font-medium text-[var(--zx-text-2)]">Zyntrix Team</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-[9px] text-[var(--zx-text-3)]">Contato</span>
                  <button onClick={() => window.zynvaultAPI?.openExternal?.('mailto:contato@zyntrix.com')} className="text-[9px] font-medium text-[var(--zx-brand)] hover:underline">contato@zyntrix.com</button>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-[9px] text-[var(--zx-text-3)]">GitHub</span>
                  <button onClick={() => window.zynvaultAPI?.openExternal?.('https://github.com/anomalyco/zynvault')} className="flex items-center gap-1 text-[9px] font-medium text-[var(--zx-brand)] hover:underline">
                    <GitBranch size={9} />
                    anomalyco/zynvault
                    <ExternalLink size={8} />
                  </button>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-[9px] text-[var(--zx-text-3)]">Licenca</span>
                  <span className="text-[9px] font-medium text-[var(--zx-text-2)]">MIT License</span>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--zx-radius-2)] bg-[var(--zx-bg-1)] border border-[var(--zx-border-1)] p-3">
              <div className="flex items-center gap-2 mb-2">
                <Info size={11} className="text-[var(--zx-text-3)]" />
                <span className="text-[10px] font-semibold text-[var(--zx-text-1)]">Tecnologias</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {['Electron', 'React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Prisma', 'PostgreSQL', 'Express'].map(tech => (
                  <span key={tech} className="inline-flex items-center rounded-full bg-[var(--zx-bg-2)] border border-[var(--zx-border-1)] px-2 py-0.5 text-[8px] font-medium text-[var(--zx-text-3)]">{tech}</span>
                ))}
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 max-w-[1000px] mx-auto">
      <div>
        <h1 className="text-[16px] font-semibold text-[var(--zx-text-1)]">Configuracoes</h1>
        <p className="text-[10px] text-[var(--zx-text-3)] mt-0.5">Configurar preferencias da aplicacao</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-48 shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
            {TAB_LIST.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-[var(--zx-radius-2)] px-3 py-2 text-[10px] font-medium whitespace-nowrap transition-all duration-[var(--zx-transition-1)] ${
                    activeTab === tab.id
                      ? 'bg-[var(--zx-brand-muted)] text-[var(--zx-brand)] border border-[var(--zx-brand-border)]'
                      : 'text-[var(--zx-text-3)] border border-transparent hover:text-[var(--zx-text-1)] hover:bg-[var(--zx-bg-1)]'
                  }`}
                >
                  <Icon size={12} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-semibold text-[var(--zx-text-1)]">
                {TAB_LIST.find(t => t.id === activeTab)?.label}
              </h3>
              <div className="flex items-center gap-1.5">
                {activeTab !== 'about' && (
                  <>
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1 rounded-[var(--zx-radius-2)] border border-[var(--zx-border-1)] bg-[var(--zx-bg-1)] px-2.5 py-1.5 text-[9px] font-medium text-[var(--zx-text-3)] hover:text-[var(--zx-text-1)] hover:bg-[var(--zx-bg-2)] transition-all duration-[var(--zx-transition-1)]"
                    >
                      <RotateCcw size={9} />
                      Padrao
                    </button>
                    {hasChanges && (
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-1 rounded-[var(--zx-radius-2)] border border-[var(--zx-border-1)] bg-[var(--zx-bg-1)] px-2.5 py-1.5 text-[9px] font-medium text-[var(--zx-text-3)] hover:text-[var(--zx-text-1)] hover:bg-[var(--zx-bg-2)] transition-all duration-[var(--zx-transition-1)]"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges || saveStatus === 'saving'}
                      className="flex items-center gap-1.5 rounded-[var(--zx-radius-2)] bg-[var(--zx-brand)] px-3 py-1.5 text-[9px] font-semibold text-white hover:bg-[var(--zx-brand-hover)] transition-all duration-[var(--zx-transition-1)] disabled:opacity-50"
                    >
                      {saveStatus === 'saved' ? <Check size={10} /> : <Save size={10} />}
                      {saveStatus === 'saved' ? 'Salvo' : saveStatus === 'saving' ? 'Salvando...' : 'Salvar'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {statusMessage && <StatusMessage type={statusMessage.type} text={statusMessage.text} />}

            <div className="mt-3">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
