/// <reference types="vite/client" />

interface ZynVaultAPI {
  // Window controls
  windowMinimize: () => void
  windowMaximize: () => void
  windowClose: () => void
  windowIsMaximized: () => Promise<boolean>

  // System info
  getSystemInfo: () => Promise<{
    cpu: { name: string; cores: number; usage: number; speed: number }
    gpu: { name: string; vendor: string; usage: number; vramTotal: number; vramUsed: number }
    ram: { total: number; used: number; free: number; percentage: number }
    network: { ip: string; iface: string; speed: number }
    uptime: number
    system: { hostname: string; platform: string; release: string; arch: string; windowsVersion: string }
  }>
  getDiskInfo: () => Promise<{
    total: number; free: number; used: number; percentage: number
  } | null>

  // Optimizations
  createRestorePoint: () => Promise<{ success: boolean; message: string }>
  cleanTempFiles: () => Promise<{ success: boolean; message: string }>
  optimizeMemory: () => Promise<{ success: boolean; message: string }>
  enableGameMode: () => Promise<{ success: boolean; message: string }>
  runSystemCheck: () => Promise<{ success: boolean; message: string }>
  flushDns: () => Promise<{ success: boolean; message: string }>
  cleanThumbnailCache: () => Promise<{ success: boolean; message: string }>
  optimizeNetwork: () => Promise<{ success: boolean; message: string }>
  disableTelemetry: () => Promise<{ success: boolean; message: string }>
  checkTempSize: () => Promise<{ success: boolean; bytes: number; message: string }>
  getSystemAudit: () => Promise<{ success: boolean; checks: Array<{ id: string; name: string; status: 'ok' | 'warning' | 'critical'; detail: string }> }>
  emptyRecycleBin: () => Promise<{ success: boolean; message: string }>
  checkRecycleBinSize: () => Promise<{ success: boolean; bytes: number; message: string }>
  disableVisualEffects: () => Promise<{ success: boolean; message: string }>
  enableUltimatePerformance: () => Promise<{ success: boolean; message: string }>
  disableUnnecessaryServices: () => Promise<{ success: boolean; message: string }>
  cleanWindowsUpdateCache: () => Promise<{ success: boolean; message: string }>
  revertGameMode: () => Promise<{ success: boolean; message: string }>
  revertOptimizeNetwork: () => Promise<{ success: boolean; message: string }>
  revertDisableTelemetry: () => Promise<{ success: boolean; message: string }>
  revertDisableVisualEffects: () => Promise<{ success: boolean; message: string }>
  revertEnableUltimatePerformance: () => Promise<{ success: boolean; message: string }>
  revertDisableUnnecessaryServices: () => Promise<{ success: boolean; message: string }>

  // System repair
  runDismRepair: () => Promise<{ success: boolean; message: string }>
  runChkdsk: () => Promise<{ success: boolean; message: string }>
  openWindowsTool: (tool: string) => Promise<{ success: boolean; message: string }>

  // Health checks
  checkStorageHealth: () => Promise<{ success: boolean; status: string; detail: string }>
  checkDriverStatus: () => Promise<{ success: boolean; status: string; detail: string }>
  checkNetworkConfig: () => Promise<{ success: boolean; status: string; detail: string }>
  checkSmartStatus: () => Promise<{ success: boolean; status: string; detail: string }>
  checkSystemFiles: () => Promise<{ success: boolean; status: string; detail: string }>

  // Settings
  setStartup: (enabled: boolean) => Promise<{ success: boolean; message?: string }>
  getStartup: () => Promise<{ success: boolean; enabled: boolean }>
  getAppVersion: () => Promise<string>
  getAppPath: () => Promise<string>

  // Notifications
  showNotification: (title: string, body: string) => Promise<{ success: boolean }>

  // Shell
  openExternal: (url: string) => Promise<void>

  // Network
  runPing: (target: string) => Promise<{ success: boolean; reachable: boolean; time?: string }>

  // Update system
  checkForUpdates: () => Promise<{ success: boolean; hasUpdate: boolean; currentVersion: string; latestVersion: string; releaseNotes: string; releaseDate: string; assets: Array<{ name: string; url: string; size: number }> }>
  downloadUpdate: (url: string) => Promise<{ success: boolean; filePath?: string; message?: string }>
  installUpdate: (filePath: string) => Promise<{ success: boolean; message: string }>

  // IPC events
  on: (channel: string, listener: (...args: unknown[]) => void) => void
  off: (channel: string, listener: (...args: unknown[]) => void) => void
}

interface Window {
  zynvaultAPI?: ZynVaultAPI
}
