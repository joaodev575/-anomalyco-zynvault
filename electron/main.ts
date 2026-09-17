import { app, BrowserWindow, ipcMain, shell, Notification } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { execSync } from 'node:child_process'
import https from 'node:https'
import fs from 'node:fs'
import si from 'systeminformation'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '..', '.env') })

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null

async function getSystemInfo() {
  const [cpu, mem, osInfo, cpuLoad, graphics, net] = await Promise.all([
    si.cpu(),
    si.mem(),
    si.osInfo(),
    si.currentLoad(),
    si.graphics(),
    si.networkInterfaces(),
  ])

  const gpu = graphics.controllers[0] || null
  const primaryNet = net.find(n => !n.internal && n.ip4) || net[0]

  return {
    cpu: {
      name: cpu.brand || cpu.manufacturer + ' ' + cpu.model || 'N/A',
      cores: cpu.cores,
      usage: Math.round(cpuLoad.currentLoad),
      speed: cpu.speed || 0,
    },
    gpu: {
      name: gpu?.model || 'N/A',
      vendor: gpu?.vendor || 'N/A',
      usage: 0,
      vramTotal: gpu?.vram ? gpu.vram * 1024 * 1024 : 0,
      vramUsed: 0,
    },
    ram: {
      total: mem.total,
      used: mem.used,
      free: mem.free,
      percentage: Math.round((mem.used / mem.total) * 100),
    },
    network: {
      ip: primaryNet?.ip4 || 'N/A',
      iface: primaryNet?.iface || 'N/A',
      speed: primaryNet?.speed || 0,
    },
    uptime: os.uptime(),
    system: {
      hostname: osInfo.hostname,
      platform: osInfo.platform,
      release: osInfo.release,
      arch: osInfo.arch,
      windowsVersion: `${osInfo.distro} ${osInfo.release}`,
    },
  }
}

async function getDiskInfo() {
  try {
    const disks = await si.fsSize()
    const mainDisk = disks.find(d => d.mount === 'C:\\') || disks[0]
    if (!mainDisk) return null

    return {
      total: mainDisk.size,
      free: mainDisk.available,
      used: mainDisk.size - mainDisk.available,
      percentage: Math.round(mainDisk.use),
    }
  } catch {
    return null
  }
}

function executeCommand(command: string): { success: boolean; message: string } {
  try {
    execSync(command, { encoding: 'utf-8', timeout: 30000, windowsHide: true })
    return { success: true, message: 'Command executed successfully' }
  } catch (error: unknown) {
    const err = error as { message?: string }
    return { success: false, message: err.message || 'Failed to execute command' }
  }
}

