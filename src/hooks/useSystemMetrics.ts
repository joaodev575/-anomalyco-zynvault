import { useState, useEffect, useCallback, useRef } from 'react'
import { getRefreshInterval, isLiveMetricsEnabled } from '../lib/settings'

export interface SystemMetrics {
  cpu: {
    name: string
    cores: number
    usage: number
    speed: number
  }
  gpu: {
    name: string
    vendor: string
    usage: number
    vramTotal: number
    vramUsed: number
  }
  ram: {
    total: number
    used: number
    free: number
    percentage: number
  }
  network: {
    ip: string
    iface: string
    speed: number
  }
  disk: {
    total: number
    free: number
    used: number
    percentage: number
  } | null
  uptime: number
  system: {
    hostname: string
    platform: string
    release: string
    arch: string
    windowsVersion: string
  }
}

export interface SystemMetricsState {
  data: SystemMetrics | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const MOCK_DATA: SystemMetrics = {
  cpu: { name: 'N/A (Electron required)', cores: 0, usage: 0, speed: 0 },
  gpu: { name: 'N/A', vendor: 'N/A', usage: 0, vramTotal: 0, vramUsed: 0 },
  ram: { total: 0, used: 0, free: 0, percentage: 0 },
  network: { ip: 'N/A', iface: 'N/A', speed: 0 },
  disk: null,
  uptime: 0,
  system: { hostname: 'N/A', platform: 'N/A', release: 'N/A', arch: 'N/A', windowsVersion: 'N/A' },
}

const DEFAULT_INTERVAL = 10000

export function useSystemMetrics(defaultInterval = DEFAULT_INTERVAL) {
  const [state, setState] = useState<SystemMetricsState>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null,
  })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef = useRef(true)

  const fetchMetrics = useCallback(async () => {
    if (!isLiveMetricsEnabled()) {
      setState(prev => ({ ...prev, loading: false, data: MOCK_DATA, error: 'Monitoramento desativado nas configuracoes' }))
      return
    }

    if (!window.zynvaultAPI) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'API not available',
        data: MOCK_DATA,
      }))
      return
    }

    try {
      const [systemInfo, diskInfo] = await Promise.all([
        window.zynvaultAPI.getSystemInfo(),
        window.zynvaultAPI.getDiskInfo(),
      ])

      if (!mountedRef.current) return

      setState({
        data: {
          cpu: systemInfo.cpu,
          gpu: systemInfo.gpu,
          ram: {
            total: systemInfo.ram.total,
            used: systemInfo.ram.used,
            free: systemInfo.ram.free,
            percentage: systemInfo.ram.percentage,
          },
          network: systemInfo.network,
          disk: diskInfo,
          uptime: systemInfo.uptime,
          system: systemInfo.system,
        },
        loading: false,
        error: null,
        lastUpdated: new Date(),
      })
    } catch (err) {
      if (!mountedRef.current) return
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to get system data',
      }))
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    fetchMetrics()

    const interval = getRefreshInterval() || defaultInterval
    intervalRef.current = setInterval(fetchMetrics, Math.max(interval, 10000))

    return () => {
      mountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchMetrics, defaultInterval])

  const refresh = useCallback(() => {
    setState(prev => ({ ...prev, loading: true }))
    fetchMetrics()
  }, [fetchMetrics])

  return {
    ...state,
    refresh,
    formatBytes,
    formatUptime,
  }
}
