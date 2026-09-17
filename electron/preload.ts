import { ipcRenderer, contextBridge } from 'electron'

export interface ZynVaultAPI {
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

  // Notifications
  showNotification: (title: string, body: string) => Promise<{ success: boolean }>

  // Shell
  openExternal: (url: string) => Promise<void>

  // Network
  runPing: (target: string) => Promise<{ success: boolean; reachable: boolean; time?: string }>

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

  // Update system
  checkForUpdates: () => Promise<{ success: boolean; hasUpdate: boolean; currentVersion: string; latestVersion: string; releaseNotes: string; releaseDate: string; assets: Array<{ name: string; url: string; size: number }> }>
  downloadUpdate: (url: string) => Promise<{ success: boolean; filePath?: string; message?: string }>
  installUpdate: (filePath: string) => Promise<{ success: boolean; message: string }>

  // IPC events
  on: (channel: string, listener: (...args: unknown[]) => void) => void
  off: (channel: string, listener: (...args: unknown[]) => void) => void
}

const api: ZynVaultAPI = {
  // Window controls
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized'),

  // System info
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getDiskInfo: () => ipcRenderer.invoke('get-disk-info'),

  // Optimizations
  createRestorePoint: () => ipcRenderer.invoke('create-restore-point'),
  cleanTempFiles: () => ipcRenderer.invoke('clean-temp-files'),
  optimizeMemory: () => ipcRenderer.invoke('optimize-memory'),
  enableGameMode: () => ipcRenderer.invoke('enable-game-mode'),
  runSystemCheck: () => ipcRenderer.invoke('run-system-check'),
  flushDns: () => ipcRenderer.invoke('flush-dns'),
  cleanThumbnailCache: () => ipcRenderer.invoke('clean-thumbnail-cache'),
  optimizeNetwork: () => ipcRenderer.invoke('optimize-network'),
  disableTelemetry: () => ipcRenderer.invoke('disable-telemetry'),
  checkTempSize: () => ipcRenderer.invoke('check-temp-size'),
  getSystemAudit: () => ipcRenderer.invoke('get-system-audit'),
  emptyRecycleBin: () => ipcRenderer.invoke('empty-recycle-bin'),
  checkRecycleBinSize: () => ipcRenderer.invoke('check-recycle-bin-size'),
  disableVisualEffects: () => ipcRenderer.invoke('disable-visual-effects'),
  enableUltimatePerformance: () => ipcRenderer.invoke('enable-ultimate-performance'),
  disableUnnecessaryServices: () => ipcRenderer.invoke('disable-unnecessary-services'),
  cleanWindowsUpdateCache: () => ipcRenderer.invoke('clean-windows-update-cache'),
  revertGameMode: () => ipcRenderer.invoke('revert-game-mode'),
  revertOptimizeNetwork: () => ipcRenderer.invoke('revert-optimize-network'),
  revertDisableTelemetry: () => ipcRenderer.invoke('revert-disable-telemetry'),
  revertDisableVisualEffects: () => ipcRenderer.invoke('revert-disable-visual-effects'),
  revertEnableUltimatePerformance: () => ipcRenderer.invoke('revert-enable-ultimate-performance'),
  revertDisableUnnecessaryServices: () => ipcRenderer.invoke('revert-disable-unnecessary-services'),

  // System repair
  runDismRepair: () => ipcRenderer.invoke('run-dism-repair'),
  runChkdsk: () => ipcRenderer.invoke('run-chkdsk'),
  openWindowsTool: (tool: string) => ipcRenderer.invoke('open-windows-tool', tool),

  // Notifications
  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke('show-notification', title, body),

  // Shell
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),

  // Network
  runPing: (target: string) => ipcRenderer.invoke('run-ping', target),

  // Health checks
  checkStorageHealth: () => ipcRenderer.invoke('check-storage-health'),
  checkDriverStatus: () => ipcRenderer.invoke('check-driver-status'),
  checkNetworkConfig: () => ipcRenderer.invoke('check-network-config'),
  checkSmartStatus: () => ipcRenderer.invoke('check-smart-status'),
  checkSystemFiles: () => ipcRenderer.invoke('check-system-files'),

  // Settings
  setStartup: (enabled: boolean) => ipcRenderer.invoke('set-startup', enabled),
  getStartup: () => ipcRenderer.invoke('get-startup'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),

  // Update system
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: (url: string) => ipcRenderer.invoke('download-update', url),
  installUpdate: (filePath: string) => ipcRenderer.invoke('install-update', filePath),

  // IPC events
  on: (channel: string, listener: (...args: unknown[]) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, ...args: unknown[]) =>
      listener(...args)
    ipcRenderer.on(channel, subscription)
    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
  off: (channel: string, listener: (...args: unknown[]) => void) => {
    ipcRenderer.off(channel, listener)
  },
}

contextBridge.exposeInMainWorld('zynvaultAPI', api)
