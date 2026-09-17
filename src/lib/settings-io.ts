import { AppSettings, DEFAULT_SETTINGS } from './settings'

const STORAGE_KEY = 'zynvault-settings'

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

export function exportSettings(): string {
  const settings = loadSettings()
  return JSON.stringify(settings, null, 2)
}

export function importSettings(json: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(json)
    const validated = {
      general: { ...DEFAULT_SETTINGS.general, ...parsed.general },
      appearance: { ...DEFAULT_SETTINGS.appearance, ...parsed.appearance },
      monitoring: { ...DEFAULT_SETTINGS.monitoring, ...parsed.monitoring },
      privacy: { ...DEFAULT_SETTINGS.privacy, ...parsed.privacy },
      notifications: { ...DEFAULT_SETTINGS.notifications, ...parsed.notifications },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validated))
    return { success: true, message: 'Configuracoes importadas com sucesso!' }
  } catch {
    return { success: false, message: 'Arquivo invalido. Formato JSON esperado.' }
  }
}

export function downloadSettingsFile() {
  const data = exportSettings()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `zynvault-config-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function triggerImportSettings(file: File): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = importSettings(reader.result as string)
      resolve(result)
    }
    reader.onerror = () => resolve({ success: false, message: 'Falha ao ler arquivo' })
    reader.readAsText(file)
  })
}
