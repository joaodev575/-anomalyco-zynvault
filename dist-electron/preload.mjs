"use strict";
const electron = require("electron");
const api = {
  // Window controls
  windowMinimize: () => electron.ipcRenderer.send("window-minimize"),
  windowMaximize: () => electron.ipcRenderer.send("window-maximize"),
  windowClose: () => electron.ipcRenderer.send("window-close"),
  windowIsMaximized: () => electron.ipcRenderer.invoke("window-is-maximized"),
  // System info
  getSystemInfo: () => electron.ipcRenderer.invoke("get-system-info"),
  getDiskInfo: () => electron.ipcRenderer.invoke("get-disk-info"),
  // Optimizations
  createRestorePoint: () => electron.ipcRenderer.invoke("create-restore-point"),
  cleanTempFiles: () => electron.ipcRenderer.invoke("clean-temp-files"),
  optimizeMemory: () => electron.ipcRenderer.invoke("optimize-memory"),
  enableGameMode: () => electron.ipcRenderer.invoke("enable-game-mode"),
  runSystemCheck: () => electron.ipcRenderer.invoke("run-system-check"),
  flushDns: () => electron.ipcRenderer.invoke("flush-dns"),
  cleanThumbnailCache: () => electron.ipcRenderer.invoke("clean-thumbnail-cache"),
  optimizeNetwork: () => electron.ipcRenderer.invoke("optimize-network"),
  disableTelemetry: () => electron.ipcRenderer.invoke("disable-telemetry"),
  checkTempSize: () => electron.ipcRenderer.invoke("check-temp-size"),
  getSystemAudit: () => electron.ipcRenderer.invoke("get-system-audit"),
  emptyRecycleBin: () => electron.ipcRenderer.invoke("empty-recycle-bin"),
  checkRecycleBinSize: () => electron.ipcRenderer.invoke("check-recycle-bin-size"),
  disableVisualEffects: () => electron.ipcRenderer.invoke("disable-visual-effects"),
  enableUltimatePerformance: () => electron.ipcRenderer.invoke("enable-ultimate-performance"),
  disableUnnecessaryServices: () => electron.ipcRenderer.invoke("disable-unnecessary-services"),
  cleanWindowsUpdateCache: () => electron.ipcRenderer.invoke("clean-windows-update-cache"),
  revertGameMode: () => electron.ipcRenderer.invoke("revert-game-mode"),
  revertOptimizeNetwork: () => electron.ipcRenderer.invoke("revert-optimize-network"),
  revertDisableTelemetry: () => electron.ipcRenderer.invoke("revert-disable-telemetry"),
  revertDisableVisualEffects: () => electron.ipcRenderer.invoke("revert-disable-visual-effects"),
  revertEnableUltimatePerformance: () => electron.ipcRenderer.invoke("revert-enable-ultimate-performance"),
  revertDisableUnnecessaryServices: () => electron.ipcRenderer.invoke("revert-disable-unnecessary-services"),
  // System repair
  runDismRepair: () => electron.ipcRenderer.invoke("run-dism-repair"),
  runChkdsk: () => electron.ipcRenderer.invoke("run-chkdsk"),
  openWindowsTool: (tool) => electron.ipcRenderer.invoke("open-windows-tool", tool),
  // Notifications
  showNotification: (title, body) => electron.ipcRenderer.invoke("show-notification", title, body),
  // Shell
  openExternal: (url) => electron.ipcRenderer.invoke("open-external", url),
  // Network
  runPing: (target) => electron.ipcRenderer.invoke("run-ping", target),
  // Health checks
  checkStorageHealth: () => electron.ipcRenderer.invoke("check-storage-health"),
  checkDriverStatus: () => electron.ipcRenderer.invoke("check-driver-status"),
  checkNetworkConfig: () => electron.ipcRenderer.invoke("check-network-config"),
  checkSmartStatus: () => electron.ipcRenderer.invoke("check-smart-status"),
  checkSystemFiles: () => electron.ipcRenderer.invoke("check-system-files"),
  // Settings
  setStartup: (enabled) => electron.ipcRenderer.invoke("set-startup", enabled),
  getStartup: () => electron.ipcRenderer.invoke("get-startup"),
  getAppVersion: () => electron.ipcRenderer.invoke("get-app-version"),
  getAppPath: () => electron.ipcRenderer.invoke("get-app-path"),
  // Update system
  checkForUpdates: () => electron.ipcRenderer.invoke("check-for-updates"),
  downloadUpdate: (url) => electron.ipcRenderer.invoke("download-update", url),
  installUpdate: (filePath) => electron.ipcRenderer.invoke("install-update", filePath),
  // IPC events
  on: (channel, listener) => {
    const subscription = (_event, ...args) => listener(...args);
    electron.ipcRenderer.on(channel, subscription);
    return () => {
      electron.ipcRenderer.removeListener(channel, subscription);
    };
  },
  off: (channel, listener) => {
    electron.ipcRenderer.off(channel, listener);
  }
};
electron.contextBridge.exposeInMainWorld("zynvaultAPI", api);