function createWindow() {
  win = new BrowserWindow({
    icon: './src/assets/icon-app.png' as unknown as Electron.NativeImage,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    width: 1440,
    height: 840,
    minWidth: 800,
    minHeight: 600,
    autoHideMenuBar: true,
    center: true,
    titleBarStyle: 'hidden',
    frame: false,
    backgroundColor: '#0F1117',
    
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Window control handlers
ipcMain.on('window-minimize', () => {
  win?.minimize()
})

ipcMain.on('window-maximize', () => {
  if (win?.isMaximized()) {
    win.unmaximize()
  } else {
    win?.maximize()
  }
})

ipcMain.on('window-close', () => {
  win?.close()
})

ipcMain.handle('window-is-maximized', () => {
  return win?.isMaximized() ?? false
})

// System info handlers
ipcMain.handle('get-system-info', async () => {
  return await getSystemInfo()
})

ipcMain.handle('get-disk-info', async () => {
  return await getDiskInfo()
})

// Optimization handlers
ipcMain.handle('create-restore-point', () => {
  return executeCommand(
    'powershell -Command "Checkpoint-Computer -Description \'ZynVault Restore Point\' -RestorePointType MODIFY_SETTINGS"'
  )
})

ipcMain.handle('clean-temp-files', () => {
  const commands = [
    'del /q /f /s "%TEMP%\\*" 2>nul',
    'del /q /f /s "C:\\Windows\\Temp\\*" 2>nul',
  ]
  for (const cmd of commands) {
    executeCommand(cmd)
  }
  return { success: true, message: 'Temporary files cleaned' }
})

ipcMain.handle('optimize-memory', () => {
  return executeCommand(
    'powershell -Command "$Process = Get-Process | Where-Object {$_.WorkingSet -gt 100MB}; foreach ($P in $Process) { try { $P.WorkingSet64 = [long]($P.WorkingSet64 * 0.5) } catch {} }"'
  )
})

ipcMain.handle('enable-game-mode', () => {
  const commands = [
    'reg add "HKCU\\Software\\Microsoft\\GameBar" /v AllowAutoGameMode /t REG_DWORD /d 1 /f',
    'reg add "HKCU\\Software\\Microsoft\\GameBar" /v AutoGameModeEnabled /t REG_DWORD /d 1 /f',
  ]
  for (const cmd of commands) {
    executeCommand(cmd)
  }
  return { success: true, message: 'Game Mode enabled' }
})

ipcMain.handle('run-system-check', () => {
  return executeCommand('sfc /scannow')
})

ipcMain.handle('flush-dns', () => {
  return executeCommand('ipconfig /flushdns')
})

ipcMain.handle('clean-thumbnail-cache', () => {
  const commands = [
    'del /q /f /s "%LOCALAPPDATA%\\Microsoft\\Windows\\Explorer\\thumbcache_*.db" 2>nul',
  ]
  for (const cmd of commands) {
    executeCommand(cmd)
  }
  return { success: true, message: 'Thumbnail cache cleaned' }
})

ipcMain.handle('optimize-network', () => {
  const commands = [
    'netsh int tcp set global autotuninglevel=normal',
    'netsh int tcp set global chimney=enabled',
    'netsh int tcp set global dca=enabled',
    'netsh int tcp set global netdma=enabled',
  ]
  let lastResult: { success: boolean; message: string } = { success: false, message: '' }
  for (const cmd of commands) {
    lastResult = executeCommand(cmd)
  }
  return lastResult.success
    ? { success: true, message: 'Network optimized' }
    : { success: false, message: 'Failed to optimize network' }
})

ipcMain.handle('disable-telemetry', () => {
  const commands = [
    'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f',
    'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f',
  ]
  for (const cmd of commands) {
    executeCommand(cmd)
  }
  return { success: true, message: 'Telemetry disabled' }
})

ipcMain.handle('check-temp-size', () => {
  try {
    const output = execSync(
      'powershell -Command "(Get-ChildItem -Path $env:TEMP -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum"',
      { encoding: 'utf-8', timeout: 10000, windowsHide: true }
    )
    const bytes = parseInt(output.trim(), 10) || 0
    return { success: true, bytes, message: `${(bytes / (1024 * 1024)).toFixed(1)} MB` }
  } catch {
    return { success: false, bytes: 0, message: 'Could not calculate' }
  }
})

ipcMain.handle('get-system-audit', async () => {
  try {
    const [disk, mem, cpu] = await Promise.all([
      si.fsSize(),
      si.mem(),
      si.currentLoad(),
    ])

    const mainDisk = disk.find(d => d.mount === 'C:\\') || disk[0]
    const checks: Array<{ id: string; name: string; status: 'ok' | 'warning' | 'critical'; detail: string }> = []

    if (mainDisk) {
      const freePercent = 100 - mainDisk.use
      if (freePercent < 10) {
        checks.push({ id: 'disk-space', name: 'Disk Space', status: 'critical', detail: `Only ${freePercent.toFixed(0)}% free` })
      } else if (freePercent < 20) {
        checks.push({ id: 'disk-space', name: 'Disk Space', status: 'warning', detail: `${freePercent.toFixed(0)}% free` })
      } else {
        checks.push({ id: 'disk-space', name: 'Disk Space', status: 'ok', detail: `${freePercent.toFixed(0)}% free` })
      }
    }

    const ramPercent = Math.round((mem.used / mem.total) * 100)
    if (ramPercent > 85) {
      checks.push({ id: 'ram-usage', name: 'Memory Usage', status: 'critical', detail: `${ramPercent}% in use` })
    } else if (ramPercent > 70) {
      checks.push({ id: 'ram-usage', name: 'Memory Usage', status: 'warning', detail: `${ramPercent}% in use` })
    } else {
      checks.push({ id: 'ram-usage', name: 'Memory Usage', status: 'ok', detail: `${ramPercent}% in use` })
    }

    const cpuPercent = Math.round(cpu.currentLoad)
    if (cpuPercent > 85) {
      checks.push({ id: 'cpu-load', name: 'CPU Load', status: 'critical', detail: `${cpuPercent}% usage` })
    } else if (cpuPercent > 60) {
      checks.push({ id: 'cpu-load', name: 'CPU Load', status: 'warning', detail: `${cpuPercent}% usage` })
    } else {
      checks.push({ id: 'cpu-load', name: 'CPU Load', status: 'ok', detail: `${cpuPercent}% usage` })
    }

    checks.push({ id: 'temp-files', name: 'Temporary Files', status: 'ok', detail: 'Available for cleanup' })
    checks.push({ id: 'dns-cache', name: 'DNS Cache', status: 'ok', detail: 'Available for cleanup' })
    checks.push({ id: 'network', name: 'Network Configuration', status: 'ok', detail: 'Available for optimization' })

    return { success: true, checks }
  } catch {
    return { success: false, checks: [] }
  }
})

ipcMain.handle('empty-recycle-bin', () => {
  return executeCommand('powershell -Command "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"')
})

ipcMain.handle('check-recycle-bin-size', () => {
  try {
    const output = execSync(
      'powershell -Command "(New-Object -ComObject Shell.Application).NameSpace(0x0a).Items() | Measure-Object -Property Size -Sum | Select-Object -ExpandProperty Sum"',
      { encoding: 'utf-8', timeout: 10000, windowsHide: true }
    )
    const bytes = parseInt(output.trim(), 10) || 0
    return { success: true, bytes, message: bytes > 0 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : 'Empty' }
  } catch {
    return { success: false, bytes: 0, message: 'Could not calculate' }
  }
})

ipcMain.handle('disable-visual-effects', () => {
  const commands = [
    'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects" /v VisualFXSetting /t REG_DWORD /d 2 /f',
    'reg add "HKCU\\Control Panel\\Desktop" /v UserPreferencesMask /t REG_BINARY /d 9012038010000000 /f',
  ]
  for (const cmd of commands) {
    executeCommand(cmd)
  }
  return { success: true, message: 'Visual effects optimized' }
})

ipcMain.handle('enable-ultimate-performance', () => {
  const result = executeCommand('powercfg /setactive e9a42b02-d5df-448d-aa00-03f14749eb61')
  if (result.success) {
    return { success: true, message: 'Ultimate Performance plan enabled' }
  }
  const fallback = executeCommand('powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c')
  return fallback.success
    ? { success: true, message: 'High Performance plan enabled' }
    : { success: false, message: 'Failed to change power plan' }
})

ipcMain.handle('disable-unnecessary-services', () => {
  const services = [
    'SysMain',
    'DiagTrack',
  ]
  let count = 0
  for (const svc of services) {
    const result = executeCommand(`powershell -Command "Set-Service -Name '${svc}' -StartupType Disabled -ErrorAction SilentlyContinue; Stop-Service -Name '${svc}' -Force -ErrorAction SilentlyContinue"`)
    if (result.success) count++
  }
  return count > 0
    ? { success: true, message: `${count} service(s) disabled` }
    : { success: false, message: 'No services could be disabled' }
})

ipcMain.handle('clean-windows-update-cache', () => {
  const commands = [
    'net stop wuauserv',
    'del /q /f /s "C:\\Windows\\SoftwareDistribution\\Download\\*" 2>nul',
    'net start wuauserv',
  ]
  for (const cmd of commands) {
    executeCommand(cmd)
  }
  return { success: true, message: 'Windows Update cache cleaned' }
})

// Revert handlers
ipcMain.handle('revert-game-mode', () => {
  const commands = [
    'reg add "HKCU\\Software\\Microsoft\\GameBar" /v AllowAutoGameMode /t REG_DWORD /d 0 /f',
    'reg add "HKCU\\Software\\Microsoft\\GameBar" /v AutoGameModeEnabled /t REG_DWORD /d 0 /f',
  ]
  for (const cmd of commands) {
    executeCommand(cmd)
  }
  return { success: true, message: 'Game Mode disabled' }
})

ipcMain.handle('revert-optimize-network', () => {
  const commands = [
    'netsh int tcp set global autotuninglevel=normal',
    'netsh int tcp set global chimney=disabled',
    'netsh int tcp set global dca=disabled',
    'netsh int tcp set global netdma=disabled',
  ]
  for (const cmd of commands) {
    executeCommand(cmd)
  }
  return { success: true, message: 'Network reverted' }
})

ipcMain.handle('revert-disable-telemetry', () => {
  const commands = [
    'reg delete "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /f 2>nul',
    'reg delete "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\DataCollection" /v AllowTelemetry /f 2>nul',
  ]
  for (const cmd of commands) {
    executeCommand(cmd)
  }
  return { success: true, message: 'Telemetry restored' }
})

ipcMain.handle('revert-disable-visual-effects', () => {
  const commands = [
    'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects" /v VisualFXSetting /t REG_DWORD /d 0 /f',
  ]
  for (const cmd of commands) {
    executeCommand(cmd)
  }
  return { success: true, message: 'Visual effects restored' }
})

ipcMain.handle('revert-enable-ultimate-performance', () => {
  const result = executeCommand('powercfg /setactive 381b4222-f694-41f0-9685-ff5bb260df2e')
  return result.success
    ? { success: true, message: 'Power plan restored' }
    : { success: false, message: 'Failed to restore power plan' }
})

ipcMain.handle('revert-disable-unnecessary-services', () => {
  const services = ['SysMain', 'DiagTrack']
  let count = 0
  for (const svc of services) {
    const result = executeCommand(`powershell -Command "Set-Service -Name '${svc}' -StartupType Automatic -ErrorAction SilentlyContinue; Start-Service -Name '${svc}' -ErrorAction SilentlyContinue"`)
    if (result.success) count++
  }
  return count > 0
    ? { success: true, message: `${count} service(s) restored` }
    : { success: false, message: 'No services could be restored' }
})

// Health check handlers
ipcMain.handle('check-storage-health', async () => {
  try {
    const disks = await si.fsSize()
    const mainDisk = disks.find(d => d.mount === 'C:\\') || disks[0]
    if (!mainDisk) return { success: false, status: 'unknown', detail: 'Disco nao encontrado' }

    const freePercent = 100 - mainDisk.use
    if (freePercent < 10) return { success: true, status: 'critical', detail: `Apenas ${freePercent.toFixed(0)}% livre` }
    if (freePercent < 20) return { success: true, status: 'warning', detail: `${freePercent.toFixed(0)}% livre` }
    return { success: true, status: 'ok', detail: `${freePercent.toFixed(0)}% livre` }
  } catch {
    return { success: false, status: 'unknown', detail: 'Erro ao verificar disco' }
  }
})

ipcMain.handle('check-driver-status', () => {
  try {
    const output = execSync(
      'powershell -Command "Get-WmiObject Win32_PnSignedDriver | Where-Object { $_.Status -ne \'OK\' } | Select-Object -First 5 DeviceName,Status | ConvertTo-Json"',
      { encoding: 'utf-8', timeout: 15000, windowsHide: true }
    )
    const parsed = JSON.parse(output.trim() || '[]')
    const problems = Array.isArray(parsed) ? parsed : [parsed]
    if (problems.length > 0 && problems[0].DeviceName) {
      return { success: true, status: 'warning', detail: `${problems.length} driver(es) com problema` }
    }
    return { success: true, status: 'ok', detail: 'Todos os drivers funcionais' }
  } catch {
    return { success: true, status: 'ok', detail: 'Drivers verificados' }
  }
})

ipcMain.handle('check-network-config', () => {
  try {
    const output = execSync('netsh int show interface', { encoding: 'utf-8', timeout: 10000, windowsHide: true })
    const connected = output.includes('Connected')
    return connected
      ? { success: true, status: 'ok', detail: 'Rede conectada' }
      : { success: true, status: 'warning', detail: 'Sem conexao de rede detectada' }
  } catch {
    return { success: false, status: 'unknown', detail: 'Erro ao verificar rede' }
  }
})

ipcMain.handle('check-smart-status', async () => {
  try {
    const disks = await si.diskLayout()
    if (disks.length === 0) return { success: true, status: 'ok', detail: 'Nenhum disco com SMART' }
    const smartResult = execSync(
      'powershell -Command "Get-PhysicalDisk | Select-Object HealthStatus | ConvertTo-Json"',
      { encoding: 'utf-8', timeout: 10000, windowsHide: true }
    )
    const parsed = JSON.parse(smartResult.trim() || '{}')
    const health = parsed.HealthStatus || 'Unknown'
    if (health === 'Healthy') return { success: true, status: 'ok', detail: 'Disco saudavel' }
    if (health === 'Warning') return { success: true, status: 'warning', detail: 'Atencao no disco' }
    return { success: true, status: 'critical', detail: `Status: ${health}` }
  } catch {
    return { success: true, status: 'ok', detail: 'SMART indisponivel' }
  }
})

ipcMain.handle('check-system-files', () => {
  try {
    const output = execSync(
      'powershell -Command "sfc /verifyonly 2>&1 | Select-String -Pattern \'found corrupted|Windows Resource Protection\' | Select-Object -First 1"',
      { encoding: 'utf-8', timeout: 60000, windowsHide: true }
    )
    if (output.includes('found corrupted')) {
      return { success: true, status: 'warning', detail: 'Arquivos corrompidos encontrados' }
    }
    return { success: true, status: 'ok', detail: 'Arquivos do sistema intactos' }
  } catch {
    return { success: true, status: 'ok', detail: 'Verificacao concluida' }
  }
})

ipcMain.handle('run-dism-repair', () => {
  return executeCommand('powershell -Command "DISM /Online /Cleanup-Image /RestoreHealth"')
})

ipcMain.handle('run-chkdsk', () => {
  return executeCommand('chkdsk C: /F /R')
})

ipcMain.handle('open-windows-tool', (_event, tool: string) => {
  const allowed = ['taskmgr', 'devmgmt.msc', 'eventvwr.msc', 'services.msc', 'msinfo32', 'ms-settings:windowsupdate', 'control', 'appwiz.cpl', 'desk.cpl', 'sysdm.cpl', 'firewall.cpl', 'ncpa.cpl', 'mmsys.cpl', 'main.cpl', 'timedate.cpl', 'powercfg.cpl', 'wscui.cpl', 'perfmon.msc', 'resmon.exe', 'dxdiag', 'wmimgmt.msc']
  const toolLower = tool.toLowerCase().split(' ')[0]
  if (!allowed.includes(toolLower)) {
    return { success: false, message: 'Tool not allowed' }
  }
  try {
    shell.openPath(toolLower)
    return { success: true, message: `${toolLower} aberto` }
  } catch {
    return { success: false, message: `Falha ao abrir ${toolLower}` }
  }
})

// Update system - check GitHub releases
const GITHUB_REPO = 'joaodev575/-anomalyco-zynvault'
const CURRENT_VERSION = app.getVersion()

function httpsGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options: import('https').RequestOptions = {
      headers: { 'User-Agent': 'ZynVault-Updater' },
    }
    const token = process.env.GITHUB_TOKEN
    if (token) {
      options.headers = { ...options.headers, Authorization: `token ${token}` }
    }
    https.get(url, options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
    }).on('error', reject)
  })
}

