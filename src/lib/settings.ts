const STORAGE_KEY = 'zynvault-settings'

let _cachedSettings: AppSettings | null = null
let _cacheTime = 0
const CACHE_TTL = 2000

export interface AppSettings {
  general: {
    startMinimized: boolean
    launchOnStartup: boolean
    checkUpdates: boolean
    language: string
  }
  appearance: {
    compactMode: boolean
    animationsEnabled: boolean
    showSystemTray: boolean
  }
  monitoring: {
    enableLiveMetrics: boolean
    refreshInterval: string
    showCpuChart: boolean
    showGpuChart: boolean
  }
  privacy: {
    telemetryEnabled: boolean
    crashReporting: boolean
    analyticsEnabled: boolean
  }
  notifications: {
    systemAlerts: boolean
    optimizationComplete: boolean
    healthCheckResults: boolean
    maintenanceReminders: boolean
  }
}

export const DEFAULT_SETTINGS: AppSettings = {
  general: { startMinimized: false, launchOnStartup: false, checkUpdates: true, language: 'pt-BR' },
  appearance: { compactMode: false, animationsEnabled: true, showSystemTray: true },
  monitoring: { enableLiveMetrics: true, refreshInterval: '5', showCpuChart: true, showGpuChart: true },
  privacy: { telemetryEnabled: false, crashReporting: false, analyticsEnabled: false },
  notifications: { systemAlerts: true, optimizationComplete: true, healthCheckResults: true, maintenanceReminders: false },
}

export function getSettings(): AppSettings {
  try {
    const now = Date.now()
    if (_cachedSettings && (now - _cacheTime) < CACHE_TTL) return _cachedSettings

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) { _cachedSettings = DEFAULT_SETTINGS; _cacheTime = now; return _cachedSettings }
    const parsed = JSON.parse(raw)
    _cachedSettings = {
      general: { ...DEFAULT_SETTINGS.general, ...parsed.general },
      appearance: { ...DEFAULT_SETTINGS.appearance, ...parsed.appearance },
      monitoring: { ...DEFAULT_SETTINGS.monitoring, ...parsed.monitoring },
      privacy: { ...DEFAULT_SETTINGS.privacy, ...parsed.privacy },
      notifications: { ...DEFAULT_SETTINGS.notifications, ...parsed.notifications },
    }
    _cacheTime = now
    return _cachedSettings
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function invalidateSettingsCache() {
  _cachedSettings = null
}

export function getRefreshInterval(): number {
  const s = getSettings()
  return parseInt(s.monitoring.refreshInterval, 10) * 1000
}

export function isLiveMetricsEnabled(): boolean {
  return getSettings().monitoring.enableLiveMetrics
}