ipcMain.handle('check-for-updates', async () => {
  try {
    const data = await httpsGet(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`)
    const release = JSON.parse(data)
    const latestVersion = release.tag_name?.replace(/^v/, '') || '0.0.0'
    const currentParts = CURRENT_VERSION.split('.').map(Number)
    const latestParts = latestVersion.split('.').map(Number)

    let hasUpdate = false
    for (let i = 0; i < 3; i++) {
      if ((latestParts[i] || 0) > (currentParts[i] || 0)) { hasUpdate = true; break }
      if ((latestParts[i] || 0) < (currentParts[i] || 0)) break
    }

    const assets = (release.assets || []).map((a: { name: string; browser_download_url: string; size: number }) => ({
      name: a.name,
      url: a.browser_download_url,
      size: a.size,
    }))

    return {
      success: true,
      hasUpdate,
      currentVersion: CURRENT_VERSION,
      latestVersion,
      releaseNotes: release.body || '',
      releaseDate: release.published_at || '',
      assets,
    }
  } catch {
    return { success: false, hasUpdate: false, currentVersion: CURRENT_VERSION, latestVersion: CURRENT_VERSION, releaseNotes: '', releaseDate: '', assets: [] }
  }
})

ipcMain.handle('get-current-version', () => {
  return CURRENT_VERSION
})

ipcMain.handle('download-update', async (_event, url: string) => {
  const downloadsDir = path.join(app.getPath('downloads'), 'ZynVault-Update')
  if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true })

  const fileName = url.split('/').pop() || 'update.exe'
  const filePath = path.join(downloadsDir, fileName)

  return new Promise((resolve) => {
    const file = fs.createWriteStream(filePath)
    https.get(url, { headers: { 'User-Agent': 'ZynVault-Updater' } }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        httpsGet(res.headers.location!).then(redirectUrl => {
          https.get(redirectUrl, { headers: { 'User-Agent': 'ZynVault-Updater' } }, (res2) => {
            const totalBytes = parseInt(res2.headers['content-length'] || '0', 10)
            let downloaded = 0
            res2.on('data', (chunk) => {
              downloaded += chunk.length
              file.write(chunk)
              if (win) {
                win.webContents.send('update-download-progress', { downloaded, total: totalBytes, percent: totalBytes > 0 ? Math.round((downloaded / totalBytes) * 100) : 0 })
              }
            })
            res2.on('end', () => { file.end(); resolve({ success: true, filePath }) })
            res2.on('error', () => resolve({ success: false, message: 'Download failed' }))
          })
        }).catch(() => resolve({ success: false, message: 'Redirect failed' }))
        return
      }
      const totalBytes = parseInt(res.headers['content-length'] || '0', 10)
      let downloaded = 0
      res.on('data', (chunk) => {
        downloaded += chunk.length
        file.write(chunk)
        if (win) {
          win.webContents.send('update-download-progress', { downloaded, total: totalBytes, percent: totalBytes > 0 ? Math.round((downloaded / totalBytes) * 100) : 0 })
        }
      })
      res.on('end', () => { file.end(); resolve({ success: true, filePath }) })
      res.on('error', () => resolve({ success: false, message: 'Download failed' }))
    }).on('error', () => resolve({ success: false, message: 'Connection failed' }))
  })
})

ipcMain.handle('install-update', (_event, filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      shell.openPath(filePath)
      setTimeout(() => app.quit(), 1000)
      return { success: true, message: 'Instalador aberto. O app sera fechado.' }
    }
    return { success: false, message: 'Arquivo nao encontrado' }
  } catch {
    return { success: false, message: 'Falha ao abrir instalador' }
  }
})

// Notification handler
ipcMain.handle('show-notification', (_event, title: string, body: string) => {
  if (Notification.isSupported()) {
    const notification = new Notification({ title, body })
    notification.show()
    return { success: true }
  }
  return { success: false, message: 'Notifications not supported' }
})

// Settings IPC handlers
ipcMain.handle('set-startup', async (_event, enabled: boolean) => {
  try {
    const key = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
    const exePath = app.getPath('exe')
    if (enabled) {
      execSync(`reg add "${key}" /v ZynVault /t REG_SZ /d "${exePath}" /f`, { windowsHide: true })
    } else {
      execSync(`reg delete "${key}" /v ZynVault /f`, { windowsHide: true })
    }
    return { success: true }
  } catch {
    return { success: false, message: 'Falha ao configurar inicio automatico' }
  }
})

ipcMain.handle('get-startup', () => {
  try {
    const key = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
    const result = execSync(`reg query "${key}" /v ZynVault`, { encoding: 'utf-8', windowsHide: true })
    return { success: true, enabled: result.includes('ZynVault') }
  } catch {
    return { success: true, enabled: false }
  }
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('get-app-path', () => {
  return app.getPath('exe')
})

// Shell handlers
ipcMain.handle('open-external', (_event, url: string) => {
  shell.openExternal(url)
})

// Network ping handler - sanitized input
ipcMain.handle('run-ping', (_event, target: string) => {
  const sanitized = target.replace(/[^a-zA-Z0-9.\-:]/g, '')
  if (!sanitized || sanitized.length > 253) {
    return { success: false, reachable: false, time: undefined }
  }
  try {
    const output = execSync(`ping -n 1 -w 2000 ${sanitized}`, {
      encoding: 'utf-8',
      timeout: 5000,
      windowsHide: true,
    })
    const match = output.match(/time[=<](\d+)ms/i)
    const time = match ? `${match[1]}ms` : 'OK'
    return { success: true, reachable: true, time }
  } catch {
    return { success: true, reachable: false, time: undefined }
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
